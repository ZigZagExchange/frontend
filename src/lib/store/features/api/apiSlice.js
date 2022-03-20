import { createSlice, createAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
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
        let quoteVolume = update[3];
        // Sometimes lastprice doesn't have volume data
        if (!quoteVolume && state.lastPrices[market]) {
            quoteVolume = state.lastPrices[market].quoteVolume;
        }
        state.lastPrices[market] = {
          price: update[1],
          change: update[2],
          quoteVolume: update[3],
        };
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
              const sideText = filledOrder[3] === "b" ? "buy" : "sell";
              const baseCurrency = filledOrder[2].split("-")[0];
              filledOrder[9] = "f";
              filledOrder[10] = txHash;
              const noFeeOrder = api.getOrderDetailsWithoutFee(filledOrder);
              toast.success(
                `Your ${sideText} order for ${
                  noFeeOrder.baseQuantity.toPrecision(4) / 1
                } ${baseCurrency} was filled @ ${
                  noFeeOrder.price.toPrecision(4) / 1
                }!`,
                {
                  toastId: `Your ${sideText} order for ${
                    noFeeOrder.baseQuantity.toPrecision(4) / 1
                  } ${baseCurrency} was filled @ ${
                    noFeeOrder.price.toPrecision(4) / 1
                  }!`,
                }
              );
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
                `Your ${sideText} order for ${
                  noFeeOrder.baseQuantity.toPrecision(4) / 1
                } ${baseCurrency} @ ${
                  noFeeOrder.price.toPrecision(4) / 1
                } was rejected: ${error}`,
                {
                  toastId: `Your ${sideText} order for ${
                    noFeeOrder.baseQuantity.toPrecision(4) / 1
                  } ${baseCurrency} @ ${
                    noFeeOrder.price.toPrecision(4) / 1
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
      const { amount, token, txUrl, type, isFastWithdraw } = payload;

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

      const renderToastContent = () => {
        return (
          <>
            Successfully {type === "deposit" ? "deposited" : "withdrew"}{" "}
            {amount} {token}{" "}
            {type === "deposit"
              ? "in your zkSync wallet"
              : `into your Ethereum wallet. ${
                  isFastWithdraw
                    ? "Fast withdrawals should be confirmed within a few minutes"
                    : "Withdraws can take up to 7 hours to complete"
                }`}
            .
            <br />
            <br />
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
            {" • "}
            {!isFastWithdraw &&
              renderBridgeLink(
                "Bridge FAQ",
                "https://zksync.io/faq/faq.html#how-long-are-withdrawal-times"
              )}
            {isFastWithdraw &&
              renderBridgeLink(
                "Fast Bridge FAQ",
                "https://docs.zigzag.exchange/zksync/fast-withdraw-bridge"
              )}
          </>
        );
      };

      toast.success(renderToastContent(), { closeOnClick: false });

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
