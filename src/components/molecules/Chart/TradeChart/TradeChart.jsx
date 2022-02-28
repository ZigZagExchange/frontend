import React from "react";
import TradingViewWidget, { Themes } from "react-tradingview-widget";
import "./TradeChart.css";
import { useSelector } from "react-redux";
import { marketInfoSelector } from "../../../../lib/store/features/api/apiSlice";
import { TRADING_VIEW_CHART_KEY } from "../../../pages/ListPairPage/ListPairPage";

export const TradeChart = () => {
  const marketInfo = useSelector(marketInfoSelector);

  let symbol = "";
  if (marketInfo) {
    if (
      TRADING_VIEW_CHART_KEY in marketInfo &&
      marketInfo[TRADING_VIEW_CHART_KEY] !== ""
    ) {
      symbol = marketInfo[TRADING_VIEW_CHART_KEY];
    } else {
      symbol = marketInfo.baseAsset.symbol + marketInfo.quoteAsset.symbol;
    }
  }

  return (
    <TradingViewWidget
      symbol={symbol}
      theme={Themes.DARK}
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
