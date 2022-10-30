import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import useTheme from "components/hooks/useTheme";
import api from "lib/api";

import { DefaultTemplate } from "components";
import ConvertContianer from "./ConvertContianer";

import classNames from "classnames";
import TransactionSettings from "./TransationSettings";
import { Button, ConnectWalletButton } from "components/molecules/Button";

import { useCoinEstimator } from "components";
import { userSelector } from "lib/store/features/auth/authSlice";
import { setSlippageValue } from "lib/store/features/api/apiSlice";
import {
  networkSelector,
  balancesSelector,
  lastPricesSelector,
  currentMarketSelector,
  marketInfoSelector,
  liquiditySelector,
  setCurrentMarket,
  resetData,
  settingsSelector,
  userOrdersSelector,
  slippageValueSelector,
  allOrdersSelector,
} from "lib/store/features/api/apiSlice";
import { formatPrice, formatUSD, formatToken, addComma } from "lib/utils";
import { LoadingSpinner } from "components/atoms/LoadingSpinner";

const isMobile = window.innerWidth < 410;

const ConvertPage = () => {
  const coinEstimator = useCoinEstimator();
  const userOrders = useSelector(userOrdersSelector);

  const { isDark } = useTheme();
  const [tType, setTtype] = useState("buy");

  const dispatch = useDispatch();
  const user = useSelector(userSelector);
  const settings = useSelector(settingsSelector);
  const balanceData = useSelector(balancesSelector);
  const pairPrices = useSelector(lastPricesSelector);
  const liquidity = useSelector(liquiditySelector);
  const allOrders = useSelector(allOrdersSelector);
  const currentMarket = useSelector(currentMarketSelector);
  const network = useSelector(networkSelector);
  const marketInfo = useSelector(marketInfoSelector);
  const slippageValue = useSelector(slippageValueSelector);

  const [pairs, setGetPairs] = useState([]);
  const [sellTokenList, setSellTokenList] = useState([]);
  const [sellToken, setSellToken] = useState();
  const [buyToken, setBuyToken] = useState();
  const [loading, setLoading] = useState(false);

  const [sellAmounts, setSellAmounts] = useState();
  const [buyAmounts, setBuyAmounts] = useState();

  const [balances, setBalances] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(1);

  const [orderButtonDisabled, setOrderButtonDisabled] = useState(false);
  const [errorMsg, setError] = useState("");
  const [approveNeeded, setApproveNeeded] = useState(false);
  const [changedBuyAmount, setChangedBuyAmount] = useState(false);
  const [changedSellAmount, setChangedSellAmount] = useState(false);

  const [transactionFee, setTransactionFee] = useState(0);

  const estimatedValueSell = sellAmounts * coinEstimator(sellToken?.name) || 0;
  const estimatedValueBuy = buyAmounts * coinEstimator(buyToken?.name) || 0;
  const estimatedValueFee =
    transactionFee * coinEstimator(sellToken?.name) || 0;

  const zkBalances = useMemo(
    () => (balanceData[network] ? balanceData[network] : {}),
    [balanceData, network]
  );

  useEffect(() => {
    setSellTokenList([]);
    setGetPairs([]);
  }, [network]);

  useEffect(() => {
    setLoading(true);
    const timer = setInterval(() => {
      setSellTokenList(api.getCurrencies());
      setGetPairs(api.getPairs());
    }, 50);
    if (sellTokenList.length > 0) {
      clearInterval(timer);
      setLoading(false);
    }
    return () => {
      clearInterval(timer);
    };
  }, [sellTokenList, network, currentMarket]);

  useEffect(async () => {
    if (user.address !== undefined) {
      setBalances(zkBalances);
    }
  }, [user.address, zkBalances]);

  useEffect(() => {
    document.title = "ZigZag Convert";
  }, []);

  useEffect(() => {
    if (sellToken && buyToken) {
      // check if the current market can fill the trades
      if (currentMarket === `${sellToken}-${buyToken}`) {
        setTtype("sell");
        return;
      }
      if (currentMarket === `${buyToken}-${sellToken}`) {
        setTtype("buy");
        return;
      }

      // get a new pair
      const p_name = sellToken.name + "-" + buyToken.name;
      const r_p_name = buyToken.name + "-" + sellToken.name;
      let c = false;
      Object.keys(pairPrices).forEach((pair) => {
        if (pair === p_name) {
          setTtype("sell");
          console.log(`Convert set sell pair to ${p_name}`);
          dispatch(setCurrentMarket(p_name));
          c = true;
        }
      });
      if (c === false) {
        Object.keys(pairPrices).forEach((pair) => {
          if (pair === r_p_name) {
            setTtype("buy");
            console.log(`Convert set buy pair to ${r_p_name}`);
            dispatch(setCurrentMarket(r_p_name));
          }
        });
      }
    }
    isValid();
  }, [sellToken, buyToken]);

  useEffect(() => {
    if (!api.checkAccountActivated()) {
      toast.error(
        "Your zkSync account is not activated. Please use the bridge to deposit funds into zkSync and activate your zkSync wallet.",
        {
          autoClose: 60000,
        }
      );
    }
    const sub = () => {
      dispatch(resetData());
      api.subscribeToMarket(currentMarket, settings.showNightPriceChange);
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
  }, [network, currentMarket, api.ws, settings.showNightPriceChange]);

  useEffect(() => {
    const fee =
      tType === "sell"
        ? getBaseFee(Number(buyAmounts))
        : getQuoteFee(Number(sellAmounts));
    setTransactionFee(fee);
    isValid();
  }, [sellAmounts, buyAmounts, userOrders, marketInfo]);

  useEffect(() => {
    let price;
    if (api.isZksyncChain()) {
      price = getLadderPriceZkSync_v1();
    } else {
      price = getLadderPrice();
    }
    price *=
      tType === "buy" ? 1 + slippageValue / 100 : 1 - slippageValue / 100;

    setCurrentPrice(price);
  }, [liquidity, allOrders, slippageValue, tType]);

  useEffect(() => {
    if (changedBuyAmount) {
      const newSellAmount =
        tType === "sell"
          ? buyAmounts / currentPrice
          : buyAmounts * currentPrice;
      setBuyAmounts(newSellAmount);
    }

    if (changedSellAmount) {
      const newBuyAmount =
        tType === "sell"
          ? sellAmounts * currentPrice
          : sellAmounts / currentPrice;
      setBuyAmounts(newBuyAmount);
    }
  }, [currentPrice]);

  const getBaseBalance = () => {
    if (!marketInfo) return 0;
    if (!balances?.[marketInfo.baseAsset.symbol]?.valueReadable) return 0;
    let totalBalance = balances[marketInfo.baseAsset.symbol].valueReadable;
    if (!userOrders) return totalBalance;

    Object.keys(userOrders).forEach((orderId) => {
      const order = userOrders[orderId];
      const sellToken =
        order[3] === "s" ? order[2].split("-")[0] : order[2].split("-")[1];
      if (sellToken === marketInfo.baseAsset.symbol) {
        totalBalance -= order[10]; // remove remaining order size
      }
    });

    return Number(totalBalance);
  };

  const getQuoteBalance = () => {
    if (!marketInfo) return 0;
    if (!balances?.[marketInfo.quoteAsset.symbol]?.valueReadable) return 0;
    let totalBalance = balances[marketInfo.quoteAsset.symbol].valueReadable;
    if (!userOrders) return totalBalance;

    Object.keys(userOrders).forEach((orderId) => {
      const order = userOrders[orderId];
      const sellToken =
        order[3] === "s" ? order[2].split("-")[0] : order[2].split("-")[1];
      if (sellToken === marketInfo.quoteAsset.symbol) {
        totalBalance -= order[4] * order[10]; // remove remaining order size
      }
    });

    return Number(totalBalance);
  };

  const getBaseAllowance = () => {
    if (!marketInfo) return 0;
    if (!balances?.[marketInfo.baseAsset.symbol]?.allowanceReadable) return 0;
    return Number(balances[marketInfo.baseAsset.symbol].allowanceReadable);
  };

  const getQuoteAllowance = () => {
    if (!marketInfo) return 0;
    if (!balances?.[marketInfo.quoteAsset.symbol]?.allowanceReadable) return 0;
    return Number(balances[marketInfo.quoteAsset.symbol].allowanceReadable);
  };

  const getBaseFee = (amount) => {
    if (!marketInfo) return 0;
    let fee = marketInfo.baseFee;
    fee +=
      marketInfo.makerVolumeFee && amount
        ? amount * marketInfo.makerVolumeFee
        : 0;
    return fee;
  };

  const getQuoteFee = (amount) => {
    if (!marketInfo) return 0;
    let fee = marketInfo.quoteFee;
    fee +=
      marketInfo.makerVolumeFee && amount
        ? amount * marketInfo.makerVolumeFee
        : 0;
    return fee;
  };

  /*
   * zkSync does not allow partial fills, so the ladder price is the first
   * liquidity that can fill the order size.
   */
  const getLadderPriceZkSync_v1 = () => {
    let baseAmount = tType === "sell" ? sellAmounts : buyAmounts;

    if (!baseAmount) baseAmount = 0;

    let price;
    if (tType === "buy") {
      const asks = liquidity.filter((l) => l[0] === "s");
      asks.sort((a, b) => a[1] - b[1]);

      for (let i = 0; i < asks.length; i++) {
        if (asks[i][2] >= baseAmount || i === asks.length - 1) {
          price = asks[i][1];
          break;
        }
      }
    } else if (tType === "sell") {
      const bids = liquidity.filter((l) => l[0] === "b");
      bids.sort((a, b) => b[1] - a[1]);

      for (let i = 0; i < bids.length; i++) {
        if (bids[i][2] >= baseAmount || i === bids.length - 1) {
          price = bids[i][1];
          break;
        }
      }
    }
    if (!price) return 0;
    return price;
  };

  const getLadderPrice = () => {
    const orderbookAsks = [];
    const orderbookBids = [];
    let baseAmount = tType === "sell" ? sellAmounts : buyAmounts;
    if (!baseAmount) baseAmount = 0;

    for (let orderid in allOrders) {
      const order = allOrders[orderid];
      const side = order[3];
      const price = order[4];
      const remaining = isNaN(Number(order[10])) ? order[5] : order[10];
      const orderStatus = order[9];

      const orderEntry = [price, remaining];

      if (side === "b" && ["o", "pm", "pf"].includes(orderStatus)) {
        orderbookBids.push(orderEntry);
      } else if (side === "s" && ["o", "pm", "pf"].includes(orderStatus)) {
        orderbookAsks.push(orderEntry);
      }
    }

    let price;
    let unfilled = baseAmount;
    if (tType === "buy" && orderbookAsks) {
      for (let i = orderbookAsks.length - 1; i >= 0; i--) {
        if (orderbookAsks[i][1] >= unfilled || i === 0) {
          price = orderbookAsks[i][0];
          break;
        } else {
          unfilled -= orderbookAsks[i][1];
        }
      }
    } else if (tType === "sell" && orderbookBids) {
      for (let i = orderbookBids.length - 1; i >= 0; i--) {
        if (orderbookBids[i][1] >= unfilled || i === 0) {
          price = orderbookBids[i][0];
          break;
        } else {
          unfilled -= orderbookBids[i][1];
        }
      }
    }
    if (!price) return 0;
    return price;
  };

  const fromTokenOptions = useMemo(() => {
    if (sellTokenList.length > 0) {
      const p = sellTokenList.map((item, index) => {
        const price = balances[item]?.valueReadable
          ? `$ ${formatUSD(
              coinEstimator(item) * balances[item]?.valueReadable
            )}`
          : "";
        return {
          id: index,
          name: item,
          balance: balances[item]?.valueReadable
            ? formatToken(balances[item]?.valueReadable, item)
            : "0.0000000",
          price: price !== "" ? `${price}` : "$ 0.00",
        };
      });
      const s = p.sort((a, b) => {
        return (
          parseFloat(
            b.price.substring(1).replaceAll(",", "").replaceAll(" ", "")
          ) -
          parseFloat(
            a.price.substring(1).replaceAll(",", "").replaceAll(" ", "")
          )
        );
      });
      if (!sellToken) {
        const f = s.find((item) => item.name === currentMarket.split("-")[1]);
        setSellToken(f);
      }

      return s;
    } else {
      return [];
    }
  }, [sellTokenList, balances]);

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
        const price = balances[item]?.valueReadable
          ? `$ ${formatUSD(
              coinEstimator(item) * balances[item]?.valueReadable
            )}`
          : "";

        return {
          id: index,
          name: item,
          balance: balances[item]?.valueReadable
            ? formatToken(balances[item]?.valueReadable, item)
            : "0.0000000",
          price: price !== "" ? `${price}` : "$ 0.00",
        };
      });
    if (buyToken) {
      const d = filtered.find((item) => item.name === buyToken.name);
      if (d === undefined) {
        setBuyToken(filtered[0]);
      } else {
        setBuyToken(d);
      }
    } else {
      const b = filtered.find(
        (item) => item.name === currentMarket.split("-")[0]
      );
      setBuyToken(b);
    }
    filtered = filtered.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.name === value.name)
    );
    const s = filtered.sort((a, b) => {
      console.log(
        b.price.substring(1).replaceAll(",", "").replaceAll(" ", ""),
        b.price
      );
      return (
        parseFloat(
          b.price.substring(1).replaceAll(",", "").replaceAll(" ", "")
        ) -
        parseFloat(a.price.substring(1).replaceAll(",", "").replaceAll(" ", ""))
      );
    });
    return s;
  }, [sellToken, pairs, balances]);

  const onChangeSellToken = (option) => {
    setSellAmounts("");
    setBuyAmounts("");
    setChangedBuyAmount(false);
    setChangedSellAmount(false);
    setSellToken(option);
  };

  const onChangeBuyToken = (option) => {
    setSellAmounts("");
    setBuyAmounts("");
    setChangedBuyAmount(false);
    setChangedSellAmount(false);
    setBuyToken(option);
  };

  const onSwitchTokenBtn = () => {
    const p = fromTokenOptions.find((item) => item.name === buyToken.name);
    setSellToken(p);
    setBuyToken(sellToken);
    setTtype(!tType);
    const newSellAmount =
      tType === "sell"
        ? sellAmounts * currentPrice
        : sellAmounts / currentPrice;
    setSellAmounts(isNaN(newSellAmount) ? "" : newSellAmount);
    setBuyAmounts(isNaN(sellAmounts) ? "" : sellAmounts);
    setChangedBuyAmount(false);
    setChangedSellAmount(false);
  };

  const onChangeSellAmounts = (event) => {
    const amount = event.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
    setSellAmounts(amount);
    const newBuyAmount =
      tType === "buy" ? amount / currentPrice : amount * currentPrice;
    setBuyAmounts(newBuyAmount);
    setChangedBuyAmount(false);
    setChangedSellAmount(true);
  };

  const onChangeBuyAmounts = (event) => {
    const amount = event.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
    setBuyAmounts(amount);
    const newSellAmount =
      tType === "buy" ? amount * currentPrice : amount / currentPrice;
    setSellAmounts(newSellAmount);
    setChangedBuyAmount(true);
    setChangedSellAmount(false);
  };

  const isValid = () => {
    const userOrderArray = Object.values(userOrders);
    if (userOrderArray.length > 0) {
      const openOrders = userOrderArray.filter((o) =>
        ["o", "b", "m"].includes(o[9])
      );
      if (api.isZksyncChain() && openOrders.length > 0) {
        setError("Only one open order allowed");
        return;
      }
    }

    // no error in this case needed
    if (!sellAmounts) {
      return;
    }
    if (!buyAmounts) {
      setError("Missing buy amount");
      return;
    }

    if (!marketInfo) {
      setError("Issue validatin your order");
      console.error(`Convert: no marketinfo for ${currentMarket}`);
      return;
    }

    const [baseToken, quoteToken] = currentMarket.split("-");
    if (baseToken !== buyToken?.name && quoteToken !== buyToken?.name) {
      setError("Buy token not in current market.");
      return;
    }
    if (baseToken !== sellToken?.name && quoteToken !== sellToken?.name) {
      setError("Sell token not in current market.");
      return;
    }

    const sellAmountParsed =
      typeof sellAmounts === "string"
        ? parseFloat(sellAmounts.replace(",", "."))
        : sellAmounts;
    const buyAmountParsed =
      typeof buyAmounts === "string"
        ? parseFloat(buyAmounts.replace(",", "."))
        : buyAmounts;
    let baseAmount =
      baseToken === buyToken?.name ? buyAmountParsed : sellAmountParsed;
    let quoteAmount =
      quoteToken === sellToken?.name ? sellAmountParsed : buyAmountParsed;

    if (!baseAmount || !quoteAmount) {
      setError("No amount available");
      return;
    }

    const price = quoteAmount / baseAmount;
    const targetPrice = currentPrice;
    if (!targetPrice || !price) {
      setError("No price available");
      return;
    }

    if (price < 0) {
      setError(`Price (${price}) can't be below 0`);
      return;
    }

    if (tType === "sell") {
      console.log(marketInfo);
      const baseBalance = getBaseBalance();
      const fee = getBaseFee(baseAmount);
      if (!baseBalance || baseAmount + fee > baseBalance) {
        setError(`Amount exceeds ${marketInfo?.baseAsset.symbol} balance`);
        return;
      }

      if (baseAmount < fee) {
        setError(`Minimum order size is ${fee.toPrecision(5)}`);
        return;
      }

      if (api.isEVMChain()) {
        const allowance = getBaseAllowance();
        if (baseAmount + fee < allowance) {
          setApproveNeeded(true);
          setError(`Amount exceeds ${marketInfo?.baseAsset.symbol} allowance`);
          return;
        } else {
          setApproveNeeded(false);
        }
      }
    } else {
      const quoteBalance = getQuoteBalance();
      const fee = getQuoteFee(quoteAmount);
      if (!quoteBalance || quoteAmount + fee > quoteBalance) {
        setError(`Amount exceeds ${marketInfo?.quoteAsset.symbol} balance`);
        return;
      }

      if (quoteAmount < fee) {
        setError(`Minimum order size is ${fee.toPrecision(5)}`);
        return;
      }

      if (api.isEVMChain()) {
        const allowance = getQuoteAllowance();
        if (quoteAmount + fee < allowance) {
          setApproveNeeded(true);
          setError(`Amount exceeds ${marketInfo?.quoteAsset.symbol} allowance`);
          return;
        } else {
          setApproveNeeded(false);
        }
      }
    }
    setError("");
  };

  const onClickExchange = async (e) => {
    e.preventDefault();
    if (errorMsg) return;

    const sellAmountParsed =
      typeof sellAmounts === "string"
        ? parseFloat(sellAmounts.replace(",", "."))
        : sellAmounts;
    const buyAmountParsed =
      typeof buyAmounts === "string"
        ? parseFloat(buyAmounts.replace(",", "."))
        : buyAmounts;
    const [baseToken, quoteToken] = currentMarket.split("-");
    let baseAmount =
      baseToken === buyToken?.name ? buyAmountParsed : sellAmountParsed;
    let quoteAmount =
      quoteToken === sellToken?.name ? sellAmountParsed : buyAmountParsed;

    const price = quoteAmount / baseAmount;

    const renderGuidContent = () => {
      return (
        <div>
          <p style={{ fontSize: "14px", lineHeight: "24px" }}>
            {tType === "sell" ? "Sell" : "Buy"} Order pending
          </p>
          <p style={{ fontSize: "14px", lineHeight: "24px" }}>
            {addComma(formatPrice(baseAmount))} {marketInfo?.baseAsset.symbol} @{" "}
            {addComma(formatPrice(price))} {marketInfo?.quoteAsset.symbol}
          </p>
          <p style={{ fontSize: "14px", lineHeight: "24px" }}>
            Transaction fee:{" "}
            {tType === "sell"
              ? `${addComma(formatPrice(getBaseFee(baseAmount)))} ${
                  marketInfo?.baseAsset.symbol
                }`
              : `${addComma(formatPrice(getQuoteFee(quoteAmount)))} ${
                  marketInfo?.quoteAsset.symbol
                }`}
          </p>
          <p style={{ fontSize: "14px", lineHeight: "24px" }}>
            Sign or Cancel to continue...
          </p>
        </div>
      );
    };

    let orderPendingToast;
    if (!settings.disableOrderNotification) {
      orderPendingToast = toast.info(renderGuidContent(), {
        toastId: "Order pending",
        autoClose: false,
      });
    }

    try {
      await api.submitOrder(
        currentMarket,
        tType === "buy" ? "b" : "s",
        baseAmount,
        quoteAmount,
        "market"
      );
      setTimeout(() => {
        setOrderButtonDisabled(false);
      }, 8000);
    } catch (e) {
      console.log(e);
      toast.error(`Error submitting the order: ${e.message}`, {
        autoClose: 20000,
        toastId: "submitOrder",
      });
      setOrderButtonDisabled(false);
    }

    if (!settings.disableOrderNotification) {
      toast.dismiss(orderPendingToast);
    }
  };

  const approveHandler = async (e) => {
    e.preventDefault();
    if (!marketInfo) return;

    const token =
      tType === "sell"
        ? marketInfo.baseAsset.symbol
        : marketInfo.quoteAsset.symbol;

    let orderApproveToast = toast.info(
      "Approve pending. Sign or Cancel to continue...",
      {
        toastId: "Approve pending. Sign or Cancel to continue...",
        autoClose: false,
      }
    );

    try {
      await api.approveExchangeContract(
        token,
        0 // amount = 0 ==> MAX_ALLOWANCE
      );
    } catch (e) {
      console.log(e);
      toast.error(e.message);
    }

    toast.dismiss(orderApproveToast);
  };

  const onClickMax = () => {
    const balance = balances[sellToken?.name]?.valueReadable;
    const fees = tType === "sell" ? getBaseFee() : getQuoteFee();
    if (balance && fees) {
      const s_amounts = balance - fees;
      if (s_amounts < 0) {
        setSellAmounts("");
        setBuyAmounts("");
      } else {
        setSellAmounts(s_amounts);
        const newBuyAmount =
          tType === "sell"
            ? s_amounts * currentPrice
            : s_amounts / currentPrice;
        setBuyAmounts(newBuyAmount);
      }
    }
    setChangedBuyAmount(false);
    setChangedSellAmount(false);
  };

  const onChangeSlippageValue = (value) => {
    let amount = value.replace(",", ".").replace(/[^0-9.]/g, ""); //^[1-9][0-9]?$|^100$
    if (parseFloat(amount) < 0 || parseFloat(amount) > 25) {
      dispatch(setSlippageValue({ value: "1.00" }));
    } else {
      dispatch(setSlippageValue({ value: amount }));
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
          <div className="w-full max-w-lg px-1 sm:px-0">
            <p
              className={
                isMobile
                  ? "text-3xl font-semibold font-work "
                  : "mt-10 text-3xl font-semibold font-work "
              }
            >
              ZigZag Convert
            </p>
            <ConvertContianer
              transactionType={tType}
              balances={balances}
              fromToken={sellToken}
              fromTokenOptions={fromTokenOptions}
              onChangeFromToken={onChangeSellToken}
              onChangeFromAmounts={onChangeSellAmounts}
              fromAmounts={sellAmounts}
              estimatedValueFrom={estimatedValueSell}
              estimatedValueTo={estimatedValueBuy}
              onSwitchTokenBtn={onSwitchTokenBtn}
              basePrice={currentPrice}
              toToken={buyToken}
              toTokenOptions={buyTokenOptions}
              onChangeToToken={onChangeBuyToken}
              toAmounts={isNaN(buyAmounts) ? "" : buyAmounts}
              onClickMax={onClickMax}
              onChangeToAmounts={onChangeBuyAmounts}
            />
            <TransactionSettings
              transactionType={tType}
              onSetSlippageValue={onChangeSlippageValue}
              slippageValue={slippageValue}
              transactionFee={transactionFee}
              feeToken={
                marketInfo
                  ? tType === "buy"
                    ? marketInfo.quoteAsset.symbol
                    : marketInfo.baseAsset.symbol
                  : ""
              }
              estimatedValueFee={estimatedValueFee}
            />
            {!errorMsg &&
              user.address &&
              !approveNeeded &&
              Number(sellAmounts) > 0 && (
                <Button
                  isLoading={false}
                  className="w-full py-3 my-3 uppercase"
                  scale="imd"
                  onClick={onClickExchange}
                  disabled={orderButtonDisabled}
                >
                  Convert {sellToken?.name}
                </Button>
              )}
            {errorMsg && user.address && !approveNeeded && (
              <Button
                isLoading={false}
                className="w-full py-3 my-3 uppercase"
                variant="sell"
                scale="imd"
                disabled
              >
                {errorMsg}
              </Button>
            )}
            {user.address && approveNeeded && api.isEVMChain() && (
              <Button
                isLoading={false}
                className="w-full py-3 my-3 uppercase"
                variant="sell"
                scale="imd"
                onClick={approveHandler}
              >
                Approve {sellToken?.name}
              </Button>
            )}
            {!user.address && (
              <ConnectWalletButton className="w-full py-3 my-3 uppercase" />
            )}
          </div>
        </div>
      )}
    </DefaultTemplate>
  );
};

export default ConvertPage;
