import React, { memo, useRef, useEffect, useCallback, useState } from 'react';
import { createChart, LineStyle } from 'lightweight-charts';
import styled from "styled-components";
import { ChartLoaderSpinner } from './ChartComponents/ChartLoaderSpinner';
import { useSelector } from 'react-redux';
import { chartSettingsSelector } from 'lib/store/features/chart/chartSlice';

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

const LegendContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  z-index: 4;
  margin: 8px;
`;

const ChartView = ({
  initialChartData,
  updateData = null,
  candleStickConfig,
  histogramConfig,
  chartLayout,
  orders=[],
  userFills=[],
  marketAlias=undefined,
  legends = { items: [] }
}) => {
  const resizeObserver = useRef();
  const chartContainerRef = useRef();
  const chart = useRef();
  const candleSeries = useRef();
  const volumeSeries = useRef();

  const [priceLines, setPriceLines] =useState([]);
  const [markers, setMarkers] = useState([]);
  const chartSettings = useSelector(chartSettingsSelector);

  const setInitialData = useCallback(() => {
    candleSeries.current = chart.current.addCandlestickSeries(candleStickConfig);
    volumeSeries.current = chart.current.addHistogramSeries(histogramConfig);
    
    // legends
    legends.items.forEach((legend) => {
      if(!legend.fnc) return;

      switch (legend.type) {
        case "crosshair":
          chart.current.subscribeCrosshairMove(legend.fnc);
          break;
        default:
          break;
      }
    });

    candleSeries?.current?.setData(initialChartData);
    volumeSeries?.current?.setData(initialChartData);

    setOrderData();
    setMarkerData();
  }, [initialChartData]);
  
  //set order price lines
  const setMarkerData = () => {
    candleSeries?.current?.setMarkers([]);
    if(!chartSettings.trading.showExecutions) return;

    const createMarkers = (ms) => {
      let formatted = [];
      for (var key in ms){

        const f = ms[key];
        let market = f[2];
        let side = f[3];

        //break;
        var marker = { 
          time: new Date(f[12]).getTime() / 1000, 
          position: side === "b" ? 'belowBar' : 'aboveBar',
          color:  side === "b" ? '#26A69A' : 'red',
          shape:  side === "b" ? 'arrowUp' : 'arrowDown',
          text:  side === "b" ? 'buy' : 'sell',
        };       
        if(market === marketAlias) formatted.push(marker);
      }
      return formatted;
    }

    let formattedMarkers = createMarkers(userFills);
    candleSeries?.current?.setMarkers(formattedMarkers);
    setMarkers(formattedMarkers);

  };

  //set order price lines
  const setOrderData = () => {
    priceLines.forEach((priceLine) => {
      candleSeries?.current?.removePriceLine(priceLine);
      let temp = priceLines.filter((line) => line !== priceLine);
      setPriceLines(temp);
    })
    if(!chartSettings.trading.showOrders) return;

    const createOrders = (os) => {
      let formatted = [];
      for (var key in os){
        const o = os[key];  
        const order = {
          market: o[2],
          side: o[3],
          price: parseFloat(o[4]).toFixed(3),
          size: parseFloat(o[5]).toFixed(3),
          status: o[9]
        };
        //has to be current market, not included and open status
        if(order.market === marketAlias && !formatted.includes(order) && order.status === "o"){
          formatted.push(order);
        }
      }
      return formatted;
    }

    let formattedOrders = createOrders(orders);

    formattedOrders.forEach((order) => {
      const priceLine =candleSeries?.current?.createPriceLine({
        price: order.price,
        color: order.side === "s" ? '#d11736' : '#176bd1',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: `${order.side === "s" ? "sell" : "buy"} order ${order.size}`,
      });
      let temp = priceLines;
      temp.push(priceLine);
      setPriceLines(temp);
    });
  };

  useEffect(() => {
    if(!chart.current) return;
    setOrderData();
  }, [orders, chart, chartSettings]);

  useEffect(() => {
    if(!chart.current) return;
    setMarkerData();
  }, [userFills, chart, chartSettings]);

  //candle data
  useEffect(() => {
      candleSeries?.current?.update(updateData);
      volumeSeries?.current?.update(updateData);
  }, [updateData]);
  
  //initialize chart
  useEffect(() => {
    if(!chartContainerRef.current) return;
    chartContainerRef.current.innerHTML = "";
    
    chart.current = createChart(chartContainerRef.current, {
      layout: { 
        ...chartLayout.layout,
      },
      grid: chartLayout.grid,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        minBarSpacing: 1,
        rightOffset: 10,
      },
      rightPriceScale: {
        width: '95px',
      },
      crosshair: {
        mode: 0,
      },
    });
    setInitialData();
    return () => chart.current.remove();
  }, [setInitialData]);

  //update background settings
  useEffect(() => {
    if(!chart.current) return;
    const color = chartSettings.background.color;
    const background = `rgba(${color.r},${color.g},${color.b},${color.a}`;

    chart.current.applyOptions({
      layout: {
        background: {
          color: background,
        }

      }
    });
  }, [chartLayout, chartSettings.background.color]);

  // Resize chart on container resizes.
  useEffect(() => {
    if(!chartContainerRef.current) return;

    resizeObserver.current = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      chart.current.applyOptions({
        width: width,
        height: height,
      });
    });

    resizeObserver.current.observe(chartContainerRef.current);

    return () => resizeObserver.current.disconnect();
  }, []);


  if(!initialChartData) return <ChartLoaderSpinner text={"Loading data"}/>;

  //setup legends
  const legendList = legends.items.map((legend, key) => <div key={key}>{legend.component}</div>);

  return (
    <ContainerStyle>
      <LegendContainer>{legendList}</LegendContainer>
      <div ref={chartContainerRef} style={{
        width: '100%',
        height: '100%',
      }}/>
    </ContainerStyle>
  );
};

export default memo(ChartView);
