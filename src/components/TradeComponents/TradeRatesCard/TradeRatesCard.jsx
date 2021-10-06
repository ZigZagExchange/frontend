import React from "react";
// css
import "./TradeRatesCard.css";
import {useDataContext} from "../../../context/dataContext"


const TradeRatesCard = () => {
  const {dataState} = useDataContext();
  return (
    <>
      <div className="tl_rates">
        <div className="rates_box rb_text_1">
          <strong>{dataState.currency_name}</strong>
          <p>{dataState.currency_fullName}</p>
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
          <h2>24h Volume({dataState?.currency_name_1})</h2>
          <p>383,383.72</p>
        </div>
        <div className="rates_box rb_text_4">
          <h2>24h Volume({dataState?.currency_name_2})</h2>
          <p>1,269,857,470.27</p>
        </div>
      </div>
    </>
  );
};

export default TradeRatesCard;
