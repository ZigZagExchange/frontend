import React, { useState } from "react";
import styled from "@xstyled/styled-components";
import TradePriceTable from "./TradePriceTable/TradePriceTable";
import TradePriceHeadSecond from "./TradePriceHeadSecond/TradePriceHeadSecond";
import Text from "components/atoms/Text/Text";
import {
  SideAllButton,
  SideSellButton,
  SideBuyButton,
} from "./OrdersFooter/SideButtons";

const StyledTradeBooks = styled.section`
  display: flex;
  grid-area: orders;
  flex-direction: row;
  justify-content: space-between;
  padding: ${({ isLeft }) =>
    isLeft ? "21px 10px 12px 20px" : "21px 10px 0px 10px"};
  border-top: 1px solid ${({ theme }) => theme.colors.foreground400};
  border-bottom: 1px solid
    ${({ theme, isStack }) => (isStack ? theme.colors.foreground400 : "none")};
  overflow: hidden;

  table {
    height: ${({ isStack }) => (isStack ? "calc(50% - 50px)" : "249px")};
  }
`;

const BooksWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 8px;

  table {
    height: ${({ isStack }) => (!isStack ? "100%" : "")};
  }
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
`;

const TableWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: ${({ isStack }) => (!isStack ? "calc(100% - 80px)" : "auto")};
  gap: 8px;
`;

const Divider = styled.div`
  // height: 1px;
  padding-top: 1px;
  margin-right: 2px;
  background: ${({ theme }) => theme.colors.foreground400};
`;

const OrderFooterWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  button {
    height: auto;
  }
  padding-bottom: ${({ isStack }) => (isStack ? "6px" : "0")};
`;

const OrderFooterRight = styled.div`
  display: flex;
  align-items: center;

  img {
    margin-left: 5px;
    // border: 1px solid ${({ theme }) =>
      theme.colors.foregroundMediumEmphasis};
    cursor: pointer;
  }
`;

const OrderButtonWrapper = styled.div`
  margin-left: 5px;
  cursor: pointer;

  rect {
    fill: ${({ theme }) => theme.colors.foregroundHighEmphasis};
  }

  &:hover {
    rect {
      fill: ${({ theme }) => theme.colors.primaryHighEmphasis};
    }
  }
`;

export default function OrdersBook(props) {
  const [side, setSide] = useState("all");

  const changeSide = (type) => {
    setSide(type);
    if (props.changeSide) {
      props.changeSide(type);
    }
  };

  return (
    <>
      <StyledTradeBooks isStack={props.settings?.stackOrderbook}>
        <BooksWrapper>
          {props.settings?.stackOrderbook ? (
            <>
              <Text font="primaryTitleDisplay" color="foregroundHighEmphasis">
                Order Book
              </Text>
              {side === "sell" ? (
                <>
                  <TradePriceTable
                    head
                    className="trade_table_asks sell-side"
                    useGradient={!props.settings?.disableOrderBookFlash}
                    adClass="no-space"
                    priceTableData={props.askBins}
                    currentMarket={props.currentMarket}
                    scrollToBottom={true}
                    marketInfo={props.marketInfo}
                    settings={props.settings}
                  />
                  <Divider />
                  <TradePriceHeadSecond
                    lastPrice={props.lastPrice}
                    marketSummary={props.marketSummary}
                    marketInfo={props.marketInfo}
                  />
                </>
              ) : (
                ""
              )}
              {side === "buy" ? (
                <>
                  <TradePriceTable
                    head
                    useGradient={!props.settings?.disableOrderBookFlash}
                    adClass="no-space"
                    currentMarket={props.currentMarket}
                    priceTableData={props.bidBins}
                    marketInfo={props.marketInfo}
                    settings={props.settings}
                  />
                  <Divider />
                  <TradePriceHeadSecond
                    lastPrice={props.lastPrice}
                    marketSummary={props.marketSummary}
                    marketInfo={props.marketInfo}
                  />
                </>
              ) : (
                ""
              )}
              {side === "all" ? (
                <>
                  <TradePriceTable
                    head
                    adClass="trade_table_asks sell-side trade_tables_all"
                    useGradient={!props.settings?.disableOrderBookFlash}
                    priceTableData={props.askBins}
                    currentMarket={props.currentMarket}
                    scrollToBottom={true}
                    marketInfo={props.marketInfo}
                    settings={props.settings}
                  />
                  <Divider />
                  <TradePriceHeadSecond
                    lastPrice={props.lastPrice}
                    marketSummary={props.marketSummary}
                    marketInfo={props.marketInfo}
                  />
                  <Divider />
                  <TradePriceTable
                    adClass="trade_tables_all"
                    useGradient={!props.settings?.disableOrderBookFlash}
                    currentMarket={props.currentMarket}
                    priceTableData={props.bidBins}
                    marketInfo={props.marketInfo}
                    settings={props.settings}
                  />
                </>
              ) : (
                ""
              )}
              <Divider />
              <OrderFooterWrapper isStack={props.settings?.stackOrderbook}>
                <OrderFooterRight>
                  <OrderButtonWrapper
                    onClick={() => {
                      changeSide("all");
                    }}
                  >
                    <SideAllButton />
                  </OrderButtonWrapper>
                  <OrderButtonWrapper
                    onClick={() => {
                      changeSide("sell");
                    }}
                  >
                    <SideSellButton />
                  </OrderButtonWrapper>
                  <OrderButtonWrapper
                    onClick={() => {
                      changeSide("buy");
                    }}
                  >
                    <SideBuyButton />
                  </OrderButtonWrapper>
                </OrderFooterRight>
              </OrderFooterWrapper>
            </>
          ) : (
            <>
              <Text font="primaryTitleDisplay" color="foregroundHighEmphasis">
                Order Book
              </Text>
              {side === "all" ? (
                <>
                  <Divider />
                  <TableWrapper>
                    <>
                      <TradePriceTable
                        head
                        useGradient={!props.settings?.disableOrderBookFlash}
                        currentMarket={props.currentMarket}
                        priceTableData={props.bidBins}
                        marketInfo={props.marketInfo}
                        settings={props.settings}
                      />
                      <TradePriceTable
                        head
                        className="trade_table_asks sell-side"
                        useGradient={!props.settings?.disableOrderBookFlash}
                        priceTableData={props.askBins}
                        currentMarket={props.currentMarket}
                        marketInfo={props.marketInfo}
                        settings={props.settings}
                      />
                    </>
                  </TableWrapper>
                  <Divider />
                  <HeaderWrapper>
                    <TradePriceHeadSecond
                      lastPrice={props.lastPrice}
                      marketSummary={props.marketSummary}
                      marketInfo={props.marketInfo}
                    />
                    <OrderFooterWrapper
                      isStack={props.settings?.stackOrderbook}
                    >
                      <OrderFooterRight>
                        <OrderButtonWrapper
                          onClick={() => {
                            changeSide("all");
                          }}
                        >
                          <SideAllButton />
                        </OrderButtonWrapper>
                        <OrderButtonWrapper
                          onClick={() => {
                            changeSide("sell");
                          }}
                        >
                          <SideSellButton />
                        </OrderButtonWrapper>
                        <OrderButtonWrapper
                          onClick={() => {
                            changeSide("buy");
                          }}
                        >
                          <SideBuyButton />
                        </OrderButtonWrapper>
                      </OrderFooterRight>
                    </OrderFooterWrapper>
                  </HeaderWrapper>
                </>
              ) : side === "sell" ? (
                <>
                  <Divider />
                  <TableWrapper>
                    <>
                      <TradePriceTable
                        head
                        className="trade_table_asks sell-side"
                        useGradient={!props.settings?.disableOrderBookFlash}
                        priceTableData={props.askBins}
                        currentMarket={props.currentMarket}
                        marketInfo={props.marketInfo}
                        settings={props.settings}
                      />
                    </>
                  </TableWrapper>
                  <Divider />
                  <HeaderWrapper>
                    <TradePriceHeadSecond
                      lastPrice={props.lastPrice}
                      marketSummary={props.marketSummary}
                      marketInfo={props.marketInfo}
                    />
                    <OrderFooterWrapper
                      isStack={props.settings?.stackOrderbook}
                    >
                      <OrderFooterRight>
                        <OrderButtonWrapper
                          onClick={() => {
                            changeSide("all");
                          }}
                        >
                          <SideAllButton />
                        </OrderButtonWrapper>
                        <OrderButtonWrapper
                          onClick={() => {
                            changeSide("sell");
                          }}
                        >
                          <SideSellButton />
                        </OrderButtonWrapper>
                        <OrderButtonWrapper
                          onClick={() => {
                            changeSide("buy");
                          }}
                        >
                          <SideBuyButton />
                        </OrderButtonWrapper>
                      </OrderFooterRight>
                    </OrderFooterWrapper>
                  </HeaderWrapper>
                </>
              ) : (
                <>
                  <Divider />
                  <TableWrapper>
                    <>
                      <TradePriceTable
                        head
                        useGradient={!props.settings?.disableOrderBookFlash}
                        currentMarket={props.currentMarket}
                        priceTableData={props.bidBins}
                        marketInfo={props.marketInfo}
                        settings={props.settings}
                      />
                    </>
                  </TableWrapper>
                  <Divider />
                  <HeaderWrapper>
                    <TradePriceHeadSecond
                      lastPrice={props.lastPrice}
                      marketSummary={props.marketSummary}
                      marketInfo={props.marketInfo}
                    />
                    <OrderFooterWrapper
                      isStack={props.settings?.stackOrderbook}
                    >
                      <OrderFooterRight>
                        <OrderButtonWrapper
                          onClick={() => {
                            changeSide("all");
                          }}
                        >
                          <SideAllButton />
                        </OrderButtonWrapper>
                        <OrderButtonWrapper
                          onClick={() => {
                            changeSide("sell");
                          }}
                        >
                          <SideSellButton />
                        </OrderButtonWrapper>
                        <OrderButtonWrapper
                          onClick={() => {
                            changeSide("buy");
                          }}
                        >
                          <SideBuyButton />
                        </OrderButtonWrapper>
                      </OrderFooterRight>
                    </OrderFooterWrapper>
                  </HeaderWrapper>
                </>
              )}
            </>
          )}
        </BooksWrapper>
      </StyledTradeBooks>
    </>
  );
}
