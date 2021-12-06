import React from "react";
// css
import "./TradePriceBtcHead.css";
// assets
import starIcon from "assets/icons/star-icon.png";
import selectArrow from "assets/icons/select-arrow.png";
const TradePriceBtcHead = () => {
    return (
        <>
            <div className="trade_price_btc_head">
                <div>
                    <img className="me-2" src={starIcon} alt="..." />
                    <h2>BNB BTC</h2>
                </div>
                <div>
                    <h2 className="me-2">ALTS</h2>
                    <img src={selectArrow} alt="..." />
                </div>
                <div>
                    <h2 className="me-2">FIAT</h2>
                    <img src={selectArrow} alt="..." />
                </div>
                <div>
                    <h2 className="me-2">ZONES</h2>
                    <img src={selectArrow} alt="..." />
                </div>
            </div>
        </>
    );
};

export default TradePriceBtcHead;
