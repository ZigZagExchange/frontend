import React from "react";
import "./SpotBox.css";
import { SpotForm } from "components";
import {x} from "@xstyled/styled-components"
import Tooltip from "../../../atoms/Tooltip/Tooltip";
import {AiOutlineQuestionCircle} from "react-icons/all";
import ExternalLink from "../../ListPairPage/ExternalLink";

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
              <x.div mt={3} mr={3} color={"white"}>
                <x.div display={"flex"} justifyContent={"flex-end"} alignItems={"center"}>
                  <x.div>
                    <x.div textAlign={"right"}>
                      Sell Fee: {marketInfo && marketInfo.baseFee} {marketInfo && marketInfo.baseAsset.symbol}
                    </x.div>
                    <x.div textAlign={"right"}>
                      Buy Fee: {marketInfo && marketInfo.quoteFee} {marketInfo && marketInfo.quoteAsset.symbol}
                    </x.div>
                  </x.div>
                </x.div>
                <x.div fontSize={12} color={"blue-gray-400"} mt={2} display={"flex"} alignItems={"center"}>
                  <x.div mr={2} display={"flex"} alignItems={"center"}>
                    <Tooltip>
                      <Tooltip placement={"left"} label={<x.div>
                        <x.div>
                          zkSync's network swap fees hover around $1 and are
                        </x.div>
                        <x.div>
                          covered by the market maker, but paid by the trader
                        </x.div>
                      </x.div>}>
                        <x.div display={"inline-flex"} color={"blue-gray-600"} ml={2} alignItems={"center"}>
                          <AiOutlineQuestionCircle size={16}/>
                        </x.div>
                      </Tooltip>
                    </Tooltip>
                  </x.div>
                  <x.div>
                    These fees cover zkSync's <ExternalLink href={"https://l2fees.info"}>swap fees</ExternalLink>
                  </x.div>
                </x.div>
              </x.div>
            </div>
            <div className="spot_tabs">
              <div className="st_l">
                <h2 className={this.orderTypeTabClassName("limit")} onClick={() => this.updateOrderType("limit")}>Limit</h2>
                <h2 className={this.orderTypeTabClassName("market")} onClick={() => this.updateOrderType("market")}>Market</h2>
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
        </>
      );
  }

}

export default SpotBox;
