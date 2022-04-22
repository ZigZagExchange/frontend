import React from "react";
import styled from "@xstyled/styled-components";
import TradePriceBtcTable from "./TradePriceBtcTable/TradePriceBtcTable";
import SpotBox from "./SpotBox/SpotBox";

const StyledTradeSidebar = styled.aside`
  display: grid;
  grid-auto-flow: row;
  grid-area: sidebar;
  position: relative;
  height: fit-content;
  border: 1px solid ${({theme}) => theme.colors.foreground300};
`;

export default function TradeSidebar(props) {
  return (
    <StyledTradeSidebar>
      <TradePriceBtcTable
        rowData={props.lastPriceTableData}
        updateMarketChain={props.updateMarketChain}
        markets={props.markets}
        currentMarket={props.currentMarket}
      />
      <SpotBox
        lastPrice={props.lastPrice}
        user={props.user}
        activeOrderCount={props.activeOrderCount}
        liquidity={props.liquidity}
        currentMarket={props.currentMarket}
        marketSummary={props.marketSummary}
        marketInfo={props.marketInfo}
      />
    </StyledTradeSidebar>
  );
}
