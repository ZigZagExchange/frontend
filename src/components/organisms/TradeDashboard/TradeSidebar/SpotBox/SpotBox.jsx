import React, { useState } from "react";
import "./SpotBox.css";
// assets
import { SpotForm, Tabs, Tooltip } from "components";
import { HiExternalLink } from "react-icons/hi";
import { x } from "@xstyled/styled-components";
import { AiOutlineQuestionCircle } from "react-icons/all";
import ExternalLink from "../../../../pages/ListPairPage/ExternalLink";

const SpotBox = ({
  marketInfo,
  lastPrice,
  currentMarket,
  user,
  activeOrderCount,
  liquidity,
  marketSummary,
}) => {
  const [orderType, updateOrderType] = useState("market");
  const orderTypeTabClassName = (o) =>
    orderType === o ? "trade_price_active_tab" : "";
    
  return (
    <>
      <div className="spot_box">
        <div className="spot_head">
          <div className="sh_l">
            <h2 className="title">SPOT</h2>
            <div className="spot_tabs">
              <div className="st_l">
                <h2
                  className={orderTypeTabClassName("limit")}
                  onClick={() => updateOrderType("limit")}
                >
                  Limit
                </h2>
                <h2
                  className={orderTypeTabClassName("market")}
                  onClick={() => updateOrderType("market")}
                >
                  Market
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className="spot_bottom">
          <Tabs className="spotOptions">
            <div label="Buy">
              <SpotForm
                side="b"
                lastPrice={lastPrice}
                user={user}
                currentMarket={currentMarket}
                orderType={orderType}
                activeOrderCount={activeOrderCount}
                liquidity={liquidity}
                marketInfo={marketInfo}
                marketSummary={marketSummary}
              />
              <x.div className="spf_head" mt={"5px"} mb={"10px"}>
                <span>Buy Fee:</span>
                <x.strong color={"#fff"}>
                  {marketInfo && marketInfo.quoteFee &&
                    Number(marketInfo.quoteFee).toPrecision(4)}{" "}
                  {marketInfo && marketInfo.quoteAsset.symbol}
                </x.strong>
              </x.div>
            </div>
            <div label="Sell">
              <SpotForm
                side="s"
                lastPrice={lastPrice}
                user={user}
                currentMarket={currentMarket}
                orderType={orderType}
                activeOrderCount={activeOrderCount}
                liquidity={liquidity}
                marketInfo={marketInfo}
                marketSummary={marketSummary}
              />
              <x.div className="spf_head" mt={"5px"} mb={"10px"}>
                <span>Sell Fee</span>
                <x.strong color={"#fff"}>
                  {marketInfo && marketInfo.baseFee &&
                    Number(marketInfo.baseFee).toPrecision(4)}{" "}
                  {marketInfo && marketInfo.baseAsset.symbol}
                </x.strong>
              </x.div>
            </div>
          </Tabs>
          <x.div mr={2} display={"flex"} alignItems={"center"}>
            <Tooltip>
              <Tooltip
                placement={"left"}
                label={
                  <x.div>
                    <x.div>
                      zkSync's network swap fees are dynamic and sit around
                      ~$0.50
                    </x.div>
                    <x.div>
                      covered by the market maker, but paid by the trader
                    </x.div>
                  </x.div>
                }
              >
                <x.div
                  display={"inline-flex"}
                  color={"blue-gray-600"}
                  alignItems={"center"}
                >
                  <AiOutlineQuestionCircle size={16} />
                </x.div>
              </Tooltip>
            </Tooltip>
            <x.div ml={"12px"} fontSize={"12px"}>
              This fee covers zkSync's{" "}
              <ExternalLink href={"https://l2fees.info"}>
                swap fees<HiExternalLink />
              </ExternalLink>
            </x.div>
          </x.div>
        </div>
      </div>
    </>
  );
};

export default SpotBox;
