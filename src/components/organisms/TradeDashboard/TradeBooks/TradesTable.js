import React, { useState } from "react";
import { useSelector } from "react-redux";
import styled from "@xstyled/styled-components";
import { currentMarketSelector } from "lib/store/features/api/apiSlice";
import OrdersBook from "./OrdersBook";
import TradesBook from "./TradesBook";

const TradesTableWrapper = styled.div`
  display: flex;
  grid-area: stack;
  flex-direction: column;
  gap: 8px;
`;

export default function TradesTable() {
  const currentMarket = useSelector(currentMarketSelector);
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
          currentMarket={currentMarket}
          changeFixedPoint={changeFixedPoint}
          changeSide={changeSide}
        />
        <TradesBook currentMarket={currentMarket} fixedPoint={fixedPoint} side={side} />
      </TradesTableWrapper>
    </>
  );
}
