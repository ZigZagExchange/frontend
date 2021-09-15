import React from "react";
// css
import "./TradeRatesCard.css";

const TradeRatesCard = () => {
  return (
    <>
      <div className="tl_rates">
        <div className="rates_box rb_text_1">
          <strong>ETH/USDT</strong>
          <p>Ethereum</p>
        </div>
        <div className="rates_box rb_text_2">
          <h1>3,370.93</h1>
          <p>$3,370.93</p>
        </div>
        <div className="rates_box rb_text_3">
          <h2>24h Change</h2>
          <p>161.99 +5.05%</p>
        </div>
        <div className="rates_box rb_text_4">
          <h2>24h High</h2>
          <p>3,407.99</p>
        </div>
        <div className="rates_box rb_text_4">
          <h2>24hLow</h2>
          <p>3,196.11</p>
        </div>
        <div className="rates_box rb_text_4">
          <h2>24h Volume(ETH)</h2>
          <p>383,383.72</p>
        </div>
        <div className="rates_box rb_text_4">
          <h2>24h Volume(USDT)</h2>
          <p>1,269,857,470.27</p>
        </div>
      </div>
    </>
  );
};

export default TradeRatesCard;
