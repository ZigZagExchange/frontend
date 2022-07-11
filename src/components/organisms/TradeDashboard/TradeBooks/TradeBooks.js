import React from "react";
import { useSelector } from "react-redux";
import styled from "@xstyled/styled-components";
import TradePriceTable from "./TradePriceTable/TradePriceTable";
import TradeRecentTable from "./TradeRecentTable/TradeRecentTable";
import TradePriceHeadSecond from "./TradePriceHeadSecond/TradePriceHeadSecond";
import { marketFillsSelector } from "lib/store/features/api/apiSlice";
import Text from "components/atoms/Text/Text";

const StyledTradeBooks = styled.section`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 21px 10px 12px 20px;
`;

const BooksWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 225px;
  gap: 8px;
`

const TradesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 225px;
  gap: 8px;
`

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
        <BooksWrapper>
          <Text font="primaryTitleDisplay" color="foregroundHighEmphasis">Order Book</Text>
          <TradePriceTable
            head
            className="trade_table_asks"
            useGradient="true"
            priceTableData={props.askBins}
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
        </BooksWrapper>
        <TradesWrapper>
          {/* TradePriceTable*/}
          <Text font="primaryTitleDisplay" color="foregroundHighEmphasis">Market Trades</Text>
          <TradeRecentTable
            head
            className=""
            value="up_value"
            priceTableData={openOrdersLatestTradesData}
            currentMarket={props.currentMarket}
          />
        </TradesWrapper>
      </StyledTradeBooks>
    </>
  );
}
