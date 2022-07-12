import React from "react";
import { useSelector } from "react-redux";
import TradeHead from "./TradeHead/TradeHead";
import styled from "@xstyled/styled-components";
import {
  marketSummarySelector,
  marketInfoSelector,
  lastPricesSelector,
} from "lib/store/features/api/apiSlice";

const StyledTradeMarketSelector = styled.header`
  display: flex;
  grid-area: marketSelector;
`;

export default function TradeMarketSelector(props) {
  const marketInfo = useSelector(marketInfoSelector);
  const marketSummary = useSelector(marketSummarySelector);
  const lastPrices = useSelector(lastPricesSelector);

  const lastPriceTableData = [];
  const markets = [];

  Object.keys(lastPrices).forEach((market) => {
    markets.push(market);
    const price = lastPrices[market].price;
    const change = lastPrices[market].change;
    const pctchange = ((change / price) * 100).toFixed(2);
    const quoteCurrency = market.split("-")[1];
    const quoteCurrencyUSDC = quoteCurrency + "-USDC";
    let quoteCurrencyPrice = 0;
    if (quoteCurrency === "USDC" || quoteCurrency === "USDT") {
      quoteCurrencyPrice = 1;
    }
    if (lastPrices[quoteCurrencyUSDC]) {
      quoteCurrencyPrice = lastPrices[quoteCurrencyUSDC].price;
    }
    let usdVolume = 0;
    usdVolume = parseFloat(lastPrices[market].quoteVolume) * quoteCurrencyPrice;
    lastPriceTableData.push({
      td1: market,
      td2: price,
      td3: pctchange,
      usdVolume,
    });
  });
  lastPriceTableData.sort((a, b) => b.usdVolume - a.usdVolume);
  return (
    <StyledTradeMarketSelector>
      <TradeHead
        updateMarketChain={props.updateMarketChain}
        marketSummary={marketSummary}
        rowData={lastPriceTableData}
        currentMarket={props.currentMarket}
        marketInfo={marketInfo}
      />
    </StyledTradeMarketSelector>
  );
}
