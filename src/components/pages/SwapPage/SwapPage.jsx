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
import { formatPrice } from "lib/utils";
import { LoadingSpinner } from "components/atoms/LoadingSpinner";

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
  const [sellTokenList, setSellTokenList] = useState([]);
  const [sellToken, setSellToken] = useState();
  const [buyToken, setBuyToken] = useState();
  const [basePrice, setBasePrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const [sellAmounts, setSellAmounts] = useState(0);
  const [buyAmounts, setBuyAmounts] = useState(0);

  const [balances, setBalances] = useState([]);

  const [orderButtonDisabled, setOrderButtonDisabled] = useState(false);

  const estimatedValue = sellAmounts * coinEstimator(sellToken?.name) || 0;

  const zkBalances = useMemo(
    () => (balanceData[network] ? balanceData[network] : {}),
    [balanceData, network]
  );

  useEffect(() => {
    setLoading(true);
    const timer = setInterval(() => {
      setSellTokenList(api.getCurrencies());
      setGetPairs(api.getPairs());
    }, 500);
    if (sellTokenList.length > 0) {
      clearInterval(timer);
      setLoading(false);
    }
    return () => {
      clearInterval(timer);
    };
  }, [sellTokenList]);

  useEffect(async () => {
    if (!user.address) return;
    setBalances(zkBalances);
  }, [user.address, zkBalances]);

  useEffect(() => {
    if (sellToken && buyToken) {
      const p_name = sellToken.name + "-" + buyToken.name;
      const r_p_name = buyToken.name + "-" + sellToken.name;
      Object.keys(pairPrices).forEach((pair) => {
        if (pair === p_name) {
          setBasePrice(pairPrices[pair].price);
          const x = sellAmounts * pairPrices[pair].price;
          setBuyAmounts(x);
          setTtype("sell");
          dispatch(setCurrentMarket(p_name));
        } else if (pair === r_p_name) {
          setBasePrice(1 / pairPrices[pair].price);
          const x = (sellAmounts * 1) / pairPrices[pair].price;
          setBuyAmounts(x);
          setTtype("buy");
          dispatch(setCurrentMarket(r_p_name));
        }
      });
    }
  }, [sellToken, buyToken]);

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
  };

  const getFirstAsk = () => {
    if (!marketInfo) return 0;
    const asks = liquidity.filter((l) => l[0] === "s").map((l) => l[1]);
    return formatPrice(Math.min(...asks));
  };

  const getFirstBid = () => {
    if (!marketInfo) return 0;
    const bids = liquidity.filter((l) => l[0] === "b").map((l) => l[1]);
    return formatPrice(Math.max(...bids));
  };

  const getLadderPrice = () => {
    if (!marketInfo) return 0;
    const side = tType === "buy" ? "b" : "s";
    let baseAmount = sellAmounts;
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
  };

  const fromTokenOptions = useMemo(() => {
    if (sellTokenList.length > 0) {
      const p = sellTokenList.map((item, index) => {
        return { id: index, name: item };
      });
      setSellToken(p[0]);
      return p;
    } else {
      return [];
    }
  }, [sellTokenList]);

  const buyTokenOptions = useMemo(() => {
    const p = pairs.map((item) => {
      const a = item.split("-")[0];
      const b = item.split("-")[1];
      if (a === sellToken.name) {
        return b;
      } else if (b === sellToken.name) {
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
    if (buyToken) {
      const d = filtered.find((item) => item.name === buyToken.name);
      if (d === undefined) {
        setBuyToken(filtered[0]);
      } else {
        setBuyToken(d);
      }
    } else {
      setBuyToken(filtered[0]);
    }

    return filtered;
  }, [sellToken, pairs]);

  const onChangeSellToken = (option) => {
    setSellToken(option);
  };

  const onChangeBuyToken = (option) => {
    setBuyToken(option);
  };

  const onSwitchTokenBtn = () => {
    const p = fromTokenOptions.find((item) => item.name === buyToken.name);
    setSellToken(p);
    setBuyToken(sellToken);
  };

  const onChangeSellAmounts = (event) => {
    setSellAmounts(event.target.value);
    const x = event.target.value * basePrice;
    setBuyAmounts(x);
  };

  const onClickExchange = async () => {
    let baseAmount, quoteAmount;
    if (typeof sellAmounts === "string") {
      baseAmount = parseFloat(sellAmounts.replace(",", "."));
    } else {
      baseAmount = sellAmounts;
    }
    if (typeof buyAmounts === "string") {
      quoteAmount = parseFloat(buyAmounts.replace(",", "."));
    } else {
      quoteAmount = buyAmounts;
    }
    quoteAmount = isNaN(quoteAmount) ? 0 : quoteAmount;
    baseAmount = isNaN(baseAmount) ? 0 : baseAmount;
    if (!baseAmount && !quoteAmount) {
      toast.error("No amount available", {
        toastId: "No amount available",
      });
      return;
    }

    let price = currentPrice();
    if (!price) {
      toast.error("No price available", {
        toastId: "No price available",
      });
      return;
    }

    if (price < 0) {
      toast.error(`Price (${price}) can't be below 0`, {
        toastId: `Price (${price}) can't be below 0`,
      });
      return;
    }

    if (tType === "buy") {
      const bidPrice = getFirstBid();
      const delta = ((price - bidPrice) / bidPrice) * 100;
      if (delta > 2) {
        toast.error(
          `You are buying ${delta.toFixed(
            2
          )}% above the current market price. You could lose money when signing this transaction!`,
          {
            toastId: `You are buying ${delta.toFixed(
              2
            )}% above the current market price. You could lose money when signing this transaction!`,
          }
        );
      }
    } else {
      const askPrice = getFirstAsk();
      const delta = ((askPrice - price) / askPrice) * 100;
      if (delta > 2) {
        toast.error(
          `You are selling ${delta.toFixed(
            2
          )}% under the current market price. You could lose money when signing this transaction!`,
          {
            toastId: `You are selling ${delta.toFixed(
              2
            )}% under the current market price. You could lose money when signing this transaction!`,
          }
        );
      }
    }
    const baseBalance = balances[sellToken?.name]?.valueReadable;

    if (tType === "sell") {
      if (baseAmount && baseAmount + marketInfo.baseFee > baseBalance) {
        toast.error(`Amount exceeds ${marketInfo.baseAsset.symbol} balance`, {
          toastId: `Amount exceeds ${marketInfo.baseAsset.symbol} balance`,
        });
        return;
      }

      if (
        (baseAmount && baseAmount < marketInfo.baseFee) ||
        baseBalance === undefined
      ) {
        toast.error(
          `Minimum order size is ${marketInfo.baseFee.toPrecision(5)} ${
            marketInfo.baseAsset.symbol
          }`
        );
        return;
      }
    } else {
      if (baseAmount && baseAmount + marketInfo.quoteFee > baseBalance) {
        toast.error(`Amount exceeds ${marketInfo.quoteAsset.symbol} balance`, {
          toastId: `Amount exceeds ${marketInfo.quoteAsset.symbol} balance`,
        });
        return;
      }

      if (
        (baseAmount && baseAmount < marketInfo.quoteFee) ||
        baseBalance === undefined
      ) {
        toast.error(
          `Minimum order size is ${marketInfo.quoteFee.toPrecision(5)} ${
            marketInfo.quoteAsset.symbol
          }`
        );
        return;
      }
    }

    let orderPendingToast;
    setOrderButtonDisabled(true);
    if (api.isZksyncChain()) {
      orderPendingToast = toast.info(
        "Order pending. Sign or Cancel to continue...",
        {
          toastId: "Order pending. Sign or Cancel to continue...",
        }
      );
    }

    try {
      await api.submitOrder(
        currentMarket,
        tType === "buy" ? "b" : "s",
        tType === "buy" ? price * 1.0015 : price * 0.9985,
        tType === "sell" ? baseAmount : 0,
        tType === "buy" ? baseAmount : 0,
        "market"
      );
      setTimeout(() => {
        setOrderButtonDisabled(false);
      }, 8000);
    } catch (e) {
      console.log(e);
      toast.error(e.message);
      setOrderButtonDisabled(false);
    }
    if (api.isZksyncChain()) {
      toast.dismiss(orderPendingToast);
    }
  };

  const onClickMax = () => {
    const balance = balances[sellToken?.name]?.valueReadable;
    const fees = tType === "sell" ? marketInfo?.baseFee : marketInfo?.quoteFee;
    console.log(balance, fees);
    if (balance && fees) {
      const s_amounts = balance - fees;
      setSellAmounts(s_amounts);
    }
  };

  return (
    <DefaultTemplate>
      {loading && (
        <div
          className={classNames("flex justify-center align-center mt-48", {
            dark: isDark,
          })}
        >
          <LoadingSpinner />
        </div>
      )}
      {!loading && (
        <div className={classNames("flex justify-center", { dark: isDark })}>
          <div>
            <p className="mt-10 text-3xl font-semibold font-work ">
              Quick DEX Swap
            </p>
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
              <p className="text-sm font-work">Network</p>
              <InfoIcon size={16} />
            </div>
            <NetworkSelection className="mt-2" />
            <SwapContianer
              setTransactionType={(type) => setTtype(type)}
              transactionType={tType}
              balances={balances}
              fromToken={sellToken}
              fromTokenOptions={fromTokenOptions}
              onChangeFromToken={onChangeSellToken}
              onChangeFromAmounts={onChangeSellAmounts}
              fromAmounts={sellAmounts}
              estimatedValue={estimatedValue}
              onSwitchTokenBtn={onSwitchTokenBtn}
              basePrice={basePrice}
              toToken={buyToken}
              toTokenOptions={buyTokenOptions}
              onChangeToToken={onChangeBuyToken}
              toAmounts={buyAmounts}
              onClickMax={onClickMax}
            />
            <TransactionSettings transactionType={tType} />
            <Button
              isLoading={false}
              className="w-full py-3 mt-3 uppercase"
              scale="imd"
              onClick={onClickExchange}
              disabled={orderButtonDisabled || !user.address}
            >
              Exchange
            </Button>
          </div>
        </div>
      )}
    </DefaultTemplate>
  );
}
