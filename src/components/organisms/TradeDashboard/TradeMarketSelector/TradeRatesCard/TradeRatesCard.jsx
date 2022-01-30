import React from "react";
// css
import "./TradeRatesCard.css";

class TradeRatesCard extends React.Component {
    render() {
        const marketInfo = this.props.marketInfo;

        let marketDisplay = "--/--";
        if (marketInfo) {
            marketDisplay = `${marketInfo.baseAsset.symbol}/${marketInfo.quoteAsset.symbol}`;
        }
        const percentChange = (
            (this.props.marketSummary.priceChange /
                this.props.marketSummary.price) *
            100
        ).toFixed(2);

        return (
            <>
                <div className="tl_rates">
                    <div className="rates_box rb_text_1">
                        <strong>{marketDisplay}</strong>
                        <p>{marketInfo && marketInfo.baseAsset.symbol}</p>
                    </div>
                    <div className="rates_box rb_text_2">
                        <h1>{this.props.marketSummary.price}</h1>
                        <p>${this.props.marketSummary.price}</p>
                    </div>
                    <div
                      className={
                        this.props.marketSummary.priceChange < 0
                          ? "rates_box rb_text_3_down_value hide_mobile"
                          : "rates_box rb_text_3_up_value hide_mobile"
                      }
                    >
                        <h2>24h Change</h2>
                        <p>
                            {this.props.marketSummary.priceChange && marketInfo &&
                                (this.props.marketSummary.priceChange / 1).toFixed(marketInfo.pricePrecisionDecimals)}{" "}
                            {percentChange}%
                        </p>
                    </div>
                    <div className="rates_box rb_text_4 hide_mobile">
                        <h2>24h High</h2>
                        <p>{this.props.marketSummary["24hi"]}</p>
                    </div>
                    <div className="rates_box rb_text_4 hide_mobile">
                        <h2>24hLow</h2>
                        <p>{this.props.marketSummary["24lo"]}</p>
                    </div>
                    <div className="rates_box rb_text_4 hide_mobile">
                        <h2>24h Volume({marketInfo && marketInfo.baseAsset.symbol})</h2>
                        <p>{this.props.marketSummary.baseVolume}</p>
                    </div>
                    <div className="rates_box rb_text_4 hide_mobile">
                        <h2>24h Volume({marketInfo && marketInfo.quoteAsset.symbol})</h2>
                        <p>{this.props.marketSummary.quoteVolume}</p>
                    </div>
                </div>
            </>
        );
    }
}

export default TradeRatesCard;
