import React from "react";
import styled from "@xstyled/styled-components";
import { TradeChart } from "components";

const StyledTradeChart = styled.section`
  display: flex;
  grid-area: chart;
`;

export default function TradeChartArea(props) {
  return (
    <StyledTradeChart>
      <TradeChart marketInfo={props.marketInfo} />
    </StyledTradeChart>
  );
}
