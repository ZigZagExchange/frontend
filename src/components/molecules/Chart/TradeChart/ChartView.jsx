import React, { memo, useRef, useEffect, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
import { darkTheme } from './themes';
import styled from "styled-components";
import { ChartLoaderSpinner } from './ChartComponents/ChartLoaderSpinner';

const ContainerStyle = styled.div`
  height: 400px;
  width: 100%:
  max-width: 30vw;

  @media only screen and (max-width: 990px) {
    min-width: 100vw;
    max-height: 250px;
  }

  @media only screen and (max-width: 1200px) {
    max-width: 500px;
  }
`;

const ChartView = ({
  initialChartData,
  updateData = null,
  candleStickConfig,
  histogramConfig,
  chartLayout = darkTheme.chartLayout,
}) => {
  const resizeObserver = useRef();
  const chartContainerRef = useRef();
  const chart = useRef();
  const candleSeries = useRef();
  const volumeSeries = useRef();

  const setInitialData = useCallback(() => {
    candleSeries.current = chart.current.addCandlestickSeries(candleStickConfig);
    volumeSeries.current = chart.current.addHistogramSeries(histogramConfig);

    candleSeries.current.setData(initialChartData);
    volumeSeries.current.setData(initialChartData);
  }, [initialChartData]);

  useEffect(() => {
      candleSeries?.current?.update(updateData);
      volumeSeries?.current?.update(updateData);
  }, [updateData]);

  useEffect(() => {
    if(!chartContainerRef.current) return;
    chart.current = createChart(chartContainerRef.current, {
      layout: chartLayout.layout,
      grid: chartLayout.grid,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
      rightPriceScale: {

      },
      crosshair: {
        mode: 0,
      },
    });
    setInitialData();
    return () => chart.current.remove();
  }, [setInitialData]);

  // Resize chart on container resizes.
  useEffect(() => {
    if(!chartContainerRef.current) return;

    resizeObserver.current = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      chart.current.applyOptions({
          width: width,
          height: height,
        })
    });

    resizeObserver.current.observe(chartContainerRef.current);

    return () => resizeObserver.current.disconnect();
  }, []);


  if(!initialChartData) return <ChartLoaderSpinner text={"Loading data"}/>;
  return (
    <ContainerStyle>
      <div ref={chartContainerRef} style={{
        width: '100%',
        height: '100%',
      }}/>
    </ContainerStyle>
  );
};

export default memo(ChartView);
