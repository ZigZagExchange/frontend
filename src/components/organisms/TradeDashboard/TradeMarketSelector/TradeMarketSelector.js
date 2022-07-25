import React from "react";
import TradeHead from "./TradeHead/TradeHead";
import styled from "@xstyled/styled-components";
import { formatPrice, addComma } from "lib/utils";

const StyledTradeMarketSelector = styled.header`
  display: flex;
  grid-area: marketSelector;
`;

export default function TradeMarketSelector(props) {
  const lastPriceTableData = [];
  const markets = [];

  if (props.lastPrices) {
    Object.keys(props.lastPrices).forEach((market) => {
      markets.push(market);
      const price = props.lastPrices[market].price;
      const change = props.lastPrices[market].change;
      const pctchange = ((change / price) * 100).toFixed(2);
      const quoteCurrency = market.split("-")[1];
      const quoteCurrencyUSDC = quoteCurrency + "-USDC";
      let quoteCurrencyPrice = 0;
      if (quoteCurrency === "USDC" || quoteCurrency === "USDT") {
        quoteCurrencyPrice = 1;
      }
      if (props.lastPrices[quoteCurrencyUSDC]) {
        quoteCurrencyPrice = props.lastPrices[quoteCurrencyUSDC].price;
      }
      let usdVolume = 0;
      usdVolume = parseFloat(props.lastPrices[market].quoteVolume) * quoteCurrencyPrice;
      lastPriceTableData.push({
        td1: market,
        td2: addComma(formatPrice(price)),
        td3: pctchange,
        usdVolume,
      });
    });
  }
  lastPriceTableData.sort((a, b) => b.usdVolume - a.usdVolume);
  return (
    <StyledTradeMarketSelector>
      <TradeHead
        updateMarketChain={props.updateMarketChain}
        marketSummary={props.marketSummary}
        rowData={lastPriceTableData}
        currentMarket={props.currentMarket}
        marketInfo={props.marketInfo}
      />
    </StyledTradeMarketSelector>
  );
}
