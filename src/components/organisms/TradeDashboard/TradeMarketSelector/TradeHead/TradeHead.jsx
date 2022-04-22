import React from "react";
// css
import "./TradeHead.css";
// components
import TradeRatesCard from "../TradeRatesCard/TradeRatesCard";
// import TradeSelect from "../TradeSelect/TradeSelect";

const TradeHead = (props) => {
  return (
    <TradeRatesCard
      marketSummary={props.marketSummary}
      currentMarket={props.currentMarket}
      marketInfo={props.marketInfo}
    />
  );
};

export default TradeHead;
