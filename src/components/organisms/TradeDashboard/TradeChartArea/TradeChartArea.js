import React from "react";
import styled from "@xstyled/styled-components";
import TradeChart from "components/molecules/Chart/TradeChart/TradeChart";
import { ChartLoaderSpinner } from "components/molecules/Chart/TradeChart/ChartComponents/ChartLoaderSpinner";
import { useDispatch, useSelector } from "react-redux";
import { intervalSelector, updateInterval } from "lib/store/features/chart/chartSlice";
import { userFillsSelector, userOrdersSelector } from "lib/store/features/api/apiSlice";

const StyledTradeChart = styled.section`
  display: flex;
  grid-area: chart;
  height: 100%;
  width: 100%;
  background: #131722;
`;

export default function TradeChartArea({marketInfo}) {
  const dispatch = useDispatch();
  const userOrders = useSelector(userOrdersSelector);
  const userFills = useSelector(userFillsSelector);
  const interval = useSelector(intervalSelector);
  const setInterval = (value) => {
    dispatch(updateInterval(value));
  }

  const intervals = [
    {value: undefined, string: 'MINUTES'},
    {value: '1m', string: '1 Minute'},
    {value: '3m', string: '3 Minutes'},
    {value: '5m', string: '5 Minutes'},
    {value: '15m', string: '15 Minutes'},
    {value: '30m', string: '30 Minutes'},
    {value: undefined, string: 'HOURS'},
    {value: '1h', string: 'Hourly'},
    {value: '4h', string: '4 Hours'},
    {value: undefined, string: 'DAYS'},
    {value: '1d', string: 'Daily'},
    {value: '1w', string: 'Weekly'},
    {value: '1M', string: 'Monthly'},
  ];

  if(!marketInfo) return <StyledTradeChart><ChartLoaderSpinner text={"Loading market"}/></StyledTradeChart>;

  const tvAlias = marketInfo.tradingViewChart.split(":");
  const exchange = tvAlias[0];
  const pair= tvAlias[1];

  return (
    <StyledTradeChart>
        <TradeChart
          marketInfo={marketInfo} 
          userOrders={userOrders}
          userFills={userFills}
          pair={pair}
          exchange={exchange}
          interval={interval}
          setInterval={setInterval}
          intervals={intervals}
        />
    </StyledTradeChart>
  );
}
