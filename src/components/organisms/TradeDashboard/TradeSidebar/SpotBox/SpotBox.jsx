import React from "react";
//import { toast } from "react-toastify";
// css
import "./SpotBox.css";
// assets
import { SpotForm, Tabs } from "components";
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
        <>
          <div className="spot_box">
            <div className="spot_head">
              <div className="sh_l">
                <h2>SPOT</h2>
              </div>
              <div className="sh_r">
                 Sell Fee: {marketInfo && marketInfo.baseFee.toPrecision(4)} {marketInfo && marketInfo.baseAsset.symbol}
                 <br/>
                 Buy Fee: {marketInfo && marketInfo.quoteFee.toPrecision(4)} {marketInfo && marketInfo.quoteAsset.symbol}
              </div>
            </div>
            <div className="spot_tabs">
              <div className="st_l">
                <h2 className={this.orderTypeTabClassName("limit")} onClick={() => this.updateOrderType("limit")}>Limit</h2>
                <h2 className={this.orderTypeTabClassName("market")} onClick={() => this.updateOrderType("market")}>Market</h2>
              </div>
            </div>
            
            <div className="spot_bottom">
            <Tabs className="spotOptions">
              <div label="Buy">
                <SpotForm
                  side="b"
                  lastPrice={this.props.lastPrice}
                  user={this.props.user}
                  orderType={this.state.orderType}
                  activeOrderCount={this.props.activeOrderCount}
                  liquidity={this.props.liquidity}
                  
                  marketInfo={marketInfo}
                  marketSummary={this.props.marketSummary}
                />
              </div>
              <div label="Sell">
                <SpotForm
                  side="s"
                  lastPrice={this.props.lastPrice}
                  user={this.props.user}
                  currentMarket={this.props.currentMarket}

                  orderType={this.state.orderType}
                  activeOrderCount={this.props.activeOrderCount}
                  liquidity={this.props.liquidity}

                  marketInfo={marketInfo}
                  marketSummary={this.props.marketSummary}

                />
              </div>
            </Tabs>
            </div>


          </div>
        </>
      );
  }

}

export default SpotBox;
