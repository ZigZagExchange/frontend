import React from "react";
import TradingViewWidget, { Themes } from "react-tradingview-widget";
import "./TradeChart.css";
import {useSelector} from "react-redux";
import {marketInfoSelector} from "../../../../lib/store/features/api/apiSlice";

export const TradeChart = () => {
  const marketInfo = useSelector(marketInfoSelector);

  let symbol = "";
  if (marketInfo) {
    if ("tradingViewChart" in marketInfo) {
      symbol = marketInfo.tradingViewChart
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
      interval="D"
      timezone="Etc/UTC"
      locale="en"
      enable_publishing={false}
      hide_legend={true}
    />
  );
};
