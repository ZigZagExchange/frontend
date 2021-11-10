import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import TradeChart from "../../components/Chart/TradeChart/TradeChart";
import TradeHead from "../../components/TradeComponents/TradeHead/TradeHead";
import TradePriceHead from "../../components/TradeComponents/TradePriceHead/TradePriceHead";
import TradePriceTable from "../../components/TradeComponents/TradePriceTable/TradePriceTable";

// Layout
import Header from "../../layout/header/Header";
import Footer from "../../layout/Footer/Footer";

// css
import "./style.css";
import TradePriceBtcTable from "../../components/TradeComponents/TradePriceBtcTable/TradePriceBtcTable";

// import TradePriceBtcHead from "../../components/TradeComponents/TradePriceBtcHead/TradePriceBtcHead";
import TradePriceHeadSecond from "../../components/TradeComponents/TradePriceHeadSecond/TradePriceHeadSecond";
import SpotBox from "../../components/TradeComponents/SpotBox/SpotBox";
import TradePriceHeadThird from "../../components/TradeComponents/TradePriceHeadThird/TradePriceHeadThird";

// Helpers
import {
  zigzagws,
  sendfillrequest,
  signinzksync,
  broadcastfill,
  getAccountState,
} from "../../helpers";

class Trade extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chainId: 1,
      user: {},
      fills: [],
      marketSummary: {},
      lastPrices: {},
      openorders: [],
      liquidity: [],
      currentMarket: "ETH-USDT",
    };
  }

  componentDidMount() {
    zigzagws.addEventListener("message", async (e) => {
      console.log(e.data);
      const msg = JSON.parse(e.data);
      let newstate;
      switch (msg.op) {
        case "openorders":
          newstate = { ...this.state };
          const openorders = msg.args[0];
          newstate.openorders.push(...openorders);
          this.setState(newstate);
          break;
        case "marketsummary":
          this.setState({
            ...this.state,
            marketSummary: {
              market: msg.args[0],
              price: msg.args[1],
              "24hi": msg.args[2],
              "24lo": msg.args[3],
              priceChange: msg.args[4],
              baseVolume: msg.args[5],
              quoteVolume: msg.args[6],
            },
          });
          break;
        case "lastprice":
          const priceUpdates = msg.args[0];
          newstate = { ...this.state };
          priceUpdates.forEach((update) => {
            newstate.lastPrices[update[0]] = {
              price: update[1],
              change: update[2],
            };
            if (update[0] === this.state.currentMarket) {
              newstate.marketSummary.price = update[1];
              newstate.marketSummary.priceChange = update[2];
            }
          });
          this.setState(newstate);
          break;
        case "liquidity":
          newstate = { ...this.state };
          const liquidity = msg.args[2];
          newstate.liquidity.push(...liquidity);
          this.setState(newstate);
          break;
        case "userordermatch":
          const matchedOrderId = msg.args[0];
          const broadcastOrderToast = toast.info("Sign again to broadcast order...");
          const { success, swap } = await broadcastfill(
            msg.args[1],
            msg.args[2]
          );
          newstate = { ...this.state };
          newstate.openorders = newstate.openorders.filter(
            (order) => order[1] !== matchedOrderId
          );
          if (success) {
            toast.success("Filled: " + swap.txHash);
            newstate.fills.push(swap);
            setTimeout(async () => {
                try {
                    const user = await getAccountState();
                    newstate.user = user;
                } catch (e) {
                    console.error(e);
                }
            }, 5000);
          } else {
            toast.error(swap.error.message);
          }
          toast.dismiss(broadcastOrderToast);
          this.setState(newstate);
          break;
        case "ordermatch":
          const orderid = msg.args[1];
          const matchedorder = this.state.openorders.find(order => order[1] === orderid);
          newstate = { ...this.state };
          if (matchedorder && matchedorder[8] === this.state.user.id) {
              const side = matchedorder[3];
              const sideText = matchedorder[3] === 'b' ? "buy" : "sell";
              const baseCurrency = matchedorder[2].split('-')[0];
              const baseQuantity = matchedorder[5];
              const quoteQuantity = matchedorder[6];
              const price = matchedorder[4];
              console.log(this.state.user.committed.balances);
              const baseQuantityUnits = baseQuantity * 1e18;
              const quoteQuantityUnits = quoteQuantity * 1e6;
              const oldBaseQuantityUnits = parseFloat(newstate.user.committed.balances.ETH);
              const oldQuoteQuantityUnits = parseFloat(newstate.user.committed.balances.USDT);
              if (side === 's') {
                  newstate.user.committed.balances.ETH = (oldBaseQuantityUnits - baseQuantityUnits).toFixed(0);
                  newstate.user.committed.balances.USDT = (oldQuoteQuantityUnits + quoteQuantityUnits).toFixed(0);
              }
              else if (side === 'b') {
                  newstate.user.committed.balances.ETH = (oldBaseQuantityUnits + baseQuantityUnits).toFixed(0);
                  newstate.user.committed.balances.USDT = (oldQuoteQuantityUnits - quoteQuantityUnits).toFixed(0);
              }
              toast.success(`Your ${sideText} order for ${baseQuantity} ${baseCurrency} @ ${price} was matched!`)
          }
          newstate.openorders = this.state.openorders.filter(order => order[1] !== orderid);
          this.setState(newstate);
          // Run the balance check after 5 seconds to let the chain update
          setTimeout(async () => {
              newstate = { ...this.state };
              try {
                  const user = await getAccountState();
                  newstate.user = user;
              }
              catch (e) {
                  console.error(e);
              }
              this.setState(newstate);
          }, 5000);
          break
        case "cancelorderack":
          const canceled_ids = msg.args[0];
          newstate = { ...this.state };
          const neworders = [];
          this.state.openorders.forEach((order) => {
            if (!canceled_ids.includes(order[1])) {
              neworders.push(order);
            }
          });
          newstate.openorders = neworders;
          this.setState(newstate);
          break;
        default:
          break;
      }
    });
    zigzagws.addEventListener("open", () => {
      zigzagws.send(
        JSON.stringify({
          op: "subscribemarket",
          args: [this.state.chainId, "ETH-USDT"],
        })
      );
    });
    if (window.ethereum) {
        window.ethereum.on("accountsChanged", (accounts) => {
          const newState = { ...this.state };
          newState.user = {};
          this.setState(newState);
        });
    }
  }

  async signInHandler() {
    let syncAccountState;
    try {
      syncAccountState = await signinzksync(this.state.chainId);
    } catch (e) {
      toast.error(e.message);
      return false;
    }
    const newState = { ...this.state };
    newState.user = syncAccountState;
    this.setState(newState);
  }

  async fillOpenOrder(data) {
    if (!this.state.user.address) {
        toast.error("Must be logged in to fill orders");
        return
    }

    let baseBalance, quoteBalance;
    if (this.state.user.address) {
      baseBalance = this.state.user.committed.balances.ETH / Math.pow(10, 18);
      quoteBalance = this.state.user.committed.balances.USDT / Math.pow(10, 6);
    } else {
      baseBalance = 0;
      quoteBalance = 0;
    }
    const baseQuantity = data.order[5];
    const quoteQuantity = data.order[6];

    baseBalance = parseFloat(baseBalance);
    quoteBalance = parseFloat(quoteBalance);
    if (data.side === 'b' && isNaN(baseBalance)) {
        toast.error("No ETH balance");
        return
    }
    if (data.side ==='s' && isNaN(quoteBalance)) {
        toast.error("No USDT balance");
        return
    }
    else if (data.side === 'b'  && baseQuantity > baseBalance) {
        toast.error("Amount exceeds ETH balance");
        return
    }
    else if (data.side === 's' && quoteQuantity > quoteBalance) {
        toast.error("Total exceeds USDT balance");
        return
    }
    const orderPendingToast = toast.info("Order pending. Sign or Cancel to continue...");

    try {
      await sendfillrequest(data.order);
    } catch (e) {
      console.log(e);
      toast.error(e.message);
    }
    toast.dismiss(orderPendingToast);
  }

  updateChainId(chainId) {
    const newState = { ...this.state };
    zigzagws.send(
      JSON.stringify({
        op: "unsubscribemarket",
        args: [this.state.chainId, this.state.currentMarket],
      })
    );
    newState.openorders = [];
    newState.liquidity = [];
    newState.marketSummary = {};
    newState.chainId = chainId;
    newState.user = {};
    this.setState(newState);
    zigzagws.send(
      JSON.stringify({
        op: "subscribemarket",
        args: [newState.chainId, newState.currentMarket],
      })
    );
  }

  render() {
    const lastPriceTableData = [];
    const markets = [];
    Object.keys(this.state.lastPrices).forEach((market) => {
      markets.push(market);
      const price = this.state.lastPrices[market].price;
      const change = this.state.lastPrices[market].change;
      const pctchange = ((change / price) * 100).toFixed(2);
      lastPriceTableData.push({ td1: market, td2: price, td3: pctchange });
    });

    const openOrdersData = [];
    const orderbookBids = [];
    const orderbookAsks = [];
    const useropenorders = [];
    this.state.openorders.forEach((order) => {
      const market = order[2];
      const side = order[3];
      const price = order[4];
      const baseQuantity = order[5];
      const quoteQuantity = order[6];
      const userId = order[8];
      let spotPrice;
      try {
          spotPrice = this.state.lastPrices[market].price;
      } catch (e) {
          spotPrice = null;
      }
      const orderrow = {
        td1: price,
        td2: baseQuantity,
        td3: quoteQuantity,
        side,
        order: order,
      };
      if (parseInt(userId) === this.state.user.id) {
        useropenorders.push(order);
      } 
      // Only display Market Making orders within 2% of spot
      // No one is going to fill outside that range
      else if (spotPrice && price > spotPrice * 0.98 && price < spotPrice * 1.02) {
        openOrdersData.push(orderrow);
      }
      if (side === "b") {
        orderbookBids.push(orderrow);
      } else if (side === "s") {
        orderbookAsks.push(orderrow);
      }
    });

    this.state.liquidity.forEach((liq) => {
      const quantity = liq[0];
      const spread = liq[1];
      const side = liq[2];
      if (side === "d" || side === "b") {
        const bidPrice = this.state.marketSummary.price * (1 - spread);
        orderbookBids.push({
          td1: bidPrice,
          td2: quantity,
          td3: bidPrice * quantity,
          side: "b",
        });
      }
      if (side === "d" || side === "s") {
        const askPrice = this.state.marketSummary.price * (1 + spread);
        orderbookAsks.push({
          td1: askPrice,
          td2: quantity,
          td3: askPrice * quantity,
          side: "s",
        });
      }
    });
    orderbookAsks.sort((a, b) => b.td1 - a.td1);
    orderbookBids.sort((a, b) => b.td1 - a.td1);

    return (
      <>
        <ToastContainer position="bottom-right" theme="colored" />
        <Header
          user={this.state.user}
          signInHandler={this.signInHandler.bind(this)}
          chainId={this.state.chainId}
          updateChainId={this.updateChainId.bind(this)}
        />
        <div className="trade_section">
          <div className="trade_container">
            <div className="col-12 col-xl-6 d-flex flex-column">
              <div className="trade_left">
                <div>
                  {/* Trade Head */}
                  <TradeHead marketSummary={this.state.marketSummary} markets={markets} />
                  {/* Trade Chart */}
                  <TradeChart />
                </div>
              </div>
              <SpotBox
                initPrice={this.state.marketSummary.price}
                signInHandler={this.signInHandler.bind(this)}
                user={this.state.user}
                chainId={this.state.chainId}
              />
            </div>
            <div className="col-12 col-xl-6">
              <div className="trade_right">
                <div className="col-12 col-sm-12 col-md-12 col-lg-6">
                  <div className="trade_Price">
                    {/* Trade Price Head */}
                    <TradePriceHead />
                    {/* Trade Price Table*/}
                    <TradePriceTable
                      className="tpt_1"
                      useGradient="true"
                      priceTableData={orderbookAsks}
                      scrollToBottom="true"
                    />
                  </div>
                </div>
                <div className="col-12 col-sm-12 col-md-12 col-lg-6">
                  <div className="trade_price_btc">
                    {/* <TradePriceBtcHead /> */}
                    <TradePriceBtcTable rowData={lastPriceTableData} />
                  </div>
                </div>
                <div className="col-12 col-sm-12 col-md-12 col-lg-6">
                  <div className="trade_Price">
                    {/* Trade Price Second Head */}
                    <TradePriceHeadSecond
                      lastPrice={this.state.marketSummary.price}
                    />
                    {/* Trade Price Table*/}
                    <TradePriceTable
                      className="tpt_2"
                      useGradient="true"
                      priceTableData={orderbookBids}
                    />
                    {/* <TradeMarketActivites /> */}
                  </div>
                </div>
                <div className="col-12 col-sm-12 col-md-12 col-lg-6">
                  <div className="trade_Price trade_price2">
                    {/* Trade Price Second Head */}
                    <TradePriceHeadThird />
                    {/* Trade Price Table*/}
                    <TradePriceTable
                      className="tpt_3"
                      value="up_value"
                      priceTableData={openOrdersData}
                      onClickRow={this.fillOpenOrder.bind(this)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer openOrders={useropenorders} user={this.state.user} chainId={this.state.chainId} />
        </div>
      </>
    );
  }
}

export default Trade;
