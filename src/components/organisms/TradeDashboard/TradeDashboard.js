import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import GridLayoutRow from "./ReactGridLayout/ReactGridRow";
import GridLayoutCell from "./ReactGridLayout/ReactGridCell";
import styled from "@xstyled/styled-components";
import TradeSidebar from "./TradeSidebar/TradeSidebar";
import TradeMarketSelector from "./TradeMarketSelector/TradeMarketSelector";
import TradeTables from "./TradeTables/TradeTables";
// import TradeFooter from "./TradeFooter/TradeFooter";
import TradeChartArea from "./TradeChartArea/TradeChartArea";
import OrdersBook from "./TradeBooks/OrdersBook";
import TradesBook from "./TradeBooks/TradesBook";
import "react-toastify/dist/ReactToastify.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./ReactGridLayout/custom-grid-layout.css";
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
  setUISettings,
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
import NewFeaturesPopup from "components/organisms/TradeDashboard/NewFeaturesPopup";
import classNames from "classnames";
import useTheme from "components/hooks/useTheme";

const TradeContainer = styled.div`
  color: #aeaebf;
  height: calc(100vh - 56px);
  background: ${(p) => p.theme.colors.backgroundHighEmphasis};

  .react-resizable-handle {
    &::after {
      width: 10px !important;
      height: 10px !important;
      border-color: ${({ theme }) =>
        `${theme.colors.primaryHighEmphasis} !important`};
      border-right-width: 3px !important;
      border-bottom-width: 3px !important;
      cursor: nwse-resize;
    }
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
  const { isDark } = useTheme();

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
  }, [currentMarket, network, lastPrices]);

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
    if (chainid && network !== chainid) {
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
    } else if (network === 1002) {
      networkText = "zksync-goerli";
    } else if (network === 42161) {
      networkText = "arbitrum";
    }
    history.push(`/?market=${currentMarket}&network=${networkText}`);
  }, [network, currentMarket]);

  useEffect(() => {
    if (user.address && !user.id && network === 1) {
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
      <TradeMarketSelector
        updateMarketChain={updateMarketChain}
        currentMarket={currentMarket}
        network={network}
        marketInfo={marketInfo}
        marketSummary={marketSummary}
        lastPrices={lastPrices}
      />
      <GridLayoutRow
        layouts={settings.layouts}
        autoSize={false}
        onChange={(_, layout) => {
          dispatch(setUISettings({ key: "layouts", value: layout }));
        }}
        onDragStart={() => {
          dispatch(setUISettings({ key: "layoutsCustomized", value: true }));
        }}
        onResizeStart={() => {
          dispatch(setUISettings({ key: "layoutsCustomized", value: true }));
        }}
        margin={[0, 0]}
        isDraggable={settings.editable}
        isResizable={settings.editable}
        draggableHandle=".grid-item__title"
        editable={settings.editable}
        useCSSTransforms={false}
        float={false}
      >
        <div key="a">
          <GridLayoutCell editable={settings.editable}>
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
          </GridLayoutCell>
        </div>
        {/* TradePriceTable, TradePriceHeadSecond */}
        <div key="g">
          <GridLayoutCell editable={settings.editable}>
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
          </GridLayoutCell>
        </div>
        <div key="h">
          <GridLayoutCell editable={settings.editable}>
            <TradesBook currentMarket={currentMarket} side={side} />
          </GridLayoutCell>
        </div>
        <div key="c">
          <GridLayoutCell editable={settings.editable}>
            <TradeChartArea marketInfo={marketInfo} />
          </GridLayoutCell>
        </div>
        <div key="d">
          <GridLayoutCell editable={settings.editable}>
            <TradeTables
              userFills={userFills}
              userOrders={userOrders}
              user={user}
              settings={settings}
              network={network}
            />
          </GridLayoutCell>
        </div>
      </GridLayoutRow>
      <HighSlippageModal />

      {!settings.hideLayoutGuidePopup && (
        <div
          className={classNames({
            dark: isDark,
          })}
        >
          <NewFeaturesPopup />
        </div>
      )}
    </TradeContainer>
  );
}
