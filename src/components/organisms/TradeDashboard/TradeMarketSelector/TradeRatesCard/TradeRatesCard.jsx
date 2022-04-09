import React from "react";
import { formatPrice } from "lib/utils";
// css
import api from "lib/api";
import "./TradeRatesCard.css";

class TradeRatesCard extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      marketInfo: null,
    };
  }

  componentDidUpdate() {
    if (
      this.props.marketInfo &&
      this.props.marketInfo !== this.state.marketInfo
    ) {
      var marketInfo = this.props.marketInfo;

      //add ticker name
      var state = {
        marketInfo: marketInfo,
      };

      this.setState(state);
    }
  }

  componentDidMount() {
    //get token name
  }

  render() {
    var marketInfo = this.state.marketInfo;

    let marketDisplay = "--/--";
    if (this.state.marketInfo) {
      marketInfo = this.state.marketInfo;
      marketDisplay = <div>{marketInfo.baseAsset.symbol}/{marketInfo.quoteAsset.symbol}</div>;
    }
    const percentChange = (
      (this.props.marketSummary.priceChange / this.props.marketSummary.price) *
      100
    ).toFixed(2);

    if (!this.state.marketInfo) {
      return null
    }

    return (
      <>
        <div className="tl_rates">
          <div className="rates_box rb_text_1">
            <div>
              <img src={api.getCurrencyLogo(this.state.marketInfo?.baseAsset.symbol)} alt={this.state.marketInfo?.baseAsset.symbol} className="rates_box_symbol" />
              <div>
                <strong>{marketDisplay}</strong>
                <p>
                  {marketInfo?.baseAsset && marketInfo.baseAsset.name}{" "}
                </p>
              </div>
            </div>
          </div>
          <div className="rates_box rb_text_2">
            <h1>{this.props.marketSummary.price}</h1>
            <p>$ {
              (this.props.marketInfo?.baseAsset?.usdPrice)
                ? this.props.marketInfo.baseAsset.usdPrice
                : "--"
            }</p>
          </div>
          <div
            className={
              this.props.marketSummary.priceChange < 0
                ? "rates_box rb_text_3_down_value hide_sm"
                : "rates_box rb_text_3_up_value hide_sm"
            }
          >
            <h2>24h Change</h2>
            <p>
              {this.props.marketSummary.priceChange &&
                formatPrice(this.props.marketSummary.priceChange / 1)
              }{" "}
              {percentChange !== 'NaN' && `${percentChange}%`}
            </p>
          </div>
          <div className="rates_box rb_text_4 hide_md">
            <h2>24h High</h2>
            <p>{this.props.marketSummary["24hi"]}</p>
          </div>
          <div className="rates_box rb_text_4 hide_md">
            <h2>24h Low</h2>
            <p>{this.props.marketSummary["24lo"]}</p>
          </div>
          <div className="rates_box rb_text_4 hide_sm">
            <h2>24h Volume({marketInfo && marketInfo.baseAsset.symbol})</h2>
            <p>{this.props.marketSummary.baseVolume}</p>
          </div>
          <div className="rates_box rb_text_4 hide_sm">
            <h2>24h Volume({marketInfo && marketInfo.quoteAsset.symbol})</h2>
            <p>{this.props.marketSummary.quoteVolume}</p>
          </div>
        </div>
      </>
    );
  }
}

export default TradeRatesCard;
