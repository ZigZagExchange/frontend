import React from "react";
import TradingViewWidget, { Themes } from "react-tradingview-widget";
import "./TradeChart.css";
import api from "lib/api";

export const TradeChart = (props) => {
  const marketInfo = api.getMarketInfo(props.currentMarket);
  let symbol = "";
  if (marketInfo) {
      symbol = marketInfo.baseAsset.symbol + marketInfo.quoteAsset.symbol;
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
