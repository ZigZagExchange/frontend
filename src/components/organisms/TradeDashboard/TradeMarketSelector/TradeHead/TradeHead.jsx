import React from "react";
// css
import "./TradeHead.css";
// components
import TradeRatesCard from "../TradeRatesCard/TradeRatesCard";
// import TradeSelect from "../TradeSelect/TradeSelect";

const TradeHead = (props) => {
  return (
    <TradeRatesCard
      updateMarketChain={props.updateMarketChain}
      marketSummary={props.marketSummary}
      currentMarket={props.currentMarket}
      marketInfo={props.marketInfo}
      rowData={props.rowData}
    />
  );
};

export default TradeHead;
