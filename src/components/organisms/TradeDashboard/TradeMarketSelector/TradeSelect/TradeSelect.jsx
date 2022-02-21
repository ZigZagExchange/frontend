import React from "react";
import "./TradeSelect.css";

const TradeSelect = ({ currentMarket, updateMarketChain, markets }) => {
  const options = [...markets];
  if (!options.includes(currentMarket)) {
    options.push(currentMarket);
  }
  return (
    <>
      <div className="tl_select">
        <div>
          <select
            value={currentMarket}
            onChange={(e) => updateMarketChain(e.target.value)}
          >
            {options.map((market) => (
              <option key={market} value={market}>
                {market.replace("-", "/")}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default TradeSelect;
