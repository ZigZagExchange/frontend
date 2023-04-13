import { createSlice, createAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { formatPrice } from "lib/utils";

import api from "lib/api";
import { getLayout } from "lib/helpers/storage/layouts";
import FillCard from "components/organisms/TradeDashboard/TradeTables/OrdersTable/FillCard";
import {
  initialLayouts,
  stackedLayouts,
} from "components/organisms/TradeDashboard/ReactGridLayout/layoutSettings";

import i18next from "../../../i18next";

const makeScopeUser = (state) => `${state.network}-${state.userId}`;
const makeScopeMarket = (state) => `${state.network}-${state.currentMarket}`;

const initialUISettings = {
  showNightPriceChange: false,
  showCancelOrders: false,
  disableOrderNotification: false,
  stackOrderbook: true,
  disableSlippageWarning: false,
  disableOrderBookFlash: false,
  hideAddress: false,
  hideBalance: false,
  hideGuidePopup: false,
  disableTradeIDCard: false,
  layouts: initialLayouts(),
  editable: false,
  hideZigZagLiveOnArbitrumPopup: false,
};

export const apiSlice = createSlice({
  name: "api",
  initialState: {
    network: 1,
    userId: null,
    layout: getLayout() || 0,
    currentMarket: api.apiProvider.getDefaultMarket(),
    marketFills: {},
    bridgeReceipts: [],
    lastPrices: {},
    marketSummary: {},
    marketinfos: {},
    balances: {},
    liquidity: [],
    userOrders: {},
    userFills: {},
    orders: {},
    arweaveAllocation: 0,
    isConnecting: false,
    isBridgeConnecting: false,
    settings: initialUISettings,
    slippageValue: "1.00",
    highSlippageModal: {
      open: false,
      confirmed: "",
      delta: 0,
      type: "sell",
      marketinfos: " ",
      xToken: 0,
      yToken: 0,
      userPrice: 0,
      pairPrice: 0,
    },
    serverDelta: 0,
  },
  reducers: {
    _error(state, { payload }) {
      const op = payload[0];
      const errorMessage = payload[1];
      // we dont want to show some errors
      if (
        errorMessage.includes("Order is no longer open") ||
        op === "subscribemarket"
      ) {
        console.error(`Error at ${op}: ${errorMessage}`);
        return;
      }

      const renderToastContent = () => {
        return (
          <>
            {i18next.t("an_unknown_error_has_occurred_while_processing")} '{op}'
            ({errorMessage}). Please{" "}
            <a
              href={"https://zigzag.exchange/#contact"}
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
        const marketinfo = payload[0];
        if (!marketinfo) return;
        state.marketinfos[`${marketinfo.zigzagChainId}-${marketinfo.alias}`] =
          marketinfo;
      }
    },
    _marketinfo2(state, { payload }) {
      payload[0].forEach((marketinfo) => {
        if (!marketinfo) return;
        state.marketinfos[`${marketinfo.zigzagChainId}-${marketinfo.alias}`] =
          marketinfo;
      });
    },
    _fills(state, { payload }) {
      payload[0].forEach((fill) => {
        const fillid = fill[1];
        const isoString = fill[12];
        const newTimestamp =
          new Date(isoString).getTime() - state.serverDelta * 1000;
        fill[12] = new Date(newTimestamp);
        // taker and maker user ids have to be matched lowercase because addresses
        // sometimes come back in camelcase checksum format
        const takerUserId = fill[8] && fill[8].toLowerCase();
        const makerUserId = fill[9] && fill[9].toLowerCase();
        if (
          ["f", "pf", "m"].includes(fill[6]) &&
          fill[2] === state.currentMarket &&
          fill[0] === state.network
        ) {
          state.marketFills[fillid] = fill;
        }
        if (
          state.userId &&
          takerUserId === state.userId.toString().toLowerCase()
        ) {
          state.userFills[fillid] = fill;
        }
        // for maker fills we need to flip the side and set fee to 0
        if (
          state.userId &&
          makerUserId === state.userId.toString().toLowerCase()
        ) {
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
        let timestamp = update[7];
        if (timestamp) {
          const newTimestamp =
            new Date(timestamp).getTime() - state.serverDelta * 1000;
          timestamp = new Date(newTimestamp);
        }
        let txhash;
        let feeamount;
        let feetoken;
        let price;
        if (update[3]) txhash = update[3];
        if (update[5]) feeamount = update[5];
        if (update[6]) feetoken = update[6];
        if (update[8]) price = Number(update[8]);
        if (state.marketFills[fillid]) {
          state.marketFills[fillid][6] = newstatus;
          state.marketFills[fillid][12] = timestamp;
          if (price) state.marketFills[fillid][4] = price;
          if (txhash) state.marketFills[fillid][7] = txhash;
          if (feeamount) state.marketFills[fillid][10] = feeamount;
          if (feetoken) state.marketFills[fillid][11] = feetoken;
        }
        if (state.userFills[fillid]) {
          state.userFills[fillid][6] = newstatus;
          state.userFills[fillid][12] = timestamp;
          if (price) state.marketFills[fillid][4] = price;
          if (txhash) state.userFills[fillid][7] = txhash;
          if (feeamount) state.userFills[fillid][10] = feeamount;
          if (feetoken) state.userFills[fillid][11] = feetoken;

          if (newstatus === "f") {
            const fillDetails = state.userFills[fillid];

            const baseCurrency = fillDetails[2].split("-")[0];
            const sideText = fillDetails[3] === "b" ? "buy" : "sell";
            price = price ? price : Number(fillDetails[4]);
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
                i18next.t(
                  "your_sidetext_order_fillid_for_basequantity_basecurrency_was_filled_price",
                  {
                    sideText: sideText,
                    fillid: fillid,
                    baseQuantity: Number(baseQuantity.toPrecision(4)),
                    baseCurrency: baseCurrency,
                    price: Number(formatPrice(price)),
                  }
                ),
                {
                  toastId: `Your ${sideText} order #${fillid} for ${Number(
                    baseQuantity.toPrecision(4)
                  )} ${baseCurrency} was filled @ ${Number(
                    formatPrice(price)
                  )}!`,
                }
              );
            }

            // update the balances of the user account
            api.getBalances();
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
        if (!fill) return;
        const fillid = fill[1];
        const isoString = fill[12];
        const newTimestamp =
          new Date(isoString).getTime() - state.serverDelta * 1000;
        fill[12] = new Date(newTimestamp);

        const takerUserId = fill[8] && fill[8].toLowerCase();
        const makerUserId = fill[9] && fill[9].toLowerCase();
        if (fill[2] === state.currentMarket && fill[0] === state.network) {
          state.marketFills[fillid] = fill;
        }
        if (
          state.userId &&
          takerUserId === state.userId.toString().toLowerCase()
        ) {
          state.userFills[fillid] = fill;
        }
        // for maker fills we need to flip the side and set fee to 0
        if (
          state.userId &&
          makerUserId === state.userId.toString().toLowerCase()
        ) {
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
      const chainId = payload[1];
      if (chainId !== state.network) return;
      payload[0].forEach((update) => {
        const market = update[0];
        const price = update[1];
        const change = update[2];

        if (!price || Number.isNaN(price)) return;

        if (!state.lastPrices[chainId]) state.lastPrices[chainId] = {};

        state.lastPrices[chainId][market] = {
          price: update[1],
          change: update[2],
          quoteVolume: state.lastPrices[chainId][market]
            ? state.lastPrices[chainId][market].quoteVolume
            : 0,
        };
        // Sometimes lastprice doesn't have volume data
        // Keep the old data if it doesn't
        if (update[3]) {
          state.lastPrices[chainId][market].quoteVolume = update[3];
        }
        if (update[0] === state.currentMarket) {
          state.marketSummary.price = price;
          state.marketSummary.priceChange = change;
        }
      });
    },
    _liquidity2(state, { payload }) {
      if (payload[0] === state.network && payload[1] === state.currentMarket) {
        state.liquidity = payload[2];
      }
    },
    _orderstatus(state, { payload }) {
      const newOrders = { ...state.orders };
      const newUserOrders = { ...state.userOrders };
      (payload[0] || []).forEach(async (update) => {
        let filledOrder;
        const [, orderId, newStatus, txHash, remaining] = update;
        switch (newStatus) {
          case "c":
            delete newOrders[orderId];
            if (newUserOrders[orderId]) {
              newUserOrders[orderId][9] = "c";
            }
            break;
          case "pm":
          case "pf":
            if (newOrders[orderId]) {
              newOrders[orderId][10] = remaining;
            }
            if (newUserOrders[orderId]) {
              newUserOrders[orderId][10] = remaining;
            }
            break;
          case "m":
            const matchedOrder = newOrders[orderId];
            if (!matchedOrder) return;
            matchedOrder[9] = "m";
            matchedOrder[10] = 0;
            const takerUserId =
              matchedOrder[8] && matchedOrder[8].toLowerCase();
            const makerUserId =
              matchedOrder[9] && matchedOrder[9].toLowerCase();
            const orderUserId =
              state.userId && state.userId.toString().toLowerCase();
            delete newOrders[orderId];
            if (
              matchedOrder &&
              (takerUserId === orderUserId || makerUserId === orderUserId)
            ) {
              newUserOrders[matchedOrder[1]] = matchedOrder;
            }
            break;
          case "f":
            filledOrder = newUserOrders[orderId];
            if (filledOrder) {
              filledOrder[9] = "f";
              filledOrder[11] = txHash;
            }
            break;
          case "b":
            filledOrder = newUserOrders[orderId];
            if (filledOrder) {
              filledOrder[9] = "b";
              filledOrder[11] = txHash;
            }
            break;
          case "r":
            filledOrder = newUserOrders[orderId];
            if (filledOrder) {
              const sideText = filledOrder[3] === "b" ? "buy" : "sell";
              const error = update[4];
              const baseCurrency = filledOrder[2].split("-")[0];
              filledOrder[9] = "r";
              filledOrder[11] = txHash;
              const noFeeOrder = api.getOrderDetailsWithoutFee(filledOrder);
              toast.error(
                i18next.t(
                  "your_sidetext_order_for_basequantity_basecurrency_price_was_rejected",
                  {
                    sideText: sideText,
                    baseQuantity: noFeeOrder.baseQuantity.toPrecision(4) / 1,
                    baseCurrency: baseCurrency,
                    price: noFeeOrder.price.toPrecision(4) / 1,
                    error: error,
                  }
                ),
                {
                  toastId: `Your ${sideText} order for ${
                    noFeeOrder.baseQuantity.toPrecision(4) / 1
                  } ${baseCurrency} @ ${
                    noFeeOrder.price.toPrecision(4) / 1
                  } was rejected: ${error}`,
                }
              );
              toast.info(
                i18next.t(
                  "this_happens_occasionally_run_the_transaction_again_and_you_should_be_fine"
                ),
                {
                  toastId: `This happens occasionally. Run the transaction again and you should be fine.`,
                }
              );
            }
            break;
          case "e":
            if (newUserOrders[orderId]) {
              newUserOrders[orderId][9] = "e";
            }
            if (newOrders[orderId]) {
              newOrders[orderId][9] = "e";
            }
            break;
          default:
            break;
        }
      });
      state.orders = newOrders;
      state.userOrders = newUserOrders;
    },
    _orders(state, { payload }) {
      const orders = payload[0]
        .filter((order) => order[0] === state.network)
        .reduce((res, order) => {
          order[7] = order[7] - state.serverDelta;
          res[order[1]] = order;
          return res;
        }, {});

      state.orders = {
        ...state.orders,
        ...orders,
      };

      if (state.userId) {
        const newUserOrders = { ...state.userOrders };
        for (let i in orders) {
          if (orders[i][8] === state.userId.toString()) {
            const orderId = orders[i][1];
            newUserOrders[orderId] = orders[i];
          }
        }
        state.userOrders = newUserOrders;
      }
    },
    _orderreceipt(state, { payload }) {
      const orderId = payload[1];
      state.userOrders[orderId] = payload;
      state.userOrders[orderId][7] =
        state.userOrders[orderId][7] - state.serverDelta;
    },
    _userorderack(state, { payload }) {
      const orderId = payload[1].toString();
      if (payload[11]) {
        const token = payload[11].toString();
        localStorage.setItem(orderId, token);
      }
      state.userOrders[orderId] = payload.slice(0, 12);
      state.userOrders[orderId][7] =
        state.userOrders[orderId][7] - state.serverDelta;
    },
    setBalances(state, { payload }) {
      const scope = makeScopeUser(state);
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
      console.log(`Executing setCurrentMarket to ${payload}`);
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
              {i18next.t("bridge_transaction_pending")}
            </p>
            Successfully {successMsg} {amount} {token} {targetMsg}
            {type !== "eth_to_zksync" && (
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
                {i18next.t("view_transaction")}
              </a>
            </p>
            {type === "withdraw_fast" ? <br /> : ""}
            {type === "eth_to_zksync" && (
              <div className="mt-3">
                {i18next.t(
                  "please_wait_for_your_eth_balance_to_be_available_in_zksync_before_trading"
                )}{" "}
                {/* {targetMsg} */}
                <p>
                  <a
                    href={walletAddress}
                    rel="noreferrer"
                    target="_blank"
                    className="text-base font-bold underline font-work underline-offset-2"
                  >
                    {" zkSync wallet "}
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
        autoClose: 40000,
        icon: false,
      });

      state.bridgeReceipts.unshift(payload);
    },
    resetData(state) {
      state.marketFills = {};
      state.marketSummary = {};
      state.orders = {};
      state.liquidity = [];
    },
    clearUserOrders(state) {
      state.userOrders = {};
      state.userFills = {};
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
    setBridgeConnecting(state, { payload }) {
      state.isBridgeConnecting = payload;
    },
    setHighSlippageModal(state, { payload }) {
      state.highSlippageModal = {
        open: payload.open ? payload.open : false,
        confirmed: payload.confirmed ? payload.confirmed : false,
        delta: payload.delta ? payload.delta : state.highSlippageModal.delta,
        type: payload.type ? payload.type : state.highSlippageModal.type,
        marketinfos: payload.marketinfos
          ? payload.marketinfos
          : state.highSlippageModal.marketinfos,
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
      state.settings = {
        ...initialUISettings,
        layouts: state.settings.layouts,
      };
    },
    setSlippageValue(state, { payload }) {
      state.slippageValue = payload.value;
    },
    setServerDelta(state, { payload }) {
      state.serverDelta = payload;

      // update existing fills and orders in case the delta changed
      state.userOrders = Object.keys(state.userOrders).map((orderId) => {
        const order = state.userOrders[orderId];
        order[7] = order[7] - payload;
        return order;
      });
      state.orders = Object.keys(state.orders).map((orderId) => {
        const order = state.orders[orderId];
        order[7] = order[7] - payload;
        return order;
      });

      state.userFills = Object.keys(state.userFills).map((fillId) => {
        const fill = state.userFills[fillId];
        const isoString = fill[12];
        const newTimestamp = new Date(isoString).getTime() - payload * 1000;
        fill[12] = new Date(newTimestamp);
        return fill;
      });
      state.marketFills = Object.keys(state.marketFills).map((fillId) => {
        const fill = state.marketFills[fillId];
        const isoString = fill[12];
        const newTimestamp = new Date(isoString).getTime() - payload * 1000;
        fill[12] = new Date(newTimestamp);
        return fill;
      });
    },
    resetTradeLayout(state) {
      if (!state.settings.stackOrderbook) {
        state.settings.layouts = stackedLayouts();
      } else {
        state.settings.layouts = initialLayouts();
      }
      state.settings.layoutsCustomized = false;
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
  setArweaveAllocation,
  setConnecting,
  setBridgeConnecting,
  setHighSlippageModal,
  setUISettings,
  resetUISettings,
  setSlippageValue,
  setServerDelta,
  resetTradeLayout,
} = apiSlice.actions;

export const layoutSelector = (state) => state.api.layout;
export const networkSelector = (state) => state.api.network;
export const userOrdersSelector = (state) => state.api.userOrders;
export const userFillsSelector = (state) => state.api.userFills;
export const allOrdersSelector = (state) => state.api.orders;
export const marketFillsSelector = (state) => state.api.marketFills;
export const lastPricesSelector = (state) =>
  state.api.lastPrices[state.api.network];
export const marketInfosSelector = (state) => state.api.marketinfos;
export const marketSummarySelector = (state) => state.api.marketSummary;
export const liquiditySelector = (state) => state.api.liquidity;
export const currentMarketSelector = (state) => state.api.currentMarket;
export const bridgeReceiptsSelector = (state) => state.api.bridgeReceipts;
export const marketInfoSelector = (state) =>
  state.api.marketinfos[makeScopeMarket(state.api)] || null;
export const arweaveAllocationSelector = (state) => state.api.arweaveAllocation;
export const isConnectingSelector = (state) => state.api.isConnecting;
export const isBridgeConnectingSelector = (state) =>
  state.api.isBridgeConnecting;
export const settingsSelector = (state) => state.api.settings;
export const highSlippageModalSelector = (state) => state.api.highSlippageModal;
export const balancesSelector = (state) =>
  state.api.balances[makeScopeUser(state.api)] || {};

export const handleMessage = createAction("api/handleMessage");
export const slippageValueSelector = (state) => state.api.slippageValue;

export default apiSlice.reducer;
