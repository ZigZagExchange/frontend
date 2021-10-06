import React from "react";
// css
import "./TradeMarketActivites.css";
// assets
import twoUpArrows from "../../../assets/icons/two_uparrows.png";
import uturnIcon from "../../../assets/icons/u-turn.png";
import {useDataContext} from "../../../context/dataContext"


const TradeMarketActivites = () => {
  const {dataState} = useDataContext();
  return (
    <>
      <div className="trade_market">
        <div className="tm_h mt-4">
          <strong>MARKET ACTIVITIES</strong>
          <img src={twoUpArrows} alt="..." />
        </div>
        <div className="tm_b mt-3">
          <div className="tm_bl">
            <p>
              {dataState?.currency_name_1}<span>/{dataState?.currency_name_2}</span>
            </p>
            <p>20:00:06</p>
          </div>
          <div className="tm_br">
            <div>
              <span>-8.05%</span>
              <p>Pullback</p>
            </div>
            <div>
              <img src={uturnIcon} alt="..." />
            </div>
          </div>
        </div>
        <div className="tm_b mt-3">
          <div className="tm_bl">
            <p>
            {dataState?.currency_name_1}<span>/{dataState?.currency_name_2}</span>
            </p>
            <p>20:00:06</p>
          </div>
          <div className="tm_br">
            <div>
              <span>-21.05%</span>
              <p>Pullback</p>
            </div>
            <div>
              <img src={uturnIcon} alt="..." />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TradeMarketActivites;
