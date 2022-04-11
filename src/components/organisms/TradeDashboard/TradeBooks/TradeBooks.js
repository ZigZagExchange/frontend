import React from "react";
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
  const fillData = [];
  const one_day_ago = Date.now() - 86400 * 1000;
  Object.values(marketFills)
    .filter((fill) => Date.parse(fill[12]) > one_day_ago)
    .sort((a, b) => b[1] - a[1])
    .forEach((fill) => {
      fillData.push({
        td1: fill[12], // timestamp
        td2: Number(fill[4]), // price
        td3: Number(fill[5]), // amount
        side: fill[3],
      });
    });
  let openOrdersLatestTradesData = fillData;

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
              scrollToBottom={true}
            />
            <TradePriceHeadSecond 
              lastPrice={props.lastPrice}
              marketInfo={props.marketInfo}
           />
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
