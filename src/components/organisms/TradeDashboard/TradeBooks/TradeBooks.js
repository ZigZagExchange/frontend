import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import styled from "@xstyled/styled-components";
import TradePriceTable from "./TradePriceTable/TradePriceTable";
import TradeRecentTable from "./TradeRecentTable/TradeRecentTable";
import TradePriceHeadSecond from "./TradePriceHeadSecond/TradePriceHeadSecond";
import { Tabs } from "components";
import { marketFillsSelector } from "lib/store/features/api/apiSlice";

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
  const marketFills = useSelector(marketFillsSelector);

  // Only display recent trades
  // There's a bunch of user trades in this list that are too old to display
  const maxFillId = Math.max(...Object.values(marketFills).map((f) => f[1]));

 const openOrdersLatestTradesData = useMemo(() => Object.values(marketFills)
    .filter((fill) => fill[1] > maxFillId - 500)
    .sort((a, b) => b[1] - a[1])
    .map(fill => ({
      td1: fill[12],
      td2: Number(fill[5]),
      td3: Number(fill[4] * fill[5]),
      side: fill[3],
    })), [maxFillId, marketFills])
  
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
            {/* TradePriceTable*/}
            <TradeRecentTable
              head
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
