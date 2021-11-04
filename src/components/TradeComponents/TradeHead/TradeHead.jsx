import React from "react";
// css
import "./TradeHead.css";
// components
import TradeRatesCard from "../TradeRatesCard/TradeRatesCard";
import TradeSelect from "../TradeSelect/TradeSelect";

const TradeHead = (props) => {
  return (
    <>
      <div className="tl_head">
        <TradeRatesCard marketSummary={props.marketSummary} />
        <TradeSelect markets={props.markets} />
      </div>
    </>
  );
};

export default TradeHead;
