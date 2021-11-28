import React from "react";
import { ToastContainer, toast } from "react-toastify";

// Layout
import Header from "../../layout/header/Header";
import logo from "../../assets/images/logo.png";
import SwapButton from "../../components/BridgeComponents/SwapButton/SwapButton";

// Helpers
import {
  zigzagws,
  signin,
  broadcastfill,
  getAccountState,
  getDetailsWithoutFee,
  isZksyncChain
} from "../../helpers";

// CSS
import "react-toastify/dist/ReactToastify.css";
import "./style.css";

class Bridge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chainId: 1,
      user: {},
      marketFills: [],
      userOrders: {},
      marketSummary: {},
      lastPrices: {},
      orders: {},
      liquidity: [],
      currentMarket: "ETH-USDT",
      marketDataTab: "fills",
    };
  }

  componentWillUnmount() {
    clearInterval(this._updater);
  }

  componentDidMount() {
    // Update user every 10 seconds
    this._updater = setInterval(this.updateUser.bind(this), 10000);

    zigzagws.addEventListener("message", async (e) => {
      console.log(e.data);
      const msg = JSON.parse(e.data);
      let newstate;
      switch (msg.op) {
        case "orders":
          newstate = { ...this.state };
          const orders = msg.args[0];
          orders.forEach(order => {
              if (order[2] === this.state.currentMarket && order[0] === this.state.chainId) {
                  newstate.orders[order[1]] = order;
              }
          });
          
          // zksync warning if more than one limit order is open
          if (this.state.user.id) {
              for (let i in orders) {
                  if (orders[i][8] === this.state.user.id.toString()) {
                      const orderid = orders[i][1];
                      newstate.userOrders[orderid] = orders[i];
                  }
              }
              const userOpenOrders = Object.values(newstate.userOrders).filter(o => o[9] === 'o');
              if (userOpenOrders.length > 1 && isZksyncChain(this.state.chainId)) {
                  toast.warn("Filling a new order will cancel all previous orders. It is recommended to only have one open order at a time.", { autoClose: 15000 });
              }
          }
          this.setState(newstate);
          break;
        case "fills":
          newstate = { ...this.state };
          const fillhistory = msg.args[0];
          fillhistory.forEach(fill => {
              if (fill[2] === this.state.currentMarket && fill[0] === this.state.chainId) {
                  newstate.marketFills.unshift(fill);
              }
          });
          this.setState(newstate);
          break
        case "userorders":
          newstate = { ...this.state };
          const userorders = msg.args[0];
          userorders.forEach(order => {
              newstate.userOrders[order[1]] = order;
          });
          this.setState(newstate);
          break
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
          delete newstate.orders[matchedOrderId];
          if (success) {
            toast.success("Filled: " + swap.txHash);
          } else {
            toast.error(swap.error.message);
          }
          toast.dismiss(broadcastOrderToast);
          this.setState(newstate);
          break;
        case "orderstatus":
          newstate = { ...this.state };
          const updates = msg.args[0];
          updates.forEach(async (update) => {
              const orderid = update[1];
              const newstatus = update[2];
              let filledorder;
              switch (newstatus) {
                  case 'c':
                      delete newstate.orders[orderid];
                      if (newstate.userOrders[orderid]) {
                          newstate.userOrders[orderid][9] = 'c';
                      }
                      break
                  case 'pm':
                      const remaining = update[4];
                      if (newstate.orders[orderid]) {
                          newstate.orders[orderid][11] = remaining;
                      }
                      if (newstate.userOrders[orderid]) {
                          newstate.userOrders[orderid][11] = remaining;
                      }
                      break
                  case 'm':
                      newstate = this.handleOrderMatch(newstate, orderid);
                      break
                  case 'f':
                      filledorder = newstate.userOrders[orderid];
                      if (filledorder) {
                          const txhash = update[3];
                          const sideText = filledorder[3] === 'b' ? "buy" : "sell";
                          const baseCurrency = filledorder[2].split('-')[0];
                          filledorder[9] = 'f';
                          filledorder[10] = txhash;
                          const noFeeOrder = getDetailsWithoutFee(filledorder);
                          toast.success(`Your ${sideText} order for ${noFeeOrder.baseQuantity.toPrecision(4) / 1} ${baseCurrency} @ ${noFeeOrder.price.toPrecision(4) / 1} was filled!`)
                          setTimeout(this.updateUser.bind(this), 1000);
                          setTimeout(this.updateUser.bind(this), 5000);
                      }
                      break
                  case 'b':
                      const txhash = update[3];
                      filledorder = newstate.userOrders[orderid];
                      if (filledorder) {
                          filledorder[9] = 'b';
                          filledorder[10] = txhash;
                      }
                      break
                  case 'r':
                      filledorder = newstate.userOrders[orderid];
                      if (filledorder) {
                          const sideText = filledorder[3] === 'b' ? "buy" : "sell";
                          const txhash = update[3];
                          const error = update[4];
                          const baseCurrency = filledorder[2].split('-')[0];
                          filledorder[9] = 'r';
                          filledorder[10] = txhash;
                          const noFeeOrder = getDetailsWithoutFee(filledorder);
                          toast.error(`Your ${sideText} order for ${noFeeOrder.baseQuantity.toPrecision(4) / 1} ${baseCurrency} @ ${noFeeOrder.price.toPrecision(4) / 1} was rejected: ${error}`)
                          toast.info(`This happens occasionally. Run the transaction again and you should be fine.`);
                      }
                      break
                  default:
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

  async updateUser() {
      if (this.state.user.id && this.state.chainId !== 1001) {
          const newstate = { ...this.state }
          newstate.user = await getAccountState();
          this.setState(newstate);
      }
  }

  handleOrderMatch(state, orderid) {
      let newstate = { ...state }
      const matchedorder = state.orders[orderid];
      if (!matchedorder) {
          return newstate;
      }
      matchedorder[9] = 'm';
      delete newstate.orders[orderid];
      if (matchedorder && state.user.id && matchedorder[8] === state.user.id.toString()) {
          if (!newstate.userOrders[matchedorder[1]]) {
              newstate.userOrders[matchedorder[1]] = matchedorder;
          }
      }

      return newstate
  }

  async signInHandler() {
    let syncAccountState;
    try {
      syncAccountState = await signin(this.state.chainId);
    } catch (e) {
      toast.error(e.message);
      return false;
    }
    const newState = { ...this.state };
    newState.user = syncAccountState;
    newState.user.isSignedIn = true;
    for (let orderid in newState.orders) {
        if (newState.orders[orderid][8] === newState.user.id.toString()) {
            newState.userOrders[orderid] = newState.orders[orderid];
        }
    }
    this.setState(newState);
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
        newState.userOrders = {};
    }
    newState.orders = {};
    newState.liquidity = [];
    newState.marketSummary = {};
    newState.marketFills = [];
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

  render() {
    return (
      <>
        <ToastContainer position="bottom-right" theme="colored" />
        <Header
          user={this.state.user}
          signInHandler={this.signInHandler.bind(this)}
          chainId={this.state.chainId}
          updateMarketChain={this.updateMarketChain.bind(this)}
        />
        <div className="bridge_section">
          <div className="bridge_container">
            <div className="bridge_box">
              <div className="bridge_box_top">
                <div className="bridge_coin_title">
                  <h5>FROM</h5>
                  <div className="bridge_coin_details">
                    <div className="bridge_coin_image">
                      <img alt="Logo" src={logo} />
                    </div>
                    <div className="bridge_coin_name">
                      ZigZag
                    </div>
                  </div>
                </div>
                <div className="bridge_input_box">
                  <input placeholder="0.00" type="text" />
                  <span className="bridge_input_right">
                    <a href="#max">Max</a>
                  </span>
                </div>
                <div className="bridge_coin_stats">
                  <div className="bridge_coin_stat">
                    <h5>Estimated value</h5>
                    <span>~$124.90</span>
                  </div>
                  <div className="bridge_coin_stat">
                    <h5>Available balance</h5>
                    <span>8,112.00 ZIG</span>
                  </div>
                </div>
              </div>  

              <div className="bridge_box_bottom">
                <div className="bridge_box_swap_wrapper">
                  <SwapButton />
                  <h5>Switch</h5>
                </div>

                <div className="bridge_coin_stats">
                  <div className="bridge_coin_stat">
                    <div className="bridge_coin_details">
                      
                      <div className="bridge_coin_title">
                        <h5>TO</h5>
                        <div className="bridge_coin_details">
                          <div className="bridge_coin_image">
                            <img alt="Bitcoin logo" src="https://assets.coingecko.com/coins/images/1/thumb_2x/bitcoin.png?1547033579" />
                          </div>
                          <div className="bridge_coin_name">
                            Bitcoin
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                  <div className="bridge_coin_stat">
                    <h5>Available balance</h5>
                    <span>1.00 BTC</span>
                  </div>
                </div>

                <div className="bridge_transfer_fee">
                  Estimated transfer fee: ~12.820675 ZIG
                </div>
              </div>

            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Bridge;
