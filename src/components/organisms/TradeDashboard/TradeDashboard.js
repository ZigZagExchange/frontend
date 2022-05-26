import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "@xstyled/styled-components";
import TradeSidebar from "./TradeSidebar/TradeSidebar";
import TradeMarketSelector from "./TradeMarketSelector/TradeMarketSelector";
import TradeTables from "./TradeTables/TradeTables";
import TradeFooter from "./TradeFooter/TradeFooter";
import TradeChartArea from "./TradeChartArea/TradeChartArea";
import OrdersBook from "./TradeBooks/OrdersBook";
import TradesBook from "./TradeBooks/TradesBook";
import "react-toastify/dist/ReactToastify.css";
import {
  networkSelector,
  userOrdersSelector,
  userFillsSelector,
  allOrdersSelector,
  marketFillsSelector,
  lastPricesSelector,
  marketSummarySelector,
  liquiditySelector,
  currentMarketSelector,
  marketInfoSelector,
  setCurrentMarket,
  resetData,
} from "lib/store/features/api/apiSlice";
import { userSelector } from "lib/store/features/auth/authSlice";
import api from "lib/api";
import { useLocation, useHistory } from "react-router-dom";
import {
  getChainIdFromMarketChain,
  marketQueryParam,
  networkQueryParam,
} from "../../pages/ListPairPage/SuccessModal";
import { areArraysEqual } from "@mui/base";

const TradeContainer = styled.div`
  color: #aeaebf;
  height: calc(100vh - 56px);
  background: ${(p) => p.theme.colors.backgroundHighEmphasis};
`;

const TradeGrid = styled.article`
  display: grid;
  grid-template-rows: 75px 498px 212px 57px;
  grid-template-columns: 300px 253.5px 253.5px 1fr;
  grid-template-areas:
    "marketSelector marketSelector marketSelector marketSelector"
    "sidebar orders trades chart"
    "sidebar tables tables tables"
    "sidebar footer footer footer";
  min-height: calc(100vh - 56px);
  gap: 0px;

  @media screen and (max-width: 991px) {
    grid-template-rows: 74px 410px 427px 508px 362px 111px;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "marketSelector marketSelector"
      "chart chart"
      "sidebar orders"
      "trades trades"
      "tables tables"
      "footer footer";
  }

  > div,
  > aside,
  > header,
  > footer,
  > section,
  > main {
    background: ${(p) => p.theme.colors.zzDarkest};
  }
`;

export function TradeDashboard() {
  const user = useSelector(userSelector);
  const network = useSelector(networkSelector);
  const currentMarket = useSelector(currentMarketSelector);
  const userOrders = useSelector(userOrdersSelector);
  const userFills = useSelector(userFillsSelector);
  const allOrders = useSelector(allOrdersSelector);
  const marketFills = useSelector(marketFillsSelector);
  const lastPrices = useSelector(lastPricesSelector);
  const marketSummary = useSelector(marketSummarySelector);
  const liquidity = useSelector(liquiditySelector);
  const marketInfo = useSelector(marketInfoSelector);
  const dispatch = useDispatch();
  const lastPriceTableData = [];
  const markets = [];

  const { search } = useLocation();
  const history = useHistory();

  const updateMarketChain = (market) => {
    dispatch(setCurrentMarket(market));
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(search);
    const marketFromURL = urlParams.get(marketQueryParam);
    const networkFromURL = urlParams.get(networkQueryParam);
    const chainid = getChainIdFromMarketChain(networkFromURL);
    if (marketFromURL && currentMarket !== marketFromURL) {
      updateMarketChain(marketFromURL);
    }
    if (chainid && network !== chainid) {
      api.setAPIProvider(chainid);
      api.signOut();
    }
  }, []);

  // Update URL when market or network update
  useEffect(() => {
    let networkText;
    if (network === 1) {
      networkText = "zksync";
    } else if (network === 1000) {
      networkText = "zksync-rinkeby";
    }
    history.push(`/?market=${currentMarket}&network=${networkText}`);
  }, [network, currentMarket]);

  useEffect(() => {
    const sub = () => {
      dispatch(resetData());
      api.subscribeToMarket(currentMarket);
    };

    if (api.ws && api.ws.readyState === 0) {
      api.on("open", sub);
    } else {
      sub();
    }

    return () => {
      if (api.ws && api.ws.readyState !== 0) {
        api.unsubscribeToMarket(currentMarket);
      } else {
        api.off("open", sub);
      }
    };
  }, [network, currentMarket, api.ws]);

  Object.keys(lastPrices).forEach((market) => {
    markets.push(market);
    const price = lastPrices[market].price;
    const change = lastPrices[market].change;
    const pctchange = ((change / price) * 100).toFixed(2);
    const quoteCurrency = market.split("-")[1];
    const quoteCurrencyUSDC = quoteCurrency + "-USDC";
    let quoteCurrencyPrice = 0;
    if (quoteCurrency === "USDC" || quoteCurrency === "USDT") {
      quoteCurrencyPrice = 1;
    }
    if (lastPrices[quoteCurrencyUSDC]) {
      quoteCurrencyPrice = lastPrices[quoteCurrencyUSDC].price;
    }
    let usdVolume = 0;
    usdVolume = parseFloat(lastPrices[market].quoteVolume) * quoteCurrencyPrice;
    lastPriceTableData.push({
      td1: market,
      td2: price,
      td3: pctchange,
      usdVolume,
    });
  });
  lastPriceTableData.sort((a, b) => b.usdVolume - a.usdVolume);

  const orderbookBids = [];
  const orderbookAsks = [];

  for (let orderid in allOrders) {
    const order = allOrders[orderid];
    const side = order[3];
    const price = order[4];
    const remaining = isNaN(Number(order[11])) ? order[5] : order[11];
    const remainingQuote = remaining * price;
    const orderStatus = order[9];

    const orderWithoutFee = api.getOrderDetailsWithoutFee(order);
    let orderRow;
    if (api.isZksyncChain())
      orderRow = {
        td1: orderWithoutFee.price,
        td2: orderWithoutFee.baseQuantity,
        td3: orderWithoutFee.quoteQuantity,
        side,
        order: order,
      };
    else {
      orderRow = {
        td1: price,
        td2: remaining,
        td3: remainingQuote,
        side,
        order: order,
      };
    }

    if (side === "b" && ["o", "pm", "pf"].includes(orderStatus)) {
      orderbookBids.push(orderRow);
    } else if (side === "s" && ["o", "pm", "pf"].includes(orderStatus)) {
      orderbookAsks.push(orderRow);
    }
  }

  // Only display recent trades
  // There's a bunch of user trades in this list that are too old to display
  const fillData = [];
  const maxFillId = Math.max(...Object.values(marketFills).map((f) => f[1]));
  Object.values(marketFills)
    .filter((fill) => fill[1] > maxFillId - 500 && fill[6] !== "r")
    .sort((a, b) => b[1] - a[1])
    .forEach((fill) => {
      fillData.push({
        td1: Number(fill[4]),
        td2: Number(fill[5]),
        td3: Number(fill[4] * fill[5]),
        side: fill[3],
      });
    });

  if (api.isZksyncChain()) {
    liquidity.forEach((liq) => {
      const side = liq[0];
      const price = liq[1];
      const quantity = liq[2];
      if (side === "b") {
        orderbookBids.push({
          td1: price,
          td2: quantity,
          td3: price * quantity,
          side: "b",
        });
      }
      if (side === "s") {
        orderbookAsks.push({
          td1: price,
          td2: quantity,
          td3: price * quantity,
          side: "s",
        });
      }
    });
  }

  orderbookAsks.sort((a, b) => b.td1 - a.td1);
  orderbookBids.sort((a, b) => b.td1 - a.td1);
  let askBins = [];
  for (let i = 0; i < orderbookAsks.length; i++) {
    const lastAskIndex = askBins.length - 1;
    if (i === 0) {
      askBins.push(orderbookAsks[i]);
    } else if (
      orderbookAsks[i].td1.toPrecision(6) ===
      askBins[lastAskIndex].td1.toPrecision(6)
    ) {
      askBins[lastAskIndex].td2 += orderbookAsks[i].td2;
      askBins[lastAskIndex].td3 += orderbookAsks[i].td3;
    } else {
      askBins.push(orderbookAsks[i]);
    }
  }

  let temp = [];
  for (let i in orderbookBids) {
    const lastBidIndex = temp.length - 1;
    if (i === "0") {
      temp.push(orderbookBids[i]);
    } else if (
      orderbookBids[i].td1.toPrecision(6) ===
      temp[lastBidIndex].td1.toPrecision(6)
    ) {
      temp[lastBidIndex].td2 += orderbookBids[i].td2;
      temp[lastBidIndex].td3 += orderbookBids[i].td3;
    } else {
      temp.push(orderbookBids[i]);
    }
  }
  let arrayLength = askBins.length > temp.length ? temp.length : askBins.length;
  const bidBins = temp.slice(0, arrayLength);
  askBins = askBins.slice(0, arrayLength);

  console.log("askbinds length", askBins.length, "bidbins length", bidBins.length, arrayLength);

  const activeOrderStatuses = ["o", "m", "b"];
  const activeUserOrders = Object.values(userOrders).filter((order) =>
    activeOrderStatuses.includes(order[9])
  ).length;

  return (
    <TradeContainer>
      <TradeGrid>
        <TradeMarketSelector
          updateMarketChain={updateMarketChain}
          marketSummary={marketSummary}
          currentMarket={currentMarket}
          marketInfo={marketInfo}
          lastPriceTableData={lastPriceTableData}
        />
        {/* TradePriceBtcTable, Spotbox */}
        <TradeSidebar
          lastPriceTableData={lastPriceTableData}
          updateMarketChain={updateMarketChain}
          markets={markets}
          currentMarket={currentMarket}
          lastPrice={marketSummary.price}
          user={user}
          activeOrderCount={activeUserOrders}
          liquidity={liquidity}
          marketInfo={marketInfo}
          marketSummary={marketSummary}
        />
        {/* TradePriceTable, TradePriceHeadSecond */}
        <OrdersBook
          currentMarket={currentMarket}
          priceTableData={askBins}
          lastPrice={marketSummary.price}
          marketInfo={marketInfo}
          bidBins={bidBins}
        />
        <TradesBook
          currentMarket={currentMarket}
        />
        {/* TradeChartArea */}
        <TradeChartArea marketInfo={marketInfo} />
        {/* OrdersTable */}
        <TradeTables
          userFills={userFills}
          userOrders={userOrders}
          user={user}
        />
        <TradeFooter />
      </TradeGrid>
    </TradeContainer>
  );
}
