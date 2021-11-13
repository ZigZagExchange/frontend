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

// Helpers
import {
  zigzagws,
  sendfillrequest,
  signinzksync,
  broadcastfill,
  getAccountState,
  currencyInfo
} from "../../helpers";

class Trade extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chainId: 1,
      user: {},
      marketFills: {},
      userFills: [],
      marketSummary: {},
      lastPrices: {},
      openorders: [],
      liquidity: [],
      currentMarket: "ETH-USDT",
      marketDataTab: "openorders",
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
          
          // zksync warning if more than one limit order is open
          if (this.state.user.id) {
              const containsUserOrder = openorders.find(o => o[8] === this.state.user.id.toString());
              const userOrderCount = newstate.openorders.filter(o => o[8] === this.state.user.id.toString()).length;
              if (containsUserOrder && userOrderCount > 1) {
                  toast.warn("Due to limitations of zksync 1.0, newer orders that are filled will cancel older orders. It is recommended to only have one open order at a time.", { autoClose: 15000 });
              }
          }
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
          const matchedOrderId = msg.args[1];
          const broadcastOrderToast = toast.info("Sign again to broadcast order...");
          const { success, swap } = await broadcastfill(
            msg.args[2],
            msg.args[3]
          );
          newstate = { ...this.state };
          newstate.openorders = newstate.openorders.filter(
            (order) => order[1] !== matchedOrderId
          );
          if (success) {
            toast.success("Filled: " + swap.txHash);
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
        case "orderstatus":
          newstate = { ...this.state };
          const updates = msg.args[0];
          updates.forEach(update => {
              const orderid = update[1];
              const newstatus = update[2];
              let filledorder;
              switch (newstatus) {
                  case 'c':
                      newstate.openorders = newstate.openorders.filter(order => order[1] !== orderid);
                      break
                  case 'm':
                      newstate = this.handleOrderMatch(newstate, orderid);
                      break
                  case 'f':
                      filledorder = newstate.userFills.find(order => order[1] === orderid);
                      if (filledorder) {
                          const sideText = filledorder[3] === 'b' ? "buy" : "sell";
                          const txhash = update[3];
                          const baseCurrency = filledorder[2].split('-')[0];
                          const baseQuantity = filledorder[5];
                          const price = filledorder[4];
                          filledorder[9] = 'f';
                          filledorder[10] = txhash;
                          toast.success(`Your ${sideText} order for ${baseQuantity} ${baseCurrency} @ ${price} was filled!`)
                      }
                      break
                  case 'r':
                  default:
                      filledorder = newstate.userFills.find(order => order[1] === orderid);
                      if (filledorder) {
                          const sideText = filledorder[3] === 'b' ? "buy" : "sell";
                          const txhash = update[3];
                          const error = update[4];
                          const baseCurrency = filledorder[2].split('-')[0];
                          const baseQuantity = filledorder[5];
                          const price = filledorder[4];
                          filledorder[9] = 'r';
                          filledorder[10] = txhash;
                          toast.error(`Your ${sideText} order for ${baseQuantity} ${baseCurrency} @ ${price} was rejected: ${error}`)
                      }
                      break
              }
          });
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
          args: [this.state.chainId, this.state.currentMarket],
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

  handleOrderMatch(state, orderid) {
      let newstate = { ...state }
      const matchedorder = state.openorders.find(order => order[1] === orderid);
      if (!matchedorder) {
          return newstate;
      }
      matchedorder[9] = 'm';
      const market = matchedorder[2];
      if (!newstate.marketFills[market]) {
          newstate.marketFills[market] = [];
      }
      newstate.marketFills[market].unshift(matchedorder);
      newstate.openorders = state.openorders.filter(order => order[1] !== orderid);
      if (matchedorder && state.user.id && matchedorder[8] === state.user.id.toString()) {
          newstate.userFills.unshift(matchedorder);
          const sideText = matchedorder[3] === 'b' ? "buy" : "sell";
          const side = matchedorder[3];
          const baseCurrency = matchedorder[2].split('-')[0];
          const quoteCurrency = matchedorder[2].split('-')[1];
          const baseQuantity = matchedorder[5];
          const quoteQuantity = matchedorder[6];
          const price = matchedorder[4];
          const baseQuantityUnits = baseQuantity * Math.pow(10, currencyInfo[baseCurrency].decimals);
          const quoteQuantityUnits = quoteQuantity * Math.pow(10, currencyInfo[quoteCurrency].decimals);
          const oldBaseQuantityUnits = parseFloat(newstate.user.committed.balances[baseCurrency]);
          const oldQuoteQuantityUnits = parseFloat(newstate.user.committed.balances[quoteCurrency]);
          if (side === 's') {
              newstate.user.committed.balances[baseCurrency] = (oldBaseQuantityUnits - baseQuantityUnits).toFixed(0);
              newstate.user.committed.balances[quoteCurrency] = (oldQuoteQuantityUnits + quoteQuantityUnits).toFixed(0);
          }
          else if (side === 'b') {
              newstate.user.committed.balances[baseCurrency] = (oldBaseQuantityUnits + baseQuantityUnits).toFixed(0);
              newstate.user.committed.balances[quoteCurrency] = (oldQuoteQuantityUnits - quoteQuantityUnits).toFixed(0);
          }
          toast.info(`Your ${sideText} order for ${baseQuantity} ${baseCurrency} @ ${price} was matched`)
          
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
      }

      return newstate
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

    const baseCurrency = data.order[2].split('-')[0];
    const quoteCurrency = data.order[2].split('-')[1];

    let baseBalance, quoteBalance;
    if (this.state.user.address) {
      baseBalance = this.state.user.committed.balances[baseCurrency] / Math.pow(10, 18);
      quoteBalance = this.state.user.committed.balances[quoteCurrency] / Math.pow(10, 6);
    } else {
      baseBalance = 0;
      quoteBalance = 0;
    }
    const baseQuantity = data.order[5];
    const quoteQuantity = data.order[6];

    baseBalance = parseFloat(baseBalance);
    quoteBalance = parseFloat(quoteBalance);
    if (data.side === 'b' && isNaN(baseBalance)) {
        toast.error(`No ${baseCurrency} balance`);
        return
    }
    if (data.side ==='s' && isNaN(quoteBalance)) {
        toast.error(`No ${quoteCurrency} balance`);
        return
    }
    else if (data.side === 'b'  && baseQuantity > baseBalance) {
        toast.error(`Amount exceeds ${baseCurrency} balance`);
        return
    }
    else if (data.side === 's' && quoteQuantity > quoteBalance) {
        toast.error(`Total exceeds ${quoteCurrency} balance`);
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

  updateMarketChain(chainId, market) {
    if (typeof market === "undefined") market = this.state.currentMarket;
    if (typeof chainId === "undefined") chainId = this.state.chainId;
    const newState = { ...this.state };
    zigzagws.send(
      JSON.stringify({
        op: "unsubscribemarket",
        args: [this.state.chainId, this.state.currentMarket],
      })
    );
    if (this.state.chainId !== chainId) {
        newState.user = {};
    }
    newState.openorders = [];
    newState.liquidity = [];
    newState.marketSummary = {};
    newState.chainId = chainId;
    newState.currentMarket = market;
    this.setState(newState);
    zigzagws.send(
      JSON.stringify({
        op: "subscribemarket",
        args: [newState.chainId, newState.currentMarket],
      })
    );
  }

  updateMarketDataTab (tab) {
      const newstate = { ...this.state }
      newstate.marketDataTab = tab;
      this.setState(newstate);
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

    const fillData = [];
    if (this.state.marketFills[this.state.currentMarket]) {
        this.state.marketFills[this.state.currentMarket].forEach(fill => {
            fillData.push({ td1: fill[4], td2: fill[5], td3: fill[6], side: fill[3] });
        });
    }

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

    let openOrdersLatestTradesData;
    if (this.state.marketDataTab === "openorders") {
        openOrdersLatestTradesData = openOrdersData;
    }
    else if (this.state.marketDataTab === "fills") {
        openOrdersLatestTradesData = fillData;
    }

    return (
      <>
        <ToastContainer position="bottom-right" theme="colored" />
        <Header
          user={this.state.user}
          signInHandler={this.signInHandler.bind(this)}
          chainId={this.state.chainId}
          updateMarketChain={this.updateMarketChain.bind(this)}
        />
        <div className="trade_section">
          <div className="trade_container">
            <div className="col-12 col-xl-6 d-flex flex-column">
              <div className="trade_left">
                <div>
                  {/* Trade Head */}
                  <TradeHead updateMarketChain={this.updateMarketChain.bind(this)} marketSummary={this.state.marketSummary} markets={markets} currentMarket={this.state.currentMarket} />
                  {/* Trade Chart */}
                  <TradeChart currentMarket={this.state.currentMarket} />
                </div>
              </div>
              <SpotBox
                lastPrice={this.state.marketSummary.price}
                signInHandler={this.signInHandler.bind(this)}
                user={this.state.user}
                chainId={this.state.chainId}
                currentMarket={this.state.currentMarket}
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
                      currentMarket={this.state.currentMarket}
                      scrollToBottom="true"
                    />
                  </div>
                </div>
                <div className="col-12 col-sm-12 col-md-12 col-lg-6">
                  <div className="trade_price_btc">
                    {/* <TradePriceBtcHead /> */}
                    <TradePriceBtcTable rowData={lastPriceTableData} updateMarketChain={this.updateMarketChain.bind(this)} currentMarket={this.state.currentMarket} />
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
                      currentMarket={this.state.currentMarket}
                      priceTableData={orderbookBids}
                    />
                    {/* <TradeMarketActivites /> */}
                  </div>
                </div>
                <div className="col-12 col-sm-12 col-md-12 col-lg-6">
                  <div className="trade_Price trade_price2">
                    {/* Trade Price Third Head */}
                    <div className="trade_price_head_third">
                      <strong className={this.state.marketDataTab === "openorders" ? "trade_price_active_tab" : ""} onClick={() => this.updateMarketDataTab("openorders")}>Open Orders</strong>
                      <strong className={this.state.marketDataTab === "fills" ? "trade_price_active_tab" : ""} onClick={() => this.updateMarketDataTab("fills")}>Latest Trades</strong>
                    </div>
                    {/* Trade Price Table*/}
                    <TradePriceTable
                      className="tpt_3"
                      value="up_value"
                      priceTableData={openOrdersLatestTradesData}
                      currentMarket={this.state.currentMarket}
                      onClickRow={this.fillOpenOrder.bind(this)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer userFills={this.state.userFills} openOrders={useropenorders} user={this.state.user} chainId={this.state.chainId} />
        </div>
      </>
    );
  }
}

export default Trade;
