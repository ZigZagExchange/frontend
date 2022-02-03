import React from "react";
import { Translation } from "react-i18next";
import "../../../../translations/i18n";

//import { toast } from "react-toastify";
// css
import "./SpotBox.css";
// assets
import { SpotForm } from "components";
//import api from "lib/api";

class SpotBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = { orderType: "market" };
    }

    updateOrderType(orderType) {
        const newstate = { ...this.state, orderType };
        this.setState(newstate);
    }

    orderTypeTabClassName(orderType) {
        return this.state.orderType === orderType
            ? "trade_price_active_tab"
            : "";
    }

  render() {
      const marketInfo = this.props.marketInfo;
      return (
        <Translation>
           {(t, { i18n }) => (
          <div className="spot_box">
            <div className="spot_head">
              <div className="sh_l">
                <h2>{t('spot_c')}</h2>
              </div>
              <div className="sh_r">
                {t('sell_fee')} {marketInfo && marketInfo.baseFee} {marketInfo && marketInfo.baseAsset.symbol}
                 <br/>
                 {t('buy_fee')} {marketInfo && marketInfo.quoteFee} {marketInfo && marketInfo.quoteAsset.symbol}
              </div>
            </div>
            <div className="spot_tabs">
              <div className="st_l">
                <h2 className={this.orderTypeTabClassName("limit")} onClick={() => this.updateOrderType("limit")}>
                  {t('limit')}
                </h2>
                <h2 className={this.orderTypeTabClassName("market")} onClick={() => this.updateOrderType("market")}>
                  {t('market')}
                </h2>
              </div>
            </div>
            <div className="spot_bottom">
              <SpotForm
                side="b"
                lastPrice={this.props.lastPrice}
                user={this.props.user}
                currentMarket={this.props.currentMarket}
                orderType={this.state.orderType}
                activeOrderCount={this.props.activeOrderCount}
                liquidity={this.props.liquidity}
                marketInfo={marketInfo}
              />
              <SpotForm
                side="s"
                lastPrice={this.props.lastPrice}
                user={this.props.user}
                currentMarket={this.props.currentMarket}
                orderType={this.state.orderType}
                activeOrderCount={this.props.activeOrderCount}
                liquidity={this.props.liquidity}
                marketInfo={marketInfo}
              />
            </div>
          </div>
          )}
        </Translation>
      );
  }

}

export default SpotBox;
