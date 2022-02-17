import React from "react";
import "./SpotBox.css";
// assets
import { SpotForm, Tabs, Tooltip } from "components";
//import api from "lib/api";
import {x} from "@xstyled/styled-components"
import {AiOutlineQuestionCircle} from "react-icons/all";
import ExternalLink from "../../../../pages/ListPairPage/ExternalLink";

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
                 Sell Fee: {marketInfo && marketInfo.baseFee.toPrecision(8)} {marketInfo && marketInfo.baseAsset?.symbol}
                 <br/>
                 Buy Fee: {marketInfo && marketInfo.quoteFee.toPrecision(8)} {marketInfo && marketInfo.quoteAsset?.symbol}
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
                <x.div className="spf_head" mt={"5px"} mb={"10px"}>
                  <span>Buy Fee:</span> 
                  <x.strong color={"#fff"}>{marketInfo && marketInfo.quoteFee.toPrecision(4)} {marketInfo && marketInfo.quoteAsset.symbol}</x.strong>
                </x.div>
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
                <x.div className="spf_head" mt={"5px"} mb={"10px"}>
                  <span>Sell Fee</span>
                  <x.strong color={"#fff"}>{marketInfo && marketInfo.baseFee.toPrecision(4)} {marketInfo && marketInfo.baseAsset.symbol}</x.strong>
                </x.div>
              </div>
            </Tabs>
            <x.div mr={2} display={"flex"} alignItems={"center"}>
              <Tooltip>
                <Tooltip placement={"left"} label={<x.div>
                  <x.div>
                    zkSync's network swap fees are dynamic and sit around ~$0.50
                  </x.div>
                  <x.div>
                    covered by the market maker, but paid by the trader
                  </x.div>
                </x.div>}>
                  <x.div display={"inline-flex"} color={"blue-gray-600"} alignItems={"center"}>
                    <AiOutlineQuestionCircle size={16}/>
                  </x.div>
                </Tooltip>
              </Tooltip>
              <x.div ml={"12px"} fontSize={"12px"}>
                These fees cover zkSync's <ExternalLink href={"https://l2fees.info"}>swap fees</ExternalLink>
              </x.div>
            </x.div>
            </div>


          </div>
        </>
      );
  }

}

export default SpotBox;
