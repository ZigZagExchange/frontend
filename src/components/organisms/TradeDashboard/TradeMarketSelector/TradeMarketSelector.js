import React from "react";
import TradeHead from "./TradeHead/TradeHead";
import styled from "@xstyled/styled-components";

const StyledTradeMarketSelector = styled.header`
  display: flex;
  grid-area: marketSelector;
  border-bottom: 1px solid ${({theme}) => theme.colors.foreground400};
`;

export default function TradeMarketSelector(props) {
  return (
    <StyledTradeMarketSelector>
      <TradeHead
        updateMarketChain={props.updateMarketChain}
        marketSummary={props.marketSummary}
        markets={props.markets}
        currentMarket={props.currentMarket}
        marketInfo={props.marketInfo}
      />
    </StyledTradeMarketSelector>
  );
}
