import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import TokenDropDownModal from "components/organisms/TokenDropdownModal";
import api from "lib/api";
import {
  SwitchVerticalIcon,
  SwitchHorizontalIcon,
} from "@heroicons/react/solid";
import { useCoinEstimator } from "components";
import { userSelector } from "lib/store/features/auth/authSlice";
import {
  networkSelector,
  balancesSelector,
  lastPricesSelector,
  currentMarketSelector,
  marketInfoSelector,
  setCurrentMarket,
  resetData,
} from "lib/store/features/api/apiSlice";
import { formatUSD, formatPrice } from "lib/utils";

const SwapContianer = ({ setTransactionType, transactionType }) => {
  const dispatch = useDispatch();
  const user = useSelector(userSelector);
  const balanceData = useSelector(balancesSelector);
  const pairPrices = useSelector(lastPricesSelector);
  const currentMarket = useSelector(currentMarketSelector);
  const network = useSelector(networkSelector);
  const marketInfo = useSelector(marketInfoSelector);
  const [pairs, setGetPairs] = useState([]);
  const [fromTokenList, setFromTokenList] = useState([]);
  const [fromToken, setFromToken] = useState();
  const [toToken, setToToken] = useState();
  const [basePrice, setBasePrice] = useState(0);

  const [fromAmounts, setFromAmounts] = useState(0);
  const [toAmounts, setToAmounts] = useState(0);

  const [balances, setBalances] = useState([]);

  const coinEstimator = useCoinEstimator();

  const estimatedValue = fromAmounts * coinEstimator(fromToken?.name) || 0;

  // const walletBalances = useMemo(
  //   () => (balanceData.wallet ? balanceData.wallet : {}),
  //   [balanceData.wallet]
  // );
  const zkBalances = useMemo(
    () => (balanceData[network] ? balanceData[network] : {}),
    [balanceData, network]
  );
  // const polygonBalances = useMemo(
  //   () => (balanceData.polygon ? balanceData.polygon : {}),
  //   [balanceData.polygon]
  // );

  useEffect(() => {
    const timer = setInterval(() => {
      setFromTokenList(api.getCurrencies());
      setGetPairs(api.getPairs());
    }, 500);
    if (fromTokenList.length > 0) {
      clearInterval(timer);
    }
    return () => {
      clearInterval(timer);
    };
  }, [fromTokenList]);

  useEffect(async () => {
    if (!user.address) return;
    setBalances(zkBalances);
  }, [user.address, zkBalances]);

  useEffect(() => {
    if (fromToken && toToken) {
      const p_name = fromToken.name + "-" + toToken.name;
      const r_p_name = toToken.name + "-" + fromToken.name;
      Object.keys(pairPrices).forEach((pair) => {
        if (pair === p_name) {
          setBasePrice(pairPrices[pair].price);
          const x = fromAmounts * pairPrices[pair].price;
          setToAmounts(x);
          setTransactionType("sell");
          dispatch(setCurrentMarket(p_name));
        } else if (pair === r_p_name) {
          setBasePrice(1 / pairPrices[pair].price);
          const x = (fromAmounts * 1) / pairPrices[pair].price;
          setToAmounts(x);
          setTransactionType("buy");
          dispatch(setCurrentMarket(r_p_name));
        }
      });
    }
  }, [fromToken, toToken]);

  useEffect(() => {
    const sub = () => {
      dispatch(resetData());
      api.subscribeToMarket(currentMarket);
    };

    if (api.ws && api.ws.readyState === 0) {
      api.on("open", sub);
    } else {
      sub();
    }

    return () => {
      if (api.ws && api.ws.readyState !== 0) {
        api.unsubscribeToMarket(currentMarket);
      } else {
        api.off("open", sub);
      }
    };
  }, [network, currentMarket, api.ws]);

  const fromTokenOptions = useMemo(() => {
    if (fromTokenList.length > 0) {
      const p = fromTokenList.map((item, index) => {
        return { id: index, name: item };
      });
      setFromToken(p[0]);
      return p;
    } else {
      return [];
    }
  }, [fromTokenList]);

  const toTokenOptions = useMemo(() => {
    const p = pairs.map((item) => {
      const a = item.split("-")[0];
      const b = item.split("-")[1];
      if (a === fromToken.name) {
        return b;
      } else if (b === fromToken.name) {
        return a;
      } else {
        return null;
      }
    });
    var filtered = p
      .filter(function (el) {
        return el != null;
      })
      .map((item, index) => {
        return { id: index, name: item };
      });
    if (toToken) {
      const d = filtered.find((item) => item.name === toToken.name);
      if (d === undefined) {
        setToToken(filtered[0]);
      } else {
        setToToken(d);
      }
    } else {
      setToToken(filtered[0]);
    }

    return filtered;
  }, [fromToken, pairs]);

  const onChangeFromToken = (option) => {
    setFromToken(option);
  };

  const onChangeToToken = (option) => {
    setToToken(option);
  };

  const onSwitchTokenBtn = () => {
    const p = fromTokenOptions.find((item) => item.name === toToken.name);
    setFromToken(p);
    setToToken(fromToken);
  };

  const onChangeFromAmounts = (event) => {
    setFromAmounts(event.target.value);
    const x = event.target.value * basePrice;
    setToAmounts(x);
  };

  return (
    <div className="p-4 mt-4 border-t border-b border-l border-r rounded-lg dark:border-foreground-400 border-primary-500">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold font-work">From</p>
        <p className="text-sm font-normal font-work">
          Available Balance:{" "}
          {balances[fromToken?.name]
            ? balances[fromToken?.name].valueReadable.toPrecision(8)
            : "0.00"}
          {` ${fromToken?.name}`}
        </p>
      </div>
      <div className="flex items-center justify-between px-3 py-2 mt-3 rounded-lg dark:bg-foreground-200 bg-primary-300">
        {fromTokenOptions.length > 0 && (
          <TokenDropDownModal
            tickers={fromTokenOptions}
            onSelectedOption={onChangeFromToken}
            selectedOption={fromToken}
          />
        )}
        <button className="bg-[#07071C] px-2 py-1 rounded-md text-sm font-semibold text-primary-900 ml-2.5 hover:bg-slate-800 font-work">
          Max
        </button>
        <input
          className="ml-3 text-2xl font-semibold text-right bg-transparent focus:outline-none"
          placeholder="0.00"
          onChange={onChangeFromAmounts}
          value={fromAmounts}
        />
      </div>
      <p className="mt-1 text-sm font-normal text-right text-slate-400 font-work">
        Estimated value: ~ ${formatUSD(estimatedValue)}
      </p>
      <div className="relative h-px mx-2 my-5 dark:bg-foreground-400 bg-primary-500">
        <button
          className="absolute inset-x-0 w-10 h-10 mx-auto -mt-5 rounded-full shadow-xl bg-gradient-to-r from-primary-900 to-secondary-900"
          onClick={onSwitchTokenBtn}
        >
          <SwitchVerticalIcon className="absolute inset-x-0 mx-auto -mt-3.5 w-7 hover:opacity-80 text-white" />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">To</p>
        <p className="flex items-center text-sm font-normal font-work">
          1 {fromToken?.name} = {formatPrice(basePrice)} {toToken?.name}
          <SwitchHorizontalIcon className="w-4" />
        </p>
      </div>
      <div className="flex items-center justify-between px-3 py-2 mt-3 rounded-lg">
        {toTokenOptions?.length > 0 && (
          <TokenDropDownModal
            tickers={toTokenOptions}
            onSelectedOption={onChangeToToken}
            selectedOption={toToken}
          />
        )}
        <input
          className="ml-3 text-2xl font-semibold text-right bg-transparent focus:outline-none"
          placeholder="0.00"
          value={toAmounts.toPrecision(6)}
        />
      </div>
    </div>
  );
};

export default SwapContianer;
