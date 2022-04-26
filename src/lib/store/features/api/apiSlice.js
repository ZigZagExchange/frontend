import { createSlice, createAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { formatPrice } from "lib/utils";
import api from "lib/api";

const makeScope = (state) => `${state.network}-${state.userId}`;

export const apiSlice = createSlice({
  name: "api",
  initialState: {
    network: 1,
    userId: null,
    currentMarket: "ETH-USDC",
    marketFills: {},
    bridgeReceipts: [],
    lastPrices: {},
    marketSummary: {},
    marketinfo: null,
    balances: {},
    liquidity: [],
    userOrders: {},
    userFills: {},
    orders: {},
    arweaveAllocation: 0,
  },
  reducers: {
    _error(state, { payload }) {
      const op = payload[0];
      const errorMessage = payload[1];
      const renderToastContent = () => {
        return (
          <>
            An unknown error has occurred while processing '{op}' ({errorMessage}). Please{" "}
            <a
              href={"https://info.zigzag.exchange/#contact"}
              style={{
                color: "white",
                textDecoration: "underline",
                fontWeight: "bold",
              }}
              target="_blank"
              rel="noreferrer"
            >
              contact us
            </a>
            {" "}or join the{" "}
            <a
              href={"https://discord.gg/zigzag"}
              style={{
                color: "white",
                textDecoration: "underline",
                fontWeight: "bold",
              }}
              target="_blank"
              rel="noreferrer"
            >
              Discord
            </a>
            {" "}to report and solve this bug.
          </>
        );
      };
      const toastContent = renderToastContent(op, errorMessage)
      toast.error(toastContent,
        { toastId: op,
          closeOnClick: false,
          autoClose: false,
        },
      );
    },
    _marketinfo(state, { payload }) {
      if (payload[0].error) {
        console.error(payload[0]);
      } else {
        state.marketinfo = payload[0];
      }
    },
    _fills(state, { payload }) {
      payload[0].forEach((fill) => {
        const fillid = fill[1];
        if (fill[2] === state.currentMarket && fill[0] === state.network) {
          state.marketFills[fillid] = fill;
        }
        if (
          state.userId &&
          (fill[8] === state.userId.toString() ||
            fill[9] === state.userId.toString())
        ) {
          state.userFills[fillid] = fill;
        }
      });
    },
    _fillstatus(state, { payload }) {
      payload[0].forEach((update) => {
        const fillid = update[1];
        const newstatus = update[2];
        const timestamp = update[7];
        let txhash;
        let feeamount;
        let feetoken;
        if (update[3]) txhash = update[3];
        if (update[5]) feeamount = update[5];
        if (update[6]) feetoken = update[6];
        if (state.marketFills[fillid]) {
          state.marketFills[fillid][6] = newstatus;
          state.marketFills[fillid][12] = timestamp;
          if (txhash) state.marketFills[fillid][7] = txhash;
          if (feeamount) state.marketFills[fillid][10] = feeamount;
          if (feetoken) state.marketFills[fillid][11] = feetoken;
        }
        if (state.userFills[fillid]) {
          state.userFills[fillid][6] = newstatus;
          state.userFills[fillid][12] = timestamp;
          if (txhash) state.userFills[fillid][7] = txhash;
          if (feeamount) state.userFills[fillid][10] = feeamount;
          if (feetoken) state.userFills[fillid][11] = feetoken;

          if (newstatus === 'f') {
            const fillDetails = state.userFills[fillid];
            const baseCurrency = fillDetails[2].split("-")[0];
            const sideText = fillDetails[3] === "b" ? "buy" : "sell";
            const price = Number(fillDetails[4]);
            const baseQuantity = Number(fillDetails[5]);
            toast.success(
              `Your ${sideText} order for ${Number(baseQuantity.toPrecision(4))
              } ${baseCurrency} was filled @ ${Number(formatPrice(price))
              }!`,
              {
                toastId: `Your ${sideText} order for ${Number(baseQuantity.toPrecision(4))
                  } ${baseCurrency} was filled @ ${Number(formatPrice(price))
                  }!`,
              }
            );
          }
        }
      });
    },
    _marketsummary(state, { payload }) {
      state.marketSummary = {
        market: payload[0],
        price: payload[1],
        "24hi": payload[2],
        "24lo": payload[3],
        priceChange: payload[4],
        baseVolume: payload[5],
        quoteVolume: payload[6],
      };
    },
    _lastprice(state, { payload }) {
      payload[0].forEach((update) => {
        const market = update[0];
        const price = update[1];
        const change = update[2];
        state.lastPrices[market] = {
          price: update[1],
          change: update[2],
          quoteVolume: state.lastPrices[market]
            ? state.lastPrices[market].quoteVolume
            : 0,
        };
        // Sometimes lastprice doesn't have volume data
        // Keep the old data if it doesn't
        if (update[3]) {
          state.lastPrices[market].quoteVolume = update[3];
        }
        if (update[0] === state.currentMarket) {
          state.marketSummary.price = price;
          state.marketSummary.priceChange = change;
        }
      });
    },
    _liquidity2(state, { payload }) {
      if (payload[0] === state.network && payload[1] === state.currentMarket) {
        state.liquidity = state.liquidity = payload[2];
      }
    },
    _orderstatus(state, { payload }) {
      (payload[0] || []).forEach(async (update) => {
        let filledOrder;
        const [, orderId, newStatus, txHash] = update;
        switch (newStatus) {
          case "c":
            delete state.orders[orderId];
            if (state.userOrders[orderId]) {
              state.userOrders[orderId][9] = "c";
            }
            break;
          case "pm":
            const remaining = update[4];
            if (state.orders[orderId]) {
              state.orders[orderId][11] = remaining;
            }
            if (state.userOrders[orderId]) {
              state.userOrders[orderId][11] = remaining;
            }
            break;
          case "m":
            const matchedOrder = state.orders[orderId];
            if (!matchedOrder) return;
            matchedOrder[9] = "m";
            delete state.orders[orderId];
            if (
              matchedOrder &&
              state.userId &&
              matchedOrder[8] === state.userId.toString()
            ) {
              if (!state.userOrders[matchedOrder[1]]) {
                state.userOrders[matchedOrder[1]] = matchedOrder;
              }
            }
            break;
          case "f":
            filledOrder = state.userOrders[orderId];
            if (filledOrder) {
              filledOrder[9] = "f";
              filledOrder[10] = txHash;
            }
            break;
          case "b":
            filledOrder = state.userOrders[orderId];
            if (filledOrder) {
              filledOrder[9] = "b";
              filledOrder[10] = txHash;
            }
            break;
          case "r":
            filledOrder = state.userOrders[orderId];
            if (filledOrder) {
              const sideText = filledOrder[3] === "b" ? "buy" : "sell";
              const error = update[4];
              const baseCurrency = filledOrder[2].split("-")[0];
              filledOrder[9] = "r";
              filledOrder[10] = txHash;
              const noFeeOrder = api.getOrderDetailsWithoutFee(filledOrder);
              toast.error(
                `Your ${sideText} order for ${noFeeOrder.baseQuantity.toPrecision(4) / 1
                } ${baseCurrency} @ ${noFeeOrder.price.toPrecision(4) / 1
                } was rejected: ${error}`,
                {
                  toastId: `Your ${sideText} order for ${noFeeOrder.baseQuantity.toPrecision(4) / 1
                    } ${baseCurrency} @ ${noFeeOrder.price.toPrecision(4) / 1
                    } was rejected: ${error}`,
                }
              );
              toast.info(
                `This happens occasionally. Run the transaction again and you should be fine.`,
                {
                  toastId: `This happens occasionally. Run the transaction again and you should be fine.`,
                }
              );
            }
            break;
          case "e":
            if (state.userOrders[orderId]) {
              state.userOrders[orderId][9] = "e";
            }
            if (state.orders[orderId]) {
              state.orders[orderId][9] = "e";
            }
            break;
          default:
            break;
        }
      });
    },
    _orders(state, { payload }) {
      const orders = payload[0]
        .filter(
          (order) =>
            order[2] === state.currentMarket && order[0] === state.network
        )
        .reduce((res, order) => {
          res[order[1]] = order;
          return res;
        }, {});

      state.orders = {
        ...state.orders,
        ...orders,
      };

      if (state.userId) {
        for (let i in orders) {
          if (orders[i][8] === state.userId.toString()) {
            const orderId = orders[i][1];
            state.userOrders[orderId] = orders[i];
          }
        }
      }
    },
    setBalances(state, { payload }) {
      const scope = makeScope(state);
      state.balances[scope] = state.balances[scope] || {};
      state.balances[scope] = {
        ...state.balances[scope],
        [payload.key]: {
          ...(state.balances[scope][payload.key] || {}),
          ...payload.balances,
        },
      };
    },
    setCurrentMarket(state, { payload }) {
      if (state.currentMarket !== payload) {
        state.currentMarket = payload;
        state.marketFills = {};
        state.marketSummary = {};
        state.liquidity = [];
        state.orders = {};
      }
    },
    setUserId(state, { payload }) {
      state.userId = payload;
    },
    setNetwork(state, { payload }) {
      state.network = payload;
    },
    clearBridgeReceipts(state) {
      state.bridgeReceipts = [];
    },
    addBridgeReceipt(state, { payload }) {
      if (!payload || !payload.txId) return;
      const { amount, token, txUrl, type, walletAddress } = payload;

      const renderBridgeLink = (text, link) => {
        return (
          <a
            href={link}
            style={{
              color: "white",
              textDecoration: "underline",
              fontWeight: "bold",
            }}
            target="_blank"
            rel="noreferrer"
          >
            {text}
          </a>
        );
      };

      let successMsg, targetMsg, extraInfoLink, ethWallet;
      switch (type) {
        case "deposit":
          successMsg = "deposited";
          targetMsg = "in your zkSync wallet";
          extraInfoLink = null;
          break;
        case "withdraw":
          successMsg = "withdrew";
          targetMsg = "into your Ethereum wallet. Withdraws can take up to 7 hours to complete";
          extraInfoLink = { text: "Bridge FAQ", link: "https://docs.zigzag.exchange/zksync/bridge-guide" };
          break;
        case "withdraw_fast":
          successMsg = "withdrew";
          targetMsg = "into your Ethereum wallet. Fast withdrawals should be confirmed within a few minutes";
          extraInfoLink = { text: "Fast Bridge FAQ", link: "https://docs.zigzag.exchange/zksync/fast-withdraw-bridge" };
          ethWallet = {text: "Ethereum wallet", link: state.network === 1?`https://etherscan.io/address/${walletAddress}`:`https://rinkeby.etherscan.io/address/${walletAddress}`}
          break;
        case "zkSync_to_polygon":
          successMsg = "transferred";
          targetMsg = "to Polygon:";
          extraInfoLink = null;
          break;
        case "polygon_to_zkSync":
        case "eth_to_zksync":
          successMsg = "transferred";
          targetMsg = "to zkSync:";
          extraInfoLink = null;
          break;
        default:
          successMsg = "transferred";
          targetMsg = "to your wallet";
          extraInfoLink = null;
          break;
      }

      const renderToastContent = () => {
        return (
          <>
            Successfully {successMsg}{" "}
            {amount} {token}{" "}
            {targetMsg}
            {type !== "zkSync_to_polygon" && type !== "eth_to_zksync" && type !== "polygon_to_zkSync" &&
              <>
              <br />
              <br />
              </>
            }
            <a
              href={txUrl}
              style={{
                color: "white",
                textDecoration: "underline",
                fontWeight: "bold",
              }}
              target="_blank"
              rel="noreferrer"
            >
              View transaction
            </a>
            {type === "withdraw_fast" ? <br /> : " • "}
            {(type === "eth_to_zksync" || type === "zkSync_to_polygon" || type === "polygon_to_zkSync")&& 
              <>
                <br />
                Confirm that your funds have arrived {targetMsg}
                <a 
                  href={walletAddress} 
                  rel="noreferrer" 
                  target="_blank"
                  style={{
                    color: "white",
                    textDecoration: "underline",
                    fontWeight: "bold",
                  }}
                > {type === "zkSync_to_polygon" ? 'Polygon wallet':' zkSync wallet'} </a>
                {" • "}
              </>
            }
            { 
              extraInfoLink &&
              renderBridgeLink(
                extraInfoLink.text,
                extraInfoLink.link
              )
            }
            <br />
            { ethWallet && 
              renderBridgeLink(
                ethWallet.text,
                ethWallet.link
              )
            }
          </>
        );
      };

      toast.success(
        renderToastContent(),
        {
          closeOnClick: false,
          autoClose: 15000,
        },
      );

      state.bridgeReceipts.unshift(payload);
    },
    resetData(state) {
      state.marketinfo = null;
      state.marketFills = {};
      state.marketSummary = {};
      state.orders = {};
      state.liquidity = [];
    },
    clearUserOrders(state) {
      state.userOrders = {};
      state.userFills = {};
    },
    clearLastPrices(state) {
      state.lastPrices = {};
    },
    setArweaveAllocation(state, { payload }) {
      state.arweaveAllocation = payload;
    },
  },
});

export const {
  setNetwork,
  clearBridgeReceipts,
  setBalances,
  setUserId,
  addBridgeReceipt,
  setCurrentMarket,
  resetData,
  clearUserOrders,
  clearLastPrices,
  setArweaveAllocation,
} = apiSlice.actions;

export const networkSelector = (state) => state.api.network;
export const userOrdersSelector = (state) => state.api.userOrders;
export const userFillsSelector = (state) => state.api.userFills;
export const allOrdersSelector = (state) => state.api.orders;
export const marketFillsSelector = (state) => state.api.marketFills;
export const lastPricesSelector = (state) => state.api.lastPrices;
export const marketSummarySelector = (state) => state.api.marketSummary;
export const liquiditySelector = (state) => state.api.liquidity;
export const currentMarketSelector = (state) => state.api.currentMarket;
export const bridgeReceiptsSelector = (state) => state.api.bridgeReceipts;
export const marketInfoSelector = (state) => state.api.marketinfo;
export const arweaveAllocationSelector = (state) => state.api.arweaveAllocation;
export const balancesSelector = (state) =>
  state.api.balances[makeScope(state.api)] || {};

export const handleMessage = createAction("api/handleMessage");

export default apiSlice.reducer;
