import React from "react";
// css
import "./TradeHead.css";
// components
import TradeRatesCard from "../TradeRatesCard/TradeRatesCard";
import TradeSelect from "../TradeSelect/TradeSelect";

const TradeHead = () => {
  return (
    <>
      <div className="tl_head">
        <TradeRatesCard />
        <TradeSelect />
      </div>
    </>
  );
};

export default TradeHead;
