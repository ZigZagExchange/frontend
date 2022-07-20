import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styled from "@xstyled/styled-components";
import TradePriceTable from "./TradePriceTable/TradePriceTable";
import TradePriceHeadSecond from "./TradePriceHeadSecond/TradePriceHeadSecond";
import Text from "components/atoms/Text/Text";
import { Dropdown } from "components/molecules/Dropdown";
import {
  liquiditySelector,
  marketSummarySelector,
  marketInfoSelector,
  settingsSelector,
  allOrdersSelector,
} from "lib/store/features/api/apiSlice";
import {
  SideAllButton,
  SideSellButton,
  SideBuyButton,
} from "./OrdersFooter/SideButtons";
import api from "lib/api";

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
  height: 100%;
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

const fixedPoints = [
  { text: "2", url: "#", value: 2 },
  { text: "3", url: "#", value: 3 },
  { text: "4", url: "#", value: 4 },
];

export default function OrdersBook(props) {
  const marketInfo = useSelector(marketInfoSelector);
  const marketSummary = useSelector(marketSummarySelector);
  const liquidity = useSelector(liquiditySelector);
  const settings = useSelector(settingsSelector);
  const allOrders = useSelector(allOrdersSelector);
  const [fixedPoint, setFixedPoint] = useState(2);
  const [side, setSide] = useState("all");
  const [fixedPointItems, setFixedPointItems] = useState(fixedPoints);

  useEffect(() => {
    let newFixedPoints = [...fixedPointItems];
    newFixedPoints.forEach((item) => {
      item.iconSelected = item.value === fixedPoint;
    });
    setFixedPointItems(newFixedPoints);
  }, [fixedPoint]);

  const changeFixedPoint = (text, value) => {
    setFixedPoint(parseInt(value));
    if (props.changeFixedPoint) {
      props.changeFixedPoint(parseInt(value));
    }
  };

  const changeSide = (type) => {
    setSide(type);
    if (props.changeSide) {
      props.changeSide(type);
    }
  };

  const orderbookBids = [];
  const orderbookAsks = [];

  if (api.isZksyncChain()) {
    liquidity.forEach((liq) => {
      const side = liq[0];
      const price = liq[1];
      const quantity = liq[2];
      if (side === "b") {
        orderbookBids.push({
          td1: price,
          td2: quantity,
          td3: price * quantity,
          side: "b",
        });
      }
      if (side === "s") {
        orderbookAsks.push({
          td1: price,
          td2: quantity,
          td3: price * quantity,
          side: "s",
        });
      }
    });
  }

  if (api.isEVMChain()) {
    for (let orderid in allOrders) {
      const order = allOrders[orderid];
      const market = order[2];
      const side = order[3];
      const price = order[4];
      const remaining = order[10] === null ? order[5] : order[10];
      const remainingQuote = remaining * price;
      const orderStatus = order[9];

      const orderRow = {
        td1: price,
        td2: remaining,
        td3: remainingQuote,
        side,
        order: order,
      };

      if (
        market === props.currentMarket &&
        side === "b" &&
        ["o", "pm", "pf"].includes(orderStatus)
      ) {
        orderbookBids.push(orderRow);
      } else if (
        market === props.currentMarket &&
        side === "s" &&
        ["o", "pm", "pf"].includes(orderStatus)
      ) {
        orderbookAsks.push(orderRow);
      }
    }
  }

  orderbookAsks.sort((a, b) => b.td1 - a.td1);
  orderbookBids.sort((a, b) => b.td1 - a.td1);
  let askBins = [];
  for (let i = 0; i < orderbookAsks.length; i++) {
    const lastAskIndex = askBins.length - 1;
    if (i === 0) {
      askBins.push(orderbookAsks[i]);
    } else if (
      orderbookAsks[i].td1.toPrecision(6) ===
      askBins[lastAskIndex].td1.toPrecision(6)
    ) {
      askBins[lastAskIndex].td2 += orderbookAsks[i].td2;
      askBins[lastAskIndex].td3 += orderbookAsks[i].td3;
    } else {
      askBins.push(orderbookAsks[i]);
    }
  }

  let bidBins = [];
  for (let i in orderbookBids) {
    const lastBidIndex = bidBins.length - 1;
    if (i === "0") {
      bidBins.push(orderbookBids[i]);
    } else if (
      orderbookBids[i].td1.toPrecision(6) ===
      bidBins[lastBidIndex].td1.toPrecision(6)
    ) {
      bidBins[lastBidIndex].td2 += orderbookBids[i].td2;
      bidBins[lastBidIndex].td3 += orderbookBids[i].td3;
    } else {
      bidBins.push(orderbookBids[i]);
    }
  }

  return (
    <>
      <StyledTradeBooks isStack={settings.stackOrderbook}>
        <BooksWrapper isStack={settings.stackOrderbook}>
          {settings.stackOrderbook ? (
            <>
              <Text font="primaryTitleDisplay" color="foregroundHighEmphasis">
                Order Book
              </Text>
              {side === "sell" ? (
                <>
                  <TradePriceTable
                    head
                    className="trade_table_asks sell-side"
                    useGradient={!settings.disableOrderBookFlash}
                    adClass="no-space"
                    priceTableData={askBins}
                    currentMarket={props.currentMarket}
                    scrollToBottom={true}
                    fixedPoint={fixedPoint}
                  />
                  <Divider />
                  <TradePriceHeadSecond
                    lastPrice={marketSummary.price}
                    marketSummary={marketSummary}
                    marketInfo={marketInfo}
                    fixedPoint={fixedPoint}
                  />
                </>
              ) : (
                ""
              )}
              {side === "buy" ? (
                <>
                  <TradePriceTable
                    head
                    useGradient={!settings.disableOrderBookFlash}
                    adClass="no-space"
                    currentMarket={props.currentMarket}
                    priceTableData={bidBins}
                    fixedPoint={fixedPoint}
                  />
                  <Divider />
                  <TradePriceHeadSecond
                    lastPrice={marketSummary.price}
                    marketSummary={marketSummary}
                    marketInfo={marketInfo}
                    fixedPoint={fixedPoint}
                  />
                </>
              ) : (
                ""
              )}
              {side === "all" ? (
                <>
                  <TradePriceTable
                    head
                    className="trade_table_asks sell-side"
                    useGradient={!settings.disableOrderBookFlash}
                    priceTableData={askBins}
                    currentMarket={props.currentMarket}
                    scrollToBottom={true}
                    fixedPoint={fixedPoint}
                  />
                  <Divider />
                  <TradePriceHeadSecond
                    lastPrice={marketSummary.price}
                    marketSummary={marketSummary}
                    marketInfo={marketInfo}
                    fixedPoint={fixedPoint}
                  />
                  <Divider />
                  <TradePriceTable
                    useGradient={!settings.disableOrderBookFlash}
                    currentMarket={props.currentMarket}
                    priceTableData={bidBins}
                    fixedPoint={fixedPoint}
                  />
                </>
              ) : (
                ""
              )}
              <Divider />
              <OrderFooterWrapper isStack={settings.stackOrderbook}>
                {/* <Dropdown
                  adClass="side-dropdown"
                  transparent={true}
                  width={162}
                  item={fixedPointItems}
                  context={`${fixedPoint} decimal`}
                  leftIcon={false}
                  clickFunction={changeFixedPoint}
                /> */}

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
                        useGradient={!settings.disableOrderBookFlash}
                        currentMarket={props.currentMarket}
                        priceTableData={bidBins}
                        fixedPoint={fixedPoint}
                      />
                      <TradePriceTable
                        head
                        className="trade_table_asks sell-side"
                        useGradient={!settings.disableOrderBookFlash}
                        priceTableData={askBins}
                        currentMarket={props.currentMarket}
                        fixedPoint={fixedPoint}
                      />
                    </>
                  </TableWrapper>
                  <Divider />
                  <HeaderWrapper>
                    <TradePriceHeadSecond
                      lastPrice={marketSummary.price}
                      marketSummary={marketSummary}
                      marketInfo={marketInfo}
                      fixedPoint={fixedPoint}
                    />
                    <OrderFooterWrapper isStack={settings.stackOrderbook}>
                      {/* <Dropdown
                        adClass="side-dropdown"
                        transparent={true}
                        width={162}
                        item={fixedPointItems}
                        context={`${fixedPoint} decimal`}
                        leftIcon={false}
                        clickFunction={changeFixedPoint}
                      /> */}

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
                        useGradient={!settings.disableOrderBookFlash}
                        priceTableData={askBins}
                        currentMarket={props.currentMarket}
                        fixedPoint={fixedPoint}
                      />
                    </>
                  </TableWrapper>
                  <Divider />
                  <HeaderWrapper>
                    <TradePriceHeadSecond
                      lastPrice={marketSummary.price}
                      marketSummary={marketSummary}
                      marketInfo={marketInfo}
                      fixedPoint={fixedPoint}
                    />
                    <OrderFooterWrapper isStack={settings.stackOrderbook}>
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
                        useGradient={!settings.disableOrderBookFlash}
                        currentMarket={props.currentMarket}
                        priceTableData={bidBins}
                        fixedPoint={fixedPoint}
                      />
                    </>
                  </TableWrapper>
                  <Divider />
                  <HeaderWrapper>
                    <TradePriceHeadSecond
                      lastPrice={marketSummary.price}
                      marketSummary={marketSummary}
                      marketInfo={marketInfo}
                      fixedPoint={fixedPoint}
                    />
                    <OrderFooterWrapper isStack={settings.stackOrderbook}>
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
