import React from "react";
import api from "lib/api";
// css
import "./TradeRatesCard.css";
import TradeSelect from "components/pages/TradePage/TradeSelect/TradeSelect";

class TradeRatesCard extends React.Component {
  render() {
    let baseCurrency = this.props.currentMarket.split("-")[0];
    let quoteCurrency = this.props.currentMarket.split("-")[1];
    const percentChange = (
      (this.props.marketSummary.priceChange / this.props.marketSummary.price) *
      100
    ).toFixed(2);

    return (
      <>
        <div className="tl_rates">
          <div className="rates_box rb_text_1">
            <TradeSelect
              updateMarketChain={this.props.updateMarketChain}
              markets={this.props.markets}
              currentMarket={this.props.currentMarket}
            />
            <h2>{api.currencies[baseCurrency].name}</h2>
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
            <h2>24h Change</h2>
            <p>
              {this.props.marketSummary.priceChange} {percentChange}%
            </p>
          </div>
          <div className="rates_box rb_text_4 hide_display_sm">
            <h2>24h High</h2>
            <p>{this.props.marketSummary["24hi"]}</p>
          </div>
          <div className="rates_box rb_text_4 hide_display_sm">
            <h2>24hLow</h2>
            <p>{this.props.marketSummary["24lo"]}</p>
          </div>
          <div className="rates_box rb_text_4 hide_display_md">
            <h2>24h Volume({baseCurrency})</h2>
            <p>{this.props.marketSummary.baseVolume}</p>
          </div>
          <div className="rates_box rb_text_4 hide_display_md">
            <h2>24h Volume({quoteCurrency})</h2>
            <p>{this.props.marketSummary.quoteVolume}</p>
          </div>
        </div>
      </>
    );
  }
}

export default TradeRatesCard;
