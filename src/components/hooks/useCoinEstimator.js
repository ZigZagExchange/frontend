import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  lastPricesSelector,
} from "lib/store/features/api/apiSlice";
import { stables } from "lib/helpers/categories";

export function useCoinEstimator() {
  const pairPrices = useSelector(lastPricesSelector);
  let prices = {};
  // add all stablecoins
  stables.forEach((stable) => {
    prices[stable] = 1;
  });

  return useMemo(() => {
    let priceArray = {};
    let remaining = [];
    if (pairPrices) {
      remaining = Object.keys(pairPrices).filter(
        (token) => !stables.includes(token)
      );
      Object.keys(pairPrices).forEach((pair) => {
        const pairPrice = pairPrices[pair].price;
        if (Number.isNaN(pairPrice) || !Number.isFinite(pairPrice)) return;

        const [base, quote] = pair.split("-").map((s) => s.toUpperCase());

        // add prices form stable pairs
        if (stables.includes(quote) && !stables.includes(base)) {
          if (base in priceArray) {
            const arr = priceArray[base];
            arr.push(pairPrice);
            priceArray[base] = arr;
          } else {
            priceArray[base] = [pairPrice];
          }

          const index = remaining.indexOf(base);
          if (index > -1) {
            remaining.splice(index, 1);
          }
        }
      });
    }

    // get mid price of all pairs found with stable pair
    Object.keys(priceArray).forEach((token) => {
      const sum = priceArray[token].reduce((pv, cv) => pv + cv, 0);
      prices[token] = sum / priceArray[token].length;
    });

    // add prices from other pairs
    priceArray = {};
    remaining.forEach((pair) => {
      let pairPrice = pairPrices[pair].price;
      if (Number.isNaN(pairPrice) || !Number.isFinite(pairPrice)) return;
      const [base, quote] = pair.split("-").map((s) => s.toUpperCase());

      if (quote in prices && !stables.includes(base)) {
        pairPrice *= prices[quote];
        if (base in priceArray) {
          const arr = priceArray[base];
          arr.push(pairPrice);
          priceArray[base] = arr;
        } else {
          priceArray[base] = [pairPrice];
        }
      }
    });

    // get mid price of all pairs found with other pair
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
  }, [pairPrices]);
}
