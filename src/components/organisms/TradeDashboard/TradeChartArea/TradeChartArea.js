import React from "react";
import styled from "@xstyled/styled-components";
import TradeChart from "components/molecules/Chart/TradeChart/TradeChart";
import { ChartLoaderSpinner } from "components/molecules/Chart/TradeChart/ChartComponents/ChartLoaderSpinner";

const StyledTradeChart = styled.section`
  display: flex;
  grid-area: chart;
  height: 100%;
  width: 100%;
`;

export default function TradeChartArea({marketInfo}) {
  if(!marketInfo) return <ChartLoaderSpinner text={"Loading market"}/>;

  const tvAlias = marketInfo.tradingViewChart.split(":");
  const exchange = tvAlias[0];
  const pair= tvAlias[1];

  return (
    <StyledTradeChart>
      <TradeChart
          marketInfo={marketInfo} 
          pair={pair}
          exchange={exchange}
        />
    </StyledTradeChart>
  );
}
