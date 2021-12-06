import React from "react";
// css
import "./TradeHead.css";
// components
import TradeRatesCard from "components/pages/TradePage/TradeRatesCard/TradeRatesCard";
import TradeSelect from "components/pages/TradePage/TradeSelect/TradeSelect";

const TradeHead = (props) => {
    return (
        <>
            <div className="tl_head">
                <TradeRatesCard
                    marketSummary={props.marketSummary}
                    currentMarket={props.currentMarket}
                />
                <TradeSelect
                    updateMarketChain={props.updateMarketChain}
                    markets={props.markets}
                    currentMarket={props.currentMarket}
                />
            </div>
        </>
    );
};

export default TradeHead;
