import React, { useState } from "react";
import styled from "@xstyled/styled-components";
import OrdersBook from "./OrdersBook";
import TradesBook from "./TradesBook";

const TradesTableWrapper = styled.div`
  display: flex;
  grid-area: stack;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.foreground400};
`;

export default function TradesTable(props) {
  const [fixedPoint, setFixedPoint] = useState(2);
  const [side, setSide] = useState("all");

  const changeFixedPoint = (point) => {
    setFixedPoint(point);
  };

  const changeSide = (side) => {
    setSide(side);
  };

  return (
    <>
      <TradesTableWrapper>
        <OrdersBook
          currentMarket={props.currentMarket}
          changeFixedPoint={changeFixedPoint}
          changeSide={changeSide}
          marketInfo={props.marketInfo}
          marketSummary={props.marketSummary}
          settings={props.settings}
          lastPrice={props.lastPrice}
          askBins={props.askBins}
          bidBins={props.bidBins}
        />
        <TradesBook
          currentMarket={props.currentMarket}
          fixedPoint={fixedPoint}
          side={side}
        />
      </TradesTableWrapper>
    </>
  );
}
