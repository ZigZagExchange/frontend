import React from "react";
import TradingViewWidget, { Themes } from "react-tradingview-widget";
import "./TradeChart.css";

export const TradeChart = (props) => {
  let symbol = "";
  if (props.marketInfo) {
      symbol = props.marketInfo.baseAsset.symbol + props.marketInfo.quoteAsset.symbol;
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
