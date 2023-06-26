import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  lastPricesSelector,
  marketInfosSelector,
} from "lib/store/features/api/apiSlice";
import { stables } from "lib/helpers/categories";

export function useCoinEstimator() {
  const pairPrices = useSelector(lastPricesSelector);
  const marketInfos = useSelector(marketInfosSelector);

  let prices = {};
  // add all stablecoins
  stables.forEach((stable) => {
    prices[stable] = 1;
  });

  return useMemo(() => {
    let priceArray = {};
    let remaining = [];

    if (marketInfos) {
      remaining = Object.keys(marketInfos).filter(
        (token) => !stables.includes(token)
      );
      Object.keys(marketInfos).forEach((pair) => {
        const [network, base, quote] = pair
          .split("-")
          .map((s) => s.toUpperCase());
        if (base in priceArray) {
          const arr = priceArray[base];
          arr.push(marketInfos[pair]?.baseAsset?.usdPrice);
          priceArray[base] = arr;
        } else {
          priceArray[base] = [marketInfos[pair]?.baseAsset?.usdPrice];
        }

        const index = remaining.indexOf(base);
        if (index > -1) {
          remaining.splice(index, 1);
        }
      });
    }

    // get mid price of all pairs found with stable pair
    Object.keys(priceArray).forEach((token) => {
      const sum = priceArray[token].reduce((pv, cv) => pv + cv, 0);
      prices[token] = sum / priceArray[token].length;
    });

    if ("ETH" in prices && !("WETH" in prices)) prices.WETH = prices.ETH;
    if ("WETH" in prices && !("ETH" in prices)) prices.ETH = prices.WETH;

    return (token) => {
      const t = token?.toUpperCase();
      return parseFloat(prices && prices[t] ? prices[t] : 0).toFixed(2);
    };
  }, [marketInfos]);
}
