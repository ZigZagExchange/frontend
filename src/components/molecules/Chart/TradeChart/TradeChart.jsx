import React from "react";
// chart library
import TradingViewWidget, { Themes } from "react-tradingview-widget";

// css
import "./TradeChart.css";

export const TradeChart = (props) => {
  return (
    <TradingViewWidget
      symbol={props.currentMarket.replace("-","")}
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
