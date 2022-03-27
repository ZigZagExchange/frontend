import React from "react";
import "./TradePriceHeadSecond.css";
import upArrow from "assets/icons/up-arrow.png";

const TradePriceHeadSecond = (props) => {
  return (
    <>
      <div className="trade_price_head_2">
        <div>
          <h2>{props.lastPrice}</h2>
          <img src={upArrow} alt="..." />
        </div>
        <span>${props.lastPrice}</span>
      </div>
    </>
  );
};

export default TradePriceHeadSecond;
