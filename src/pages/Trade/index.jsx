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
          toast.info("Sign again to broadcast order...");
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
            const user = await getAccountState();
            newstate.user = user;
          } else {
            toast.error(swap.error.message);
          }
          this.setState(newstate);
          break;
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
    window.ethereum.on("accountsChanged", (accounts) => {
      const newState = { ...this.state };
      newState.user = {};
      this.setState(newState);
    });
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
    if (this.state.user.address) {
      try {
        console.log(data.order);
        await sendfillrequest(data.order);
      } catch (e) {
        console.log(e);
        toast.error(e.message);
      }
    }
    else {
        toast.error("Must be logged in to fill orders");
    }
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
      const orderrow = {
        td1: order[4],
        td2: order[5],
        td3: order[4] * order[5],
        side: order[3],
        order: order,
      };
      if (parseInt(order[8]) === this.state.user.id) {
        useropenorders.push(order);
      } else {
        openOrdersData.push(orderrow);
      }
      if (order[3] === "b") {
        orderbookBids.push(orderrow);
      } else if (order[3] === "s") {
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
