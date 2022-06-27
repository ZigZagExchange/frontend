import React, { memo, useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { ChartHeader } from "./ChartComponents/ChartHeader";
import { fetcher } from "./ChartUtils/fetchers";
import ChartView from "./ChartView";
import { candleStickFormatter } from "./ChartUtils/formatters";
import binanceListener from "./ChartUtils/listeners/binance.listen";

const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #131722;
  border: 1px solid rgba(250, 250, 250, .15);
`;

class ErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      error: undefined,
    }
  }
  static getDerivedStateFromError(error){
    return {
      error: error
    };
  }
  componentDidCatch(error){
    this.setState({
      error: error
    });
  }

  render(){
    const {error} = this.state;
    if(error) console.error("error: ", error);
    
    return (
      <>
        { error ? (
          <>
            An error occured
          </>
        ) : (
          <>
            {this.props.children}
          </>
        )}
      </>

    )
  }
}

const TradeChart = (({
  marketInfo,  
  pair,
  exchange
}) => {
  const [error, setError] = useState(undefined);

  const [interval, setInterval] = useState('1h');
  const [candleData, setData] = useState(undefined);
  const [updateData, setUpdateData] = useState(undefined);

  const intervals = [
    {value: '1m', string: '1 Minute'},
    {value: '3m', string: '3 Minutes'},
    {value: '5m', string: '5 Minutes'},
    {value: '15m', string: '15 Minutes'},
    {value: '30m', string: '30 Minutes'},
    {value: '1h', string: 'Hourly'},
    {value: '4h', string: '4 Hours'},
    {value: '1d', string: 'Daily'},
    {value: '1w', string: 'Weekly'},
    {value: '1M', string: 'Monthly'},
  ];

  //fetch and set candle data once pair or interval changes
  const fetchCandleData = useCallback(async () => {
    const transformedData = await fetcher(pair, interval, exchange);
    const formattedData = candleStickFormatter(transformedData, exchange);
    setData(formattedData);
  }, [pair, interval]);

  //fetch candle data using websockets and add it to the data. 
  useEffect(() => {
    var ws, listener;
    if(error) return;

    var formattedInterval;
    switch(exchange.toLowerCase()){

      case "coinbase":
        //setError({message: "Not implemented"});
        break;
      case "coinex":
        //setError({message: "Not implemented"});
        break;
      case "ftx":
        //setError({message: "Not implemented"});
        break;
      case "binance":
      default:
        formattedInterval = interval;
        ws = new WebSocket(`wss://stream.binance.com/ws/${pair.toLowerCase()}@kline_${formattedInterval}`);
        listener = binanceListener;
    }

    //no valid websocket found.
    if(!ws) return;

    ws.onerror = (e) => {
      setError(e);
    };

    try{
      //start listener
      listener(ws, (candle) => {
        //update candlestick data
        if(error) return;
        setUpdateData(candle);
      });
    } catch(e) {
      setError(e);
    }

    return () => {
      ws.close();
    }

  }, [pair, interval]);

  useEffect(() => {
    fetchCandleData()
    .catch((e) => {
      setError(e);
    });


  }, [fetchCandleData, interval ])

  return (
    <ChartContainer>
    <ChartHeader
      marketInfo={marketInfo}       
      interval={interval} 
      intervals={intervals}
      setInterval={(i)  => {
        setInterval(i);
      }}
    />
    <ErrorBoundary error={error}>
      <ChartView
        initialChartData={candleData}
        updateData={updateData}
        candleStickConfig={{
          priceFormat: {
            type: 'price',
            precision: 8,
            minMove: 0.001,
          }
        }}
        histogramConfig={{
          priceLineVisible: false,
          lastValueVisible: false,
          overlay: true,
          scaleMargins: {
            top: 0.85,
            bottom: 0,
          },
        }}
      />
    </ErrorBoundary>
  </ChartContainer>
);
});

export default memo(TradeChart);
