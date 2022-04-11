import React from "react";
import { formatPrice } from "lib/utils";
import "./TradePriceHeadSecond.css";
import upArrow from "assets/icons/up-arrow.png";

const TradePriceHeadSecond = (props) => {
  return (
    <>
      <div className="trade_price_head_2">
        <div>
          <h2>{formatPrice(props.lastPrice)}</h2>
          <img src={upArrow} alt="..." />
        </div>
        <span>$ {
          formatPrice(
            (props.marketInfo?.baseAsset?.usdPrice)
              ? props.marketInfo.baseAsset.usdPrice
              : "--"
          )
        }</span>
      </div>
    </>
  );
};

export default TradePriceHeadSecond;
