import React, { memo, useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { ChartHeader } from "./ChartComponents/ChartHeader";
import { fetcher } from "./ChartUtils/fetchers";
import ChartView from "./ChartView";
import { candleStickFormatter } from "./ChartUtils/formatters";
import binanceListener from "./ChartUtils/listeners/binance.listen";
import { ChartLegend } from "./ChartComponents/ChartLegend";
import coinbaseListener from "./ChartUtils/listeners/coinbase.listen";

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
  pair, exchange
}) => {
  const [error, setError] = useState(undefined);

  const [interval, setInterval] = useState('1h');
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
  
  const [candleData, setData] = useState(undefined);
  const [updateData, setUpdateData] = useState(undefined);

  //legend 1
  const [selectedLegendCandle, setLegendCandle] = useState(undefined);
  const [priorLegendCandle, setPriorLegendCandle] = useState(undefined);

  const legends = {
    items: [  {
      name: 'Last Candle Information (OHLC)',
      type: "crosshair",
      fnc: (param) => {
        console.log(param);
        //nothing in current row
        if(param.time === undefined){
          setLegendCandle(undefined);
          const priorCandle = candleData[candleData.length-1];
      
          setLegendCandle(updateData)
          setPriorLegendCandle(priorCandle);
          return;
        }

        //current selected candle
        const candle = candleData.filter((c) => c.time === param.time)[0];
        if(!candle) return;
        const currentCandle = candleData.indexOf(candle); //current candle index
        const previousCandle = candleData[currentCandle - 1]; //candle before current

        setLegendCandle(candleData[currentCandle])
        setPriorLegendCandle(previousCandle);
      },
      component: <ChartLegend
        candleBefore={priorLegendCandle}
        {...selectedLegendCandle} 
      />,
    }],
  };

  //fetch and set candle data once pair or interval changes
  const fetchCandleData = useCallback(async () => {
    const transformedData = await fetcher(pair, interval, exchange);
    const formattedData = candleStickFormatter(transformedData, exchange);
    const priorCandle = formattedData[formattedData.length - 2];
    const lastCandle = formattedData[formattedData.length - 1];
    
    setData(formattedData);

    setUpdateData(lastCandle); 
    setLegendCandle(lastCandle)
    setPriorLegendCandle(priorCandle);
  }, [pair, interval]);

  //fetch candle data using websockets and add it to the data. 
  useEffect(() => {
    var ws, listener, dependencies;
    if(error) return;

    var formattedInterval;
    switch(exchange.toLowerCase()){

      case "coinbase":
        //setError({message: "Not implemented"});
        var _p;
        if(pair.length === 8) _p = pair.match(/.{1,4}/g);
        if(pair.length === 6) _p = pair.match(/.{1,3}/g);
        
        var formattedPair = _p[0] + "-" + _p[1];

        ws = new WebSocket(`wss://ws-feed.exchange.coinbase.com`);
        dependencies = {productIds: [formattedPair], interval, exchange};
        listener = coinbaseListener;
        console.log("set listener", dependencies);
        break;
      case "coinex":
        //setError({message: "Not implemented"});
        break;
      case "ftx":
        //setError({message: "Not implemented"});
        break;
      case "kucoin":
          //setError({message: "Not implemented"});
          break;
      case "binance":
      default:
        formattedInterval = interval;
        ws = new WebSocket(`wss://stream.binance.com/ws/${pair.toLowerCase()}@kline_${formattedInterval}`);
        dependencies = {};
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
        if(error || !candleData) return;
        
        setUpdateData(candle);
        
        //update legends correspondedly
        legends.items.forEach((legend) => {
          legend.fnc({time: undefined});
        });
      }, dependencies);
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
        marketInfo={marketInfo} exchange={exchange}     
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

          legends={legends}
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
