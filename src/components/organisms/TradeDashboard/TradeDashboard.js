import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "@xstyled/styled-components";
import TradeSidebar from "./TradeSidebar/TradeSidebar";
import TradeMarketSelector from "./TradeMarketSelector/TradeMarketSelector";
import TradeTables from "./TradeTables/TradeTables";
// import TradeFooter from "./TradeFooter/TradeFooter";
import TradeChartArea from "./TradeChartArea/TradeChartArea";
import OrdersBook from "./TradeBooks/OrdersBook";
import TradesBook from "./TradeBooks/TradesBook"; 
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import {
  networkSelector,
  userOrdersSelector,
  userFillsSelector,
  currentMarketSelector,
  setCurrentMarket,
  resetData,
  layoutSelector,
  settingsSelector,
  marketSummarySelector,
  marketInfoSelector,
  lastPricesSelector,
  liquiditySelector,
  allOrdersSelector,
} from "lib/store/features/api/apiSlice";
import { userSelector } from "lib/store/features/auth/authSlice";
import api from "lib/api";
import { useLocation, useHistory } from "react-router-dom";
import {
  marketQueryParam,
  networkQueryParam,
} from "../../pages/ListPairPage/SuccessModal";
import TradesTable from "./TradeBooks/TradesTable";
import { HighSlippageModal } from "components/molecules/HighSlippageModal";
import { formatPrice, addComma } from "lib/utils";

const TradeContainer = styled.div`
  color: #aeaebf;
  height: calc(100vh - 56px);
  background: ${(p) => p.theme.colors.backgroundHighEmphasis};
`;

const TradeGrid = styled.article`
  display: grid;
  grid-template-rows: ${({ isLeft }) =>
    isLeft ? "56px 2fr 1fr" : "56px 613px 1fr"};
  grid-template-columns: ${({ isLeft }) =>
    isLeft ? "300px 253.5px 253.5px 1fr" : "300px 507px 1fr"};
  grid-template-areas: ${({ isLeft }) =>
    isLeft
      ? `"marketSelector marketSelector marketSelector marketSelector"
  "sidebar orders trades chart"
  "tables tables tables tables"`
      : `"marketSelector marketSelector marketSelector"
  "sidebar stack chart"
  "tables tables tables"`};

  height: calc(100vh - 56px);
  gap: 0px;

  @media screen and (max-width: 991px) {
    height: auto;
    grid-template-rows: ${({ isLeft }) =>
      isLeft ? "56px 410px 459px 508px 1fr" : "56px 410px 459px 519px 1fr"};
    grid-template-columns: ${({ isLeft }) => (isLeft ? "1fr 1fr" : "1fr")};
    grid-template-areas: ${({ isLeft }) =>
      isLeft
        ? `"marketSelector marketSelector"
      "chart chart"
      "sidebar orders"
      "trades trades"
      "tables tables"
      `
        : `"marketSelector"
      "chart"
      "sidebar"
      "stack"
      "tables"
      `};
  }

  > div,
  > aside,
  > header,
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
  const layout = useSelector(layoutSelector);
  const settings = useSelector(settingsSelector);
  const marketInfo = useSelector(marketInfoSelector);
  const marketSummary = useSelector(marketSummarySelector);
  const lastPrices = useSelector(lastPricesSelector);
  const liquidity = useSelector(liquiditySelector);
  const allOrders = useSelector(allOrdersSelector);
  
  const [side, setSide] = useState("all");
  const [currentPairLastPrice, setCurrentPairLastPrice] = useState(0);

  const dispatch = useDispatch();

  const { search } = useLocation();
  const history = useHistory();

  const updateMarketChain = (market) => {
    console.log(`TradeDashboard set pair to ${market}`);    
    dispatch(setCurrentMarket(market));
  };

  useEffect(() => {
    const price = lastPrices?.[currentMarket]?.price;
    if (price) {
      setCurrentPairLastPrice(price);
    } else {
      setCurrentPairLastPrice(0);
    }
  }, [currentMarket, network, lastPrices])

  useEffect(() => {
    if (!currentPairLastPrice) return;
    document.title = `${addComma(formatPrice(currentPairLastPrice))} | ${
      currentMarket ?? "--"
    } | ZigZag Exchange`;
  }, [currentPairLastPrice]);

  useEffect(() => {
    const urlParams = new URLSearchParams(search);
    const marketFromURL = urlParams.get(marketQueryParam);
    const networkFromURL = urlParams.get(networkQueryParam);
    const chainid = api.getChainIdFromName(networkFromURL);
    if (marketFromURL && currentMarket !== marketFromURL) {
      updateMarketChain(marketFromURL);
    }
    if (chainid) { //For #873 and #290. When a browser is refreshed, we have to relogin though the network is not changed. Because all data is initialized when a browser is refreshed.
    // if (chainid && network !== chainid) {
      api.setAPIProvider(chainid);
      api.signOut();
    }
    api.getWalletBalances();
  }, []);

  // Update URL when market or network update
  useEffect(() => {
    let networkText;
    if (network === 1) {
      networkText = "zksync";
    } else if (network === 1000) {
      networkText = "zksync-rinkeby";
    } else if (network === 42161) {
      networkText = "arbitrum";
    }
    history.push(`/?market=${currentMarket}&network=${networkText}`);
  }, [network, currentMarket]);

  useEffect(() => {
    if (user.address && !user.id) {
      history.push("/bridge");
      toast.error(
        "Your zkSync account is not activated. Please use the bridge to deposit funds into zkSync and activate your zkSync wallet.",
        {
          autoClose: 60000,
        }
      );
    }
    const sub = () => {
      dispatch(resetData());
      api.subscribeToMarket(currentMarket, settings.showNightPriceChange);
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
  }, [network, currentMarket, api.ws, settings.showNightPriceChange]);

  const changeSide = (side) => {
    setSide(side);
  };

  const activeOrderStatuses = ["o", "m", "b"];
  const activeUserOrders = Object.values(userOrders).filter((order) =>
    activeOrderStatuses.includes(order[9])
  ).length;

  const orderbookBids = [];
  const orderbookAsks = [];

  if (api.isZksyncChain() && liquidity) {
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

  if (api.isEVMChain() && allOrders) {
    for (let orderid in allOrders) {
      const order = allOrders[orderid];
      const market = order[2];
      const side = order[3];
      const price = order[4];
      const remaining = order[10] === null ? order[5] : order[10];
      const remainingQuote = remaining * price;
      const orderStatus = order[9];

      const orderRow = {
        td1: price,
        td2: remaining,
        td3: remainingQuote,
        side,
        order: order,
      };

      if (
        market === currentMarket &&
        side === "b" &&
        ["o", "pm", "pf"].includes(orderStatus)
      ) {
        orderbookBids.push(orderRow);
      } else if (
        market === currentMarket &&
        side === "s" &&
        ["o", "pm", "pf"].includes(orderStatus)
      ) {
        orderbookAsks.push(orderRow);
      }
    }
  }

  orderbookAsks.sort((a, b) => b.td1 - a.td1);
  orderbookBids.sort((a, b) => b.td1 - a.td1);
  let askBins = [];
  for (let i = 0; i < orderbookAsks.length; i++) {
    const lastAskIndex = askBins.length - 1; // => -1
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

  let bidBins = [];
  for (let i in orderbookBids) {
    const lastBidIndex = bidBins.length - 1; // => -1
    if (i === "0") {
      bidBins.push(orderbookBids[i]);
    } else if (
      orderbookBids[i].td1.toPrecision(6) ===
      bidBins[lastBidIndex].td1.toPrecision(6)
    ) {
      bidBins[lastBidIndex].td2 += orderbookBids[i].td2;
      bidBins[lastBidIndex].td3 += orderbookBids[i].td3;
    } else {
      bidBins.push(orderbookBids[i]);
    }
  }

  return (
    <TradeContainer>
      <TradeGrid layout={layout} isLeft={settings.stackOrderbook}>
        <TradeMarketSelector
          updateMarketChain={updateMarketChain}
          currentMarket={currentMarket}
          network={network}
          marketInfo={marketInfo}
          marketSummary={marketSummary}
          lastPrices={lastPrices}
        />
        {/* TradePriceBtcTable, Spotbox */}
        <TradeSidebar
          updateMarketChain={updateMarketChain}
          currentMarket={currentMarket}
          user={user}
          activeOrderCount={activeUserOrders}
          marketInfo={marketInfo}
          marketSummary={marketSummary}
          userOrders={userOrders}
          lastPrice={currentPairLastPrice}
          askBins={askBins}
          bidBins={bidBins}
        />
        {settings.stackOrderbook ? (
          <>
            {/* TradePriceTable, TradePriceHeadSecond */}
            <OrdersBook
              currentMarket={currentMarket}
              changeSide={changeSide}
              marketInfo={marketInfo}
              marketSummary={marketSummary}
              settings={settings}
              lastPrice={currentPairLastPrice}
              askBins={askBins}
              bidBins={bidBins}
            />
            <TradesBook
              currentMarket={currentMarket}
              side={side}
            />
          </>
        ) : (
          <TradesTable 
            currentMarket={currentMarket}
            changeSide={changeSide}
            marketInfo={marketInfo}
            marketSummary={marketSummary}
            settings={settings}
            lastPrice={currentPairLastPrice}
            askBins={askBins}
            bidBins={bidBins}
          />
        )}
        {/* TradeChartArea */}
        <TradeChartArea marketInfo={marketInfo} />
        {/* OrdersTable */}
        <TradeTables
          userFills={userFills}
          userOrders={userOrders}
          user={user}
          settings={settings}
          network={network}
        />
        {/* <TradeFooter /> */}

        <HighSlippageModal />
      </TradeGrid>
    </TradeContainer>
  );
}
