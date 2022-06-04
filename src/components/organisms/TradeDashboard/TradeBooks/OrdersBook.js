import React, { useState } from "react";
import styled from "@xstyled/styled-components";
import TradePriceTable from "./TradePriceTable/TradePriceTable";
import TradePriceHeadSecond from "./TradePriceHeadSecond/TradePriceHeadSecond";
import Text from "components/atoms/Text/Text";
import { Dropdown } from "components/molecules/Dropdown";

import Order1 from "assets/images/order/1.svg";
import Order2 from "assets/images/order/2.svg";
import Order3 from "assets/images/order/3.svg";

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

const Divider = styled.div`
  height: 1px;
  margin-right: 2px;
  background: ${({ theme }) => theme.colors.foreground400};
`

const OrderFooterWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  button {
    height: auto;
  }
`

const OrderFooterRight = styled.div`
  display: flex;
  align-items: center;

  img {
    margin-left: 5px;
  }
`

export default function OrdersBook(props) {
  const [fixedPoint, setFixedPoint] = useState(2);
  const fixedPoints = [
    { text: "2", url: "#", value: 2 },
    { text: "3", url: "#", value: 3 },
    { text: "4", url: "#", value: 4 }
  ]

  const changeFixedPoint = (text, value) => {
    setFixedPoint(parseInt(value));
    if (props.changeFixedPoint) {
      props.changeFixedPoint(parseInt(value));
    }
  }

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
            fixedPoint={fixedPoint}
          />
          <Divider />
          <TradePriceHeadSecond
            lastPrice={props.lastPrice}
            marketInfo={props.marketInfo}
            fixedPoint={fixedPoint}
          />
          <Divider />
          <TradePriceTable
            useGradient="true"
            currentMarket={props.currentMarket}
            priceTableData={props.bidBins}
            fixedPoint={fixedPoint}
          />
          <Divider />
          <OrderFooterWrapper>
            <Dropdown adClass="side-dropdown" transparent={true} width={162} item={fixedPoints} context={`${fixedPoint} decimal`} leftIcon={false} clickFunction={changeFixedPoint} />

            <OrderFooterRight>
              <img src={Order1} width="12" height="12" />
              <img src={Order2} width="12" height="12" />
              <img src={Order3} width="12" height="12" />
            </OrderFooterRight>
          </OrderFooterWrapper>
        </BooksWrapper>
      </StyledTradeBooks>
    </>
  );
}
