import { useMemo } from "react";
import { useSelector } from "react-redux";
import { lastPricesSelector } from "lib/store/features/api/apiSlice";
import { stables } from "lib/helpers/categories";

export function useCoinEstimator() {
  const pairPrices = useSelector(lastPricesSelector);
  let prices = { DAI: 1, FRAX: 1 };

  return useMemo(() => {
    Object.keys(pairPrices).forEach((pair) => {
      const [a, b] = pair.split("-").map((s) => s.toUpperCase());
      if (stables.includes(a)) {
        prices[b] = pairPrices[pair].price;
      }
      if (stables.includes(b)) {
        prices[a] = pairPrices[pair].price;
      }
    });

    if (!prices.WETH && prices.ETH) {
      prices.WETH = prices.ETH;
    }

    return (token) => {
      return parseFloat(prices && prices[token] ? prices[token] : 0).toFixed(2);
    };
  }, [pairPrices]);
}
