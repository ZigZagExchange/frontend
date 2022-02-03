import React from "react";
import { Translation } from "react-i18next";
import "../../../../translations/i18n";
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
            <Translation>
            {(t, { i18n }) => (
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
                          ? "rates_box rb_text_3_down_value"
                          : "rates_box rb_text_3_up_value"
                      }
                    >
                        <h2>{t('twenty_four_hour_change')}</h2>
                        <p>
                            {this.props.marketSummary.priceChange && marketInfo &&
                                (this.props.marketSummary.priceChange / 1).toFixed(marketInfo.pricePrecisionDecimals)}{" "}
                            {percentChange}%
                        </p>
                    </div>
                    <div className="rates_box rb_text_4">
                        <h2>{t('twenty_four_hour_high')}</h2>
                        <p>{this.props.marketSummary["24hi"]}</p>
                    </div>
                    <div className="rates_box rb_text_4">
                        <h2>{t('twenty_four_hour_low')}</h2>
                        <p>{this.props.marketSummary["24lo"]}</p>
                    </div>
                    <div className="rates_box rb_text_4">
                        <h2>{t('twenty_four_hour_volume')}({marketInfo && marketInfo.baseAsset.symbol})</h2>
                        <p>{this.props.marketSummary.baseVolume}</p>
                    </div>
                    <div className="rates_box rb_text_4">
                        <h2>{t('twenty_four_hour_volume')}({marketInfo && marketInfo.quoteAsset.symbol})</h2>
                        <p>{this.props.marketSummary.quoteVolume}</p>
                    </div>
                </div>
            </>
        )}
        </Translation>
        );
    }
}

export default TradeRatesCard;
