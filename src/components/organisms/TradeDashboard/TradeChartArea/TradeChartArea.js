import React from "react";
import { useSelector } from "react-redux";
import styled from "@xstyled/styled-components";
import { TradeChart } from "components";
import { marketInfoSelector } from "lib/store/features/api/apiSlice";

const StyledTradeChart = styled.section`
  display: flex;
  grid-area: chart;
`;

export default function TradeChartArea() {
  const marketInfo = useSelector(marketInfoSelector);
  return (
    <StyledTradeChart>
      <TradeChart marketInfo={marketInfo} />
    </StyledTradeChart>
  );
}
