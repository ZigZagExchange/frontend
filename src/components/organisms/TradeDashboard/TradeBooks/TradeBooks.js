import React, { useState } from "react";
import { useSelector } from "react-redux";
import styled from "@xstyled/styled-components";
import TradePriceTable from "./TradePriceTable/TradePriceTable";
import TradePriceHeadSecond from "./TradePriceHeadSecond/TradePriceHeadSecond";
import { Tabs } from "components";
import { marketFillsSelector } from "lib/store/features/api/apiSlice";
import api from "lib/api";

const StyledTradeBooks = styled.section`
  display: flex;
  flex-direction: column;
  grid-area: books;
  & .tab-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 190px);
    min-height: 400px;
  }
  & .trade_price_head_third {
    display: flex;
    align-items: center;
    color: #798ec9;
    height: 30px;
    margin-bottom: 10px;
    opacity: 0.85;
    border-bottom: 1px solid #333;
    & strong {
      border-radius: 10px;
      font-size: 12px;
      text-transform: uppercase;
      margin: 0 auto;
      cursor: pointer;
    }
  }
`;

export default function TradeBooks(props) {
  const [marketDataTab, updateMarketDataTab] = useState("fills");
  const openOrdersData = [];
  const marketFills = useSelector(marketFillsSelector);

  // Only display recent trades
  // There's a bunch of user trades in this list that are too old to display
  const maxFillId = Math.max(...Object.values(marketFills).map((f) => f[1]));

 let fillData = Object.values(marketFills)
    .filter((fill) => fill[1] > maxFillId - 500)
    .sort((a, b) => b[1] - a[1])
  
  if (api.isZksyncChain()) {
    fillData = fillData
      .filter(fill => fill[6] !== 'r')
      .map((fill) => [fill[3], api.getFillDetailsWithoutFee(fill)])
      .map(([side, fill]) => ({
        td1: fill.price,
        td2: fill.baseQuantity,
        td3: fill.quoteQuantity,
        side,
      }))
  } else {
    fillData = fillData.map(fill => ({
      td1: fill[4],
      td2: fill[5],
      td3: fill[4] * fill[5],
      side: fill[3],
    }))
  }
  

  let openOrdersLatestTradesData;
  if (marketDataTab === "orders") {
    openOrdersLatestTradesData = openOrdersData;
  } else if (marketDataTab === "fills") {
    openOrdersLatestTradesData = fillData;
  }

  return (
    <>
      <StyledTradeBooks>
        <Tabs className="booksOptions">
          <div label="Books">
            <TradePriceTable
              head
              className="trade_table_asks"
              useGradient="true"
              priceTableData={props.priceTableData}
              currentMarket={props.currentMarket}
              scrollToBottom="true"
            />
            <TradePriceHeadSecond lastPrice={props.lastPrice} />
            <TradePriceTable
              useGradient="true"
              currentMarket={props.currentMarket}
              priceTableData={props.bidBins}
            />
          </div>
          <div label="Trades">
            <div className="trade_price_head_third">
              <strong
                className={
                  marketDataTab === "fills" ? "trade_price_active_tab" : ""
                }
                onClick={() => updateMarketDataTab("fills")}
              >
                Latest Trades
              </strong>
            </div>
            {/* TradePriceTable*/}
            <TradePriceTable
              className=""
              value="up_value"
              priceTableData={openOrdersLatestTradesData}
              currentMarket={props.currentMarket}
            />
          </div>
        </Tabs>
      </StyledTradeBooks>
    </>
  );
}
