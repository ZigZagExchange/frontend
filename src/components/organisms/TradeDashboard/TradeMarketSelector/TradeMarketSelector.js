import React from "react";
import TradeHead from "./TradeHead/TradeHead";
import styled from "@xstyled/styled-components";

const StyledTradeMarketSelector = styled.header`
  display: flex;
  grid-area: marketSelector;
`;

export default function TradeMarketSelector(props) {
  return (
    <StyledTradeMarketSelector>
      <TradeHead
        updateMarketChain={props.updateMarketChain}
        marketSummary={props.marketSummary}
        rowData={props.lastPriceTableData}
        currentMarket={props.currentMarket}
        marketInfo={props.marketInfo}
      />
    </StyledTradeMarketSelector>
  );
}
