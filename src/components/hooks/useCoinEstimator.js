import { useMemo } from "react";
import { useSelector } from "react-redux";
import { lastPricesSelector } from "lib/store/features/api/apiSlice";
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
    const remaining = Object.keys(pairPrices);
    Object.keys(pairPrices).forEach((pair) => {
      const [base, quote] = pair.split("-").map((s) => s.toUpperCase());
      // add prices form stable pairs
      if (stables.includes(quote)) {
        if (base in priceArray) {
          const arr = priceArray[base];
          arr.push(pairPrices[pair].price);
          priceArray[base] = arr;
        } else {
          priceArray[base] = [pairPrices[pair].price]
        }

        const index = remaining.indexOf(base);
        if (index > -1) {
          remaining.splice(index, 1);
        }
      }
    });

    // get mid price of all pairs found with stable pair
    Object.keys(priceArray).forEach((token) => {
      const sum = priceArray[token].reduce((pv, cv) => pv + cv, 0);
      prices[token] = sum / priceArray[token].length;
    });

    // add prices from other pairs
    priceArray = {};
    remaining.forEach((pair) => {
      const [base, quote] = pair.split("-").map((s) => s.toUpperCase());
      if (quote in prices) {
        const pairPrice = pairPrices[pair].price * prices[quote];
        if (base in priceArray) {
          const arr = priceArray[base];
          arr.push(pairPrice);
          priceArray[base] = arr;
        } else {
          priceArray[base] = [pairPrice]
        }
      }
    });

    // get mid price of all pairs found with other pair
    Object.keys(priceArray).forEach((token) => {
      const sum = priceArray[token].reduce((pv, cv) => pv + cv, 0);
      prices[token] = sum / priceArray[token].length;
    });

    return (token) => {
      return parseFloat(prices && prices[token] ? prices[token] : 0).toFixed(2);
    };
  }, [pairPrices]);
}
