import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import useTheme from "components/hooks/useTheme";
import api from "lib/api";
import { Link } from "react-router-dom";
import { DefaultTemplate } from "components";
import { ExternalLinkIcon, InfoIcon } from "components/atoms/Svg";
import NetworkSelection from "components/organisms/NetworkSelection";
import SwapContianer from "./SwapContainer";

import classNames from "classnames";
import "../SwapPage.style.css";
import TransactionSettings from "./TransationSettings";
import { Button } from "components/molecules/Button";

import { useCoinEstimator } from "components";
import { userSelector } from "lib/store/features/auth/authSlice";
import {
  networkSelector,
  balancesSelector,
  lastPricesSelector,
  currentMarketSelector,
  marketInfoSelector,
  liquiditySelector,
  setCurrentMarket,
  resetData,
} from "lib/store/features/api/apiSlice";
import { formatUSD, formatPrice } from "lib/utils";

export default function SwapPage() {
  // const isSwapCompatible = useMemo(
  //   () => network && api.isImplemented("depositL2"),
  //   [network]
  // );
  // const tab = useParams().tab || "swap";
  const coinEstimator = useCoinEstimator();

  const { isDark } = useTheme();
  const [tType, setTtype] = useState("buy");

  const dispatch = useDispatch();
  const user = useSelector(userSelector);
  const balanceData = useSelector(balancesSelector);
  const pairPrices = useSelector(lastPricesSelector);
  const liquidity = useSelector(liquiditySelector);
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

  const [orderButtonDisabled, setOrderButtonDisabled] = useState(false)

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
          setTtype("sell");
          dispatch(setCurrentMarket(p_name));
        } else if (pair === r_p_name) {
          setBasePrice(1 / pairPrices[pair].price);
          const x = (fromAmounts * 1) / pairPrices[pair].price;
          setToAmounts(x);
          setTtype("buy");
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

  const currentPrice = () => {
    var ladderPrice = getLadderPrice();
      return ladderPrice;
  }

  const getLadderPrice =() => {
    if (!marketInfo) return 0;

    const side = tType==='buy'? 'b': 's';
    let baseAmount = fromAmounts;
    if (!baseAmount) baseAmount = 0;

    let price,
      unfilled = baseAmount;
    if (side === "b") {
      const asks = liquidity.filter((l) => l[0] === "s");
      asks.sort((a, b) => a[1] - b[1]);
      for (let i = 0; i < asks.length; i++) {
        if (asks[i][2] >= unfilled || i === asks.length - 1) {
          price = asks[i][1];
          break;
        } else {
          unfilled -= asks[i][2];
        }
      }
    } else if (side === "s") {
      const bids = liquidity.filter((l) => l[0] === "b");

      bids.sort((a, b) => b[1] - a[1]);
      for (let i = 0; i < bids.length; i++) {
        if (bids[i][2] >= unfilled || i === bids.length - 1) {
          price = bids[i][1];
          break;
        } else {
          unfilled -= bids[i][2];
        }
      }
    }
    if (!price) return 0;
    return formatPrice(price);
  }

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

  const onClickExchange = async() => {
    let baseAmount, quoteAmount;
    if (typeof fromAmounts === "string") {
      baseAmount = parseFloat(fromAmounts.replace(",", "."));
    } else {
      baseAmount = fromAmounts;
    }
    if (typeof toAmounts === "string") {
      quoteAmount = parseFloat(toAmounts.replace(",", "."));
    } else {
      quoteAmount = toAmounts;
    }
    quoteAmount = isNaN(quoteAmount) ? 0 : quoteAmount
    baseAmount = isNaN(baseAmount) ? 0 : baseAmount
    if (!baseAmount && !quoteAmount) {
      toast.error("No amount available", {
        toastId: 'No amount available',
      });
      return;
    }

    let price = currentPrice();
    // let price = this.currentPrice();
    // if (!price) {
    //   toast.error("No price available", {
    //     toastId: 'No price available',
    //   });
    //   return;
    // }

    // if (this.props.activeOrderCount > 0 && api.isZksyncChain()) {
    //   toast.error("Only one active order permitted at a time", {
    //     toastId: 'Only one active order permitted at a time',
    //   });
    //   return;
    // }

    const baseBalance = balances[fromToken?.name]?.valueReadable

    if(tType==='sell') {
      if (baseAmount && (baseAmount + marketInfo.baseFee) > baseBalance) {
        toast.error(`Amount exceeds ${marketInfo.baseAsset.symbol} balance`, {
          toastId: `Amount exceeds ${marketInfo.baseAsset.symbol} balance`,
        });
        return;
      }
  
      if ((baseAmount && baseAmount < marketInfo.baseFee) || baseBalance===undefined) {
        toast.error(
          `Minimum order size is ${marketInfo.baseFee.toPrecision(5)
          } ${marketInfo.baseAsset.symbol}`
        );
        return;
      }
    } else {
      if (baseAmount && (baseAmount + marketInfo.quoteFee) > baseBalance) {
        toast.error(`Amount exceeds ${marketInfo.quoteAsset.symbol} balance`, {
          toastId: `Amount exceeds ${marketInfo.quoteAsset.symbol} balance`,
        });
        return;
      }
  
      if ((baseAmount && baseAmount < marketInfo.quoteFee) || baseBalance===undefined) {
        toast.error(
          `Minimum order size is ${marketInfo.quoteFee.toPrecision(5)
          } ${marketInfo.quoteAsset.symbol}`
        );
        return;
      }
    }
    
    let orderPendingToast;
    setOrderButtonDisabled(true);
    if (api.isZksyncChain()) {
      orderPendingToast = toast.info(
        "Order pending. Sign or Cancel to continue...", {
        toastId: "Order pending. Sign or Cancel to continue...",
      }
      );
    }

    try {
      await api.submitOrder(
        currentMarket,
        tType==='buy'? 'b': 's',
        tType==='buy' ? price*0.9985: price*1.0015,
        tType==='sell'? baseAmount: 0,
        tType==='buy'? quoteAmount: 0,
        'market'
      );
    } catch (e) {
      console.log(e);
      toast.error(e.message);
      setOrderButtonDisabled(false);
    }
    console.log(api.isZksyncChain())
    if (api.isZksyncChain()) {
      toast.dismiss(orderPendingToast);
    }
    setOrderButtonDisabled(false);
  };

  return (
    <DefaultTemplate>
      <div className={classNames("flex justify-center", { dark: isDark })}>
        <div>
          <p className="mt-8 text-3xl font-semibold ">Quick DEX Swap</p>
          <p className="mt-2 text-sm text-gray-500">
            Swap into more than 200 tokens, using the best quotes from over 8
            sources.
          </p>
          <Link
            to="/"
            className="flex items-center mt-1 dark:hover:text-foreground-700 dark:text-foreground-900 text-background-900 hover:text-background-800"
          >
            <p className="mr-2">Learn More</p>
            <ExternalLinkIcon size={11} />
          </Link>
          <div className="flex items-center justify-between mt-4">
            <p>Network</p>
            <InfoIcon size={16} />
          </div>
          <NetworkSelection className="mt-2" />
          <SwapContianer
            setTransactionType={(type) => setTtype(type)}
            transactionType={tType}
            balances={balances}
            fromToken={fromToken}
            fromTokenOptions={fromTokenOptions}
            onChangeFromToken={onChangeFromToken}
            onChangeFromAmounts={onChangeFromAmounts}
            fromAmounts={fromAmounts}
            estimatedValue={estimatedValue}
            onSwitchTokenBtn={onSwitchTokenBtn}
            basePrice={basePrice}
            toToken={toToken}
            toTokenOptions={toTokenOptions}
            onChangeToToken={onChangeToToken}
            toAmounts={toAmounts}
          />
          <TransactionSettings transactionType={tType} />
          <Button
            isLoading={false}
            className="w-full py-3 mt-3 uppercase"
            scale="imd"
            onClick={onClickExchange}
            disabled={orderButtonDisabled}
          >
            Exchange
          </Button>
        </div>
      </div>
    </DefaultTemplate>
  );
}
