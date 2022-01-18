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
    return this.state.orderType === orderType ? "trade_price_active_tab" : "";
  }

  render() {
    return (
      <>
        <div className="spot_box">
          <div className="spot_head">
            <div className="sh_l">
              <h2>SPOT</h2>
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
                marketInfo={this.props.marketInfo}
              />
              <SpotForm
                side="s"
                lastPrice={this.props.lastPrice}
                user={this.props.user}
                currentMarket={this.props.currentMarket}
                orderType={this.state.orderType}
                activeOrderCount={this.props.activeOrderCount}
                liquidity={this.props.liquidity}
                marketInfo={this.props.marketInfo}
              />
            </div>
          </div>
          <div className="spot_bottom">
            <Tabs style={{ width: "100%" }}>
              <div label="Buy">
                <SpotForm
                  side="b"
                  lastPrice={this.props.lastPrice}
                  signInHandler={this.props.signInHandler}
                  user={this.props.user}
                  currentMarket={this.props.currentMarket}
                  orderType={this.state.orderType}
                  activeOrderCount={this.props.activeOrderCount}
                  liquidity={this.props.liquidity}
                />
              </div>
              <div label="Sell">
                <SpotForm
                  side="s"
                  lastPrice={this.props.lastPrice}
                  signInHandler={this.props.signInHandler}
                  user={this.props.user}
                  currentMarket={this.props.currentMarket}
                  orderType={this.state.orderType}
                  activeOrderCount={this.props.activeOrderCount}
                  liquidity={this.props.liquidity}
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
