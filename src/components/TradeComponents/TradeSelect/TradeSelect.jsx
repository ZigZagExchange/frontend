import React from "react";
// css
import "./TradeSelect.css";

const TradeSelect = (props) => {
    return (
        <>
            <div className="tl_select">
                <div>
                    <select
                        value={props.currentMarket}
                        onChange={(e) =>
                            props.updateMarketChain(undefined, e.target.value)
                        }
                    >
                        {props.markets.map((market) => (
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
