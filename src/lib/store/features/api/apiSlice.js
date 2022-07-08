import { createSlice, createAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { formatPrice } from "lib/utils";
import api from "lib/api";
import { getLayout } from "lib/helpers/storage/layouts";
import FillCard from "components/organisms/TradeDashboard/TradeTables/OrdersTable/FillCard";

const makeScope = (state) => `${state.network}-${state.userId}`;

const initialUISettings = {
  showNightPriceChange: false,
  showCancelOrders: false,
  disableOrderNotification: false,
  stackOrderbook: true,
  disableSlippageWarning: false,
  disabledisableOrderBookFlash: false,
  hideAddress: false,
  hideBalance: false,
  hideGuidePopup: false,
  disableTradeIDCard: false,
};

export const apiSlice = createSlice({
  name: "api",
  initialState: {
    network: 1,
    userId: null,
    layout: getLayout() || 0,
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
    isConnecting: false,
    isBridgeConnecting: false,
    settings: initialUISettings,
    highSlippageModal: {
      open: false,
      confirmed: "",
      delta: 0,
      type: "sell",
      marketInfo: " ",
      xToken: 0,
      yToken: 0,
      userPrice: 0,
      pairPrice: 0,
    },
  },
  reducers: {
    _error(state, { payload }) {
      const op = payload[0];
      const errorMessage = payload[1];
      // we dont want to show some errors
      if (errorMessage.includes("Order is no longer open")) {
        console.error(`Error at ${op}: ${errorMessage}`);
        return;
      }

      const renderToastContent = () => {
        return (
          <>
            An unknown error has occurred while processing '{op}' (
            {errorMessage}). Please{" "}
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
            </a>{" "}
            or join the{" "}
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
            </a>{" "}
            to report and solve this bug.
          </>
        );
      };
      const toastContent = renderToastContent(op, errorMessage);
      toast.error(toastContent, {
        toastId: op,
        closeOnClick: false,
        autoClose: false,
      });
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
        if (state.userId && fill[8] === state.userId.toString()) {
          state.userFills[fillid] = fill;
        }
        // for maker fills we need to flip the side and set fee to 0
        if (state.userId && fill[9] === state.userId.toString()) {
          fill[3] = fill[3] === "b" ? "s" : "b";
          fill[10] = 0;
          state.userFills[fillid] = fill;
        }
      });
    },
    _fillstatus(state, { payload }) {
      payload[0].forEach((update) => {
        // console.log(update);
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

          if (newstatus === "f") {
            const fillDetails = state.userFills[fillid];

            const baseCurrency = fillDetails[2].split("-")[0];
            const sideText = fillDetails[3] === "b" ? "buy" : "sell";
            const price = Number(fillDetails[4]);
            const baseQuantity = Number(fillDetails[5]);
            let p = [];
            for (var i = 0; i < 13; i++) {
              if (i === 4) {
                p.push(Number(fillDetails[i]));
              } else {
                p.push(fillDetails[i]);
              }
            }
            if (
              !state.settings.disableOrderNotification &&
              state.settings.disableTradeIDCard
            ) {
              toast.dismiss("Order placed.");
              toast.success(
                `Your ${sideText} order for ${Number(
                  baseQuantity.toPrecision(4)
                )} ${baseCurrency} was filled @ ${Number(formatPrice(price))}!`,
                {
                  toastId: `Your ${sideText} order for ${Number(
                    baseQuantity.toPrecision(4)
                  )} ${baseCurrency} was filled @ ${Number(
                    formatPrice(price)
                  )}!`,
                }
              );
            }
            if (
              !state.settings.disableOrderNotification &&
              !state.settings.disableTradeIDCard
            ) {
              toast.dismiss("Order placed.");
              toast.warning(
                ({ closeToast }) => (
                  <FillCard closeToast={closeToast} fill={p} />
                ),
                {
                  toastId: fillid,
                  className: "fillToastCard",
                  bodyClassName: "!p-0",
                  closeOnClick: false,
                  icon: false,
                  closeButton: false,
                }
              );
            }
          }
        }
      });
    },
    _fillreceipt(state, { payload }) {
      payload[0].forEach((fill) => {
        const fillid = fill[1];
        if (fill[2] === state.currentMarket && fill[0] === state.network) {
          state.marketFills[fillid] = fill;
        }
        if (state.userId && fill[8] === state.userId.toString()) {
          state.userFills[fillid] = fill;
        }
        // for maker fills we need to flip the side and set fee to 0
        if (state.userId && fill[9] === state.userId.toString()) {
          fill[3] = fill[3] === "b" ? "s" : "b";
          fill[10] = 0;
          state.userFills[fillid] = fill;
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

        if (!price || Number.isNaN(price)) return;
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
        .filter((order) => order[0] === state.network)
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
    _orderreceipt(state, { payload }) {
      const orderId = payload[1];
      state.userOrders[orderId] = payload;
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
          <p className="mt-2">
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
          </p>
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
          targetMsg =
            "into your Ethereum wallet. Withdraws can take up to 7 hours to complete";
          extraInfoLink = {
            text: "Bridge FAQ",
            link: "https://docs.zigzag.exchange/zksync/bridge-guide",
          };
          break;
        case "withdraw_fast":
          successMsg = "withdrew";
          targetMsg =
            "into your Ethereum wallet. Fast withdrawals should be confirmed within a few minutes";
          extraInfoLink = {
            text: "Fast Bridge FAQ",
            link: "https://docs.zigzag.exchange/zksync/fast-withdraw-bridge",
          };
          ethWallet = {
            text: "Ethereum wallet",
            link:
              state.network === 1
                ? `https://etherscan.io/address/${walletAddress}`
                : `https://rinkeby.etherscan.io/address/${walletAddress}`,
          };
          break;
        case "zkSync_to_polygon":
          successMsg = "transferred";
          targetMsg = "on Polygon:";
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
          <div>
            <p className="mb-2 text-xl font-semibold font-work">
              Transaction Successful
            </p>
            Successfully {successMsg} {amount} {token} {targetMsg}
            {type !== "zkSync_to_polygon" &&
              type !== "eth_to_zksync" &&
              type !== "polygon_to_zkSync" && (
                <>
                  <br />
                  <br />
                </>
              )}
            <p>
              <a
                href={txUrl}
                className="text-base font-bold underline font-work underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                View transaction
              </a>
            </p>
            {type === "withdraw_fast" ? <br /> : ""}
            {(type === "eth_to_zksync" ||
              type === "zkSync_to_polygon" ||
              type === "polygon_to_zkSync") && (
              <div className="mt-3">
                Confirm that your funds have arrived {targetMsg}
                <p>
                  <a
                    href={walletAddress}
                    rel="noreferrer"
                    target="_blank"
                    className="text-base font-bold underline font-work underline-offset-2"
                  >
                    {type === "zkSync_to_polygon"
                      ? "Polygon wallet"
                      : " zkSync wallet"}{" "}
                  </a>
                </p>
              </div>
            )}
            {extraInfoLink &&
              renderBridgeLink(extraInfoLink.text, extraInfoLink.link)}
            {ethWallet && renderBridgeLink(ethWallet.text, ethWallet.link)}
          </div>
        );
      };

      toast.success(renderToastContent(), {
        closeOnClick: false,
        autoClose: 15000,
        icon: false,
      });

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
    setLayout(state, { payload }) {
      state.layout = payload;
    },
    setConnecting(state, { payload }) {
      state.isConnecting = payload;
    },
    setBridgeConnecting(state, {payload}) {
      state.isBridgeConnecting = payload;
    },
    setHighSlippageModal(state, { payload }) {
      state.highSlippageModal = {
        open: payload.open ? payload.open : false,
        confirmed: payload.confirmed ? payload.confirmed : false,
        delta: payload.delta ? payload.delta : state.highSlippageModal.delta,
        type: payload.type ? payload.type : state.highSlippageModal.type,
        marketInfo: payload.marketInfo
          ? payload.marketInfo
          : state.highSlippageModal.marketInfo,
        xToken: payload.xToken
          ? payload.xToken
          : state.highSlippageModal.xToken,
        yToken: payload.yToken
          ? payload.yToken
          : state.highSlippageModal.yToken,
        userPrice: payload.userPrice
          ? payload.userPrice
          : state.highSlippageModal.userPrice,
        pairPrice: payload.pairPrice
          ? payload.pairPrice
          : state.highSlippageModal.pairPrice,
      };
    },
    setUISettings(state, { payload }) {
      state.settings[payload.key] = payload.value;
    },
    resetUISettings(state) {
      state.settings = initialUISettings;
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
  setConnecting,
  setBridgeConnecting,
  setHighSlippageModal,
  setUISettings,
  resetUISettings,
} = apiSlice.actions;

export const layoutSelector = (state) => state.api.layout;
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
export const isConnectingSelector = (state) => state.api.isConnecting;
export const isBridgeConnectingSelector = (state) => state.api.isBridgeConnecting;
export const settingsSelector = (state) => state.api.settings;
export const highSlippageModalSelector = (state) => state.api.highSlippageModal;
export const balancesSelector = (state) =>
  state.api.balances[makeScope(state.api)] || {};

export const handleMessage = createAction("api/handleMessage");

export default apiSlice.reducer;
