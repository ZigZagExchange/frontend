import React from "react";
// css
import "./TradeRatesCard.css";

class TradeRatesCard extends React.Component {

    render() {
      let marketDisplay = "--/--";
      if (this.props.marketSummary.market) {
          marketDisplay = this.props.marketSummary.market.replace('-', '/');
      }
      const percentChange = (this.props.marketSummary.priceChange / this.props.marketSummary.price * 100).toFixed(2);

      return (
        <>
          <div className="tl_rates">
            <div className="rates_box rb_text_1">
              <strong>{marketDisplay}</strong>
              <p>Ethereum</p>
            </div>
            <div className="rates_box rb_text_2">
              <h1>{this.props.marketSummary.price}</h1>
              <p>${this.props.marketSummary.price}</p>
            </div>
            <div className="rates_box rb_text_3">
              <h2>24h Change</h2>
              <p>{this.props.marketSummary.priceChange} {percentChange}%</p>
            </div>
            <div className="rates_box rb_text_4">
              <h2>24h High</h2>
              <p>{this.props.marketSummary['24hi']}</p>
            </div>
            <div className="rates_box rb_text_4">
              <h2>24hLow</h2>
              <p>{this.props.marketSummary['24lo']}</p>
            </div>
            <div className="rates_box rb_text_4">
              <h2>24h Volume(ETH)</h2>
              <p>{this.props.marketSummary.baseVolume}</p>
            </div>
            <div className="rates_box rb_text_4">
              <h2>24h Volume(USDT)</h2>
              <p>{this.props.marketSummary.quoteVolume}</p>
            </div>
          </div>
        </>
      );
    }
};

export default TradeRatesCard;
