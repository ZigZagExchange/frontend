import React from "react";
import { useTranslation } from "react-i18next";
import "../../../translations/i18n";

// css
import "./TradePriceHeadThird.css";
const TradePriceHeadThird = () => {
    const { t } = useTranslation();
    return (
        <>
            <div className="trade_price_head_third">
                <strong className="trade_price_active_tab">
                {   t("market_making_click_to_fill")}
                </strong>
            </div>
        </>
    );
};

export default TradePriceHeadThird;
