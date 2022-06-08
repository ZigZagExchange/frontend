import React, { useState } from "react";
import styled from "@xstyled/styled-components";
import TradePriceTable from "./TradePriceTable/TradePriceTable";
import TradePriceHeadSecond from "./TradePriceHeadSecond/TradePriceHeadSecond";
import Text from "components/atoms/Text/Text";
import { Dropdown } from "components/molecules/Dropdown";

import { SideAllButton, SideSellButton, SideBuyButton } from "./OrdersFooter/SideButtons";

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
    // border: 1px solid ${({ theme }) => theme.colors.foregroundMediumEmphasis};
    cursor: pointer;
  }
`

const OrderButtonWrapper = styled.div`
  cursor: pointer;

  rect {
      fill: ${({ theme }) => theme.colors.foregroundHighEmphasis}
  }
`

export default function OrdersBook(props) {
  const [fixedPoint, setFixedPoint] = useState(2);
  const [side, setSide] = useState('all');

  console.log("order book is", props);
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

  const changeSide = (type) => {
    console.log("type side is", type);
    setSide(type);
    if (props.changeSide) {
      props.changeSide(type);
    }
  }

  return (
    <>
      <StyledTradeBooks>
        <BooksWrapper>
          <Text font="primaryTitleDisplay" color="foregroundHighEmphasis">Order Book</Text>
          {
            side === 'sell' ?
              <>
                <TradePriceHeadSecond
                  lastPrice={props.lastPrice}
                  marketInfo={props.marketInfo}
                  fixedPoint={fixedPoint}
                />
                <Divider />
                <TradePriceTable
                  head
                  className="trade_table_asks sell-side"
                  useGradient="true"
                  adClass="no-space"
                  priceTableData={props.priceTableData}
                  currentMarket={props.currentMarket}
                  scrollToBottom={true}
                  fixedPoint={fixedPoint}
                />
              </>
              : ""
          }
          {
            side === 'buy' ?
              <>
                <TradePriceHeadSecond
                  lastPrice={props.lastPrice}
                  marketInfo={props.marketInfo}
                  fixedPoint={fixedPoint}
                />
                <Divider />
                <TradePriceTable
                  head
                  useGradient="true"
                  adClass="no-space"
                  currentMarket={props.currentMarket}
                  priceTableData={props.bidBins}
                  fixedPoint={fixedPoint}
                />
              </> : ""
          }
          {
            side === 'all' ?
              <>
                <TradePriceTable
                  head
                  className="trade_table_asks sell-side"
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
              </> : ""
          }
          <Divider />
          <OrderFooterWrapper>
            <Dropdown adClass="side-dropdown" transparent={true} width={162} item={fixedPoints} context={`${fixedPoint} decimal`} leftIcon={false} clickFunction={changeFixedPoint} />

            <OrderFooterRight>
              <OrderButtonWrapper onClick={() => { changeSide('all') }}>
                <SideAllButton />
              </OrderButtonWrapper>
              <OrderButtonWrapper onClick={() => { changeSide('sell') }}>
                <SideSellButton />
              </OrderButtonWrapper>
              <OrderButtonWrapper onClick={() => { changeSide('buy') }}>
                <SideBuyButton />
              </OrderButtonWrapper>
            </OrderFooterRight>
          </OrderFooterWrapper>
        </BooksWrapper>
      </StyledTradeBooks>
    </>
  );
}
