import React from "react";
// css
import "./TradeMarketActivites.css";
// assets
import twoUpArrows from "../../../assets/icons/two_uparrows.png";
import uturnIcon from "../../../assets/icons/u-turn.png";
const TradeMarketActivites = () => {
  return (
    <>
      <div className="trade_market">
        <div className="tm_h mt-4">
          <strong>ANNOUNCEMENTS</strong>
          <img src={twoUpArrows} alt="..." />
        </div>
        <div className="tm_b mt-3">
          <div className="tm_bl">
            <p>Zigzag launches on zkSync Rinkeby Testnet</p>
            <p>20:00:06</p>
          </div>
        </div>
        <div className="tm_b mt-3">
          <div className="tm_bl">
            <p>Zigzag launches on Starknet</p>
            <p>20:00:06</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TradeMarketActivites;
