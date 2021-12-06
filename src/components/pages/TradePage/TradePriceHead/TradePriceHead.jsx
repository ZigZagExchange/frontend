import React from "react";
// css
import "./TradePriceHead.css";
// assets
import menuIcon1 from "assets/icons/rectangle.png";
import menuIcon2 from "assets/icons/rectangle1.png";
import menuIcon3 from "assets/icons/rectangle2.png";
import threedotIcon from "assets/icons/threedot-icon.png";

const TradePriceHead = () => {
    return (
        <>
            <div className="trade_price_head">
                <div className="tph_l">
                    <img src={menuIcon1} alt="..." />
                    <img src={menuIcon2} alt="..." />
                    <img src={menuIcon3} alt="..." />
                </div>
                <div className="tph_r">
                    <select>
                        <option value="0.01">0.01</option>
                    </select>
                    <img src={threedotIcon} alt="..." />
                </div>
            </div>
        </>
    );
};

export default TradePriceHead;
