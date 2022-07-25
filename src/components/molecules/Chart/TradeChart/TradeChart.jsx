import React from "react";
import TradingViewWidget, { Themes } from "react-tradingview-widget";
import "./TradeChart.css";
import { TRADING_VIEW_CHART_KEY } from "../../../pages/ListPairPage/ListPairPage";
import useTheme from "components/hooks/useTheme";

export const TradeChart = (props) => {
  const { isDark } = useTheme();

  let symbol = "";
  if (props.marketInfo) {
    if (
      TRADING_VIEW_CHART_KEY in props.marketInfo &&
      props.marketInfo[TRADING_VIEW_CHART_KEY] !== ""
    ) {
      symbol = props.marketInfo[TRADING_VIEW_CHART_KEY];
    } else {
      symbol = props.marketInfo.baseAsset.symbol + props.marketInfo.quoteAsset.symbol;
    }
  }

  return (
    <TradingViewWidget
      symbol={symbol}
      theme={isDark ? Themes.DARK : Themes.LIGHT}
      save_image={false}
      hide_top_toolbar={false}
      container_id="tradingview_7f572"
      interval="30"
      timezone="Etc/UTC"
      locale="en"
      enable_publishing={false}
      hide_legend={true}
    />
  );
};
