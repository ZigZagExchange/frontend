import React from "react";
// css
import "./TradePriceHeadSecond.css"
// assets
import upArrow from "../../../assets/icons/up-arrow.png";
const TradePriceHeadSecond = () => {
  return (
    <>
      <div className="trade_price_head_2">
        <div>
          <h2>3370.93</h2>
          <img src={upArrow} alt="..." />
        </div>
        <span>$3370.54</span>
        <span>More</span>
      </div>
    </>
  );
};

export default TradePriceHeadSecond;
