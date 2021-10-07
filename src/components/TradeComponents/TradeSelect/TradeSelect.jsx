import React from "react";
// css
import "./TradeSelect.css";

const TradeSelect = () => {
  return (
    <>
      <div className="tl_select">
        <div>
          <select>
            <option value="ETH/USDT">ETH/USDT</option>
            <option value="BTC/USDT">BTC/USDT</option>
            <option value="ETH/BTC">ETH/BTC</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default TradeSelect;
