import React from "react";
import styled from "@xstyled/styled-components";
import TradePriceTable from "./TradePriceTable/TradePriceTable";
import TradePriceHeadSecond from "./TradePriceHeadSecond/TradePriceHeadSecond";
import Text from "components/atoms/Text/Text";

const StyledTradeBooks = styled.section`
  display: flex;
  grid-area: orders;
  flex-direction: row;
  justify-content: space-between;
  padding: 21px 10px 12px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.foreground400};
`;

const BooksWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
`

export default function OrdersBook(props) {
  console.log("price table data is", props.priceTableData);
  console.log("bid bins are", props.bidBins);

  return (
    <>
      <StyledTradeBooks>
        <BooksWrapper>
          <Text font="primaryTitleDisplay" color="foregroundHighEmphasis">Order Book</Text>
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
        </BooksWrapper>
      </StyledTradeBooks>
    </>
  );
}
