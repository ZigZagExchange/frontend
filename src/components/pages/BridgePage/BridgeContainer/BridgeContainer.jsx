import React, { useState, useMemo, useEffect } from "react";
import { constants as ethersConstants, utils as ethersUtils } from "ethers";
import classNames from "classnames";
import { useCoinEstimator } from "components";
import { LoadingSpinner } from "components/atoms/LoadingSpinner";
import { toast } from "react-toastify";
import isEmpty from "lodash/isEmpty";
import { useSelector } from "react-redux";
import api from "lib/api";
import { userSelector } from "lib/store/features/auth/authSlice";
import {
  networkSelector,
  balancesSelector,
  userOrdersSelector,
  settingsSelector,
} from "lib/store/features/api/apiSlice";
import { MAX_ALLOWANCE } from "lib/api/constants";
import { formatUSD } from "lib/utils";
import SwitchNetwork from "./SwitchNetwork";
import SelectAsset from "./SelectAsset";
import TransactionSettings from "./TransactionSettings";
import SlippageWarningModal from "./SlippageWarningModal";
import { Button, ConnectWalletButton } from "components/molecules/Button";

import {
  NETWORKS,
  ZKSYNC_ETHEREUM_FAST_BRIDGE,
  ZKSYNC_POLYGON_BRIDGE,
} from "./constants";

const defaultTransfer = {
  type: "deposit",
};

const BridgeContainer = () => {
  const [fromNetwork, setFromNetwork] = useState(NETWORKS[0].from);
  const [toNetwork, setToNetwork] = useState(NETWORKS[0].to[0]);
  const [sellTokenList, setSellTokenList] = useState([]);
  const [sellToken, setSellToken] = useState();
  const [loading, setLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [fromAmounts, setFromAmounts] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [slippage, setSlippage] = useState();

  const user = useSelector(userSelector);
  const balanceData = useSelector(balancesSelector);
  const settings = useSelector(settingsSelector);
  const [isApproving, setApproving] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [L2FeeAmount, setL2FeeAmount] = useState(null);
  const [L2FeeToken, setL2FeeToken] = useState(null);
  const [L1FeeAmount, setL1Fee] = useState(null);
  const [ZigZagFeeToken, setZigZagFeeToken] = useState(null);
  const [ZigZagFeeAmount, setZigZagFee] = useState(null);
  const network = useSelector(networkSelector);
  const [transfer, setTransfer] = useState(defaultTransfer);
  const [swapCurrencyInfo, setSwapCurrencyInfo] = useState({ decimals: 0 });
  const [allowance, setAllowance] = useState(ethersConstants.Zero);
  const [hasAllowance, setHasAllowance] = useState(false);

  const [balances, setBalances] = useState([]);
  const [altBalances, setAltBalances] = useState([]);
  const [polygonLoding, setPolygonLoading] = useState(false);
  const [swapDetails, _setSwapDetails] = useState(() => ({
    amount: "",
    currency: "ETH",
  }));
  const [hasError, setHasError] = useState(false);
  const [activationFee, setActivationFee] = useState(0);
  const [usdFee, setUsdFee] = useState(0);
  const [switchClicking, setSwitchClicking] = useState(false);
  const [gasFetching, setGasFetching] = useState(false);

  const coinEstimator = useCoinEstimator();
  const currencyValue = coinEstimator(swapDetails.currency);
  const userOrders = useSelector(userOrdersSelector);

  const estimatedValue =
    +swapDetails.amount * coinEstimator(swapDetails.currency) || 0;
  const [fastWithdrawCurrencyMaxes, setFastWithdrawCurrencyMaxes] = useState(
    {}
  );

  const walletBalances = useMemo(
    () => (balanceData.wallet ? balanceData.wallet : {}),
    [balanceData.wallet]
  );
  const zkBalances = useMemo(
    () => (balanceData[network] ? balanceData[network] : {}),
    [balanceData, network]
  );
  const polygonBalances = useMemo(
    () => (balanceData.polygon ? balanceData.polygon : {}),
    [balanceData.polygon]
  );

  const _getBalances = (_network) => {
    let balances = [];
    if (_network === "polygon") {
      balances = polygonBalances;
    } else if (_network === "ethereum") {
      balances = walletBalances;
    } else if (_network === "zksync") {
      balances = zkBalances;
    } else {
      setFormErr("Bad Network");
    }
    return balances;
  };

  useEffect(() => {
    setSellTokenList(api.getCurrencies());
  }, []);

  useEffect(() => {
    setTokenLoading(true);
    const timer = setInterval(() => {
      setSellTokenList(api.getCurrencies());
    }, 500);
    if (sellTokenList.length > 0) {
      clearInterval(timer);
      setTokenLoading(false);
    }
    return () => {
      clearInterval(timer);
      setTokenLoading(false);
    };
  }, [sellTokenList]);

  useEffect(async () => {
    if (!user.address) return;
    setSellTokenList(api.getCurrencies());
    setBalances(_getBalances(fromNetwork.id));
    setAltBalances(_getBalances(toNetwork.id));
  }, [
    network,
    toNetwork,
    user.address,
    walletBalances,
    zkBalances,
    polygonBalances,
  ]);

  const [withdrawSpeed, setWithdrawSpeed] = useState("fast");
  const isFastWithdraw = () => {
    return (
      withdrawSpeed === "fast" &&
      transfer.type === "withdraw" &&
      api.apiProvider.eligibleFastWithdrawTokens.includes(swapDetails.currency)
    );
  };

  useEffect(() => {
    setHasError(formErr && formErr.length > 0);
  }, [formErr]);

  const isSwapAmountEmpty = swapDetails.amount === "";

  useEffect(() => {
    setHasAllowance(
      balances[swapDetails.currency] &&
        balances[swapDetails.currency].allowance.gte(MAX_ALLOWANCE.div(3))
    );
  }, [toNetwork, swapDetails, fromAmounts]);

  useEffect(() => {
    if (fromNetwork.id === "zksync") {
      const type = (transfer.type = "withdraw");
      setTransfer({ type });
    } else {
      api.getWalletBalances();
      const type = (transfer.type = "deposit");
      setTransfer({ type });
    }

    if (fromNetwork.id === "polygon") {
      api.getPolygonWethBalance();
      setSwapDetails({ amount: "", currency: "WETH" });
      setSellToken({ id: 0, name: "WETH" });
      setFromAmounts();
    } else if (fromNetwork.id === "ethereum") {
      api.getWalletBalances();
      const currency = switchClicking ? swapDetails.currency : "ETH";
      setSwapDetails({ amount: "", currency });
      setSellToken({ id: 0, name: currency });
      setFromAmounts();
    } else if (fromNetwork.id === "zksync" && toNetwork.id === "ethereum") {
      const currency = switchClicking ? swapDetails.currency : "ETH";
      setSwapDetails({ amount: "", currency });
      setSellToken({ id: 0, name: currency });
      setFromAmounts();
    } else if (fromNetwork.id === "zksync" && toNetwork.id === "polygon") {
      setSwapDetails({ amount: "", currency: "ETH" });
      setSellToken({ id: 0, name: "ETH" });
      setFromAmounts();
    }
    setSwitchClicking(false);
  }, [toNetwork, fromNetwork]);

  useEffect(() => {
    let _swapCurrencyInfo = {};
    if (swapDetails.currency === "WETH") {
      _swapCurrencyInfo = api.getCurrencyInfo("ETH");
    } else {
      _swapCurrencyInfo = api.getCurrencyInfo(swapDetails.currency);
    }

    setSwapCurrencyInfo(_swapCurrencyInfo);

    if (swapDetails.currency === "ETH") {
      setAllowance(MAX_ALLOWANCE);
      setHasAllowance(true);
      return;
    }
    if (isEmpty(balances) || !swapDetails.currency) {
      return;
    }

    const swapAmountBN = ethersUtils.parseUnits(
      isSwapAmountEmpty ? "0.0" : swapDetails.amount,
      _swapCurrencyInfo?.decimals
    );
    const allowanceBN =
      balances[swapDetails.currency]?.allowance ?? ethersConstants.Zero;
    setAllowance(allowanceBN);
    setHasAllowance(allowanceBN.gte(swapAmountBN));
  }, [balances, swapDetails, isSwapAmountEmpty, fromAmounts]);

  useEffect(() => {
    if (user.address) {
      api.getL2FastWithdrawLiquidity().then((maxes) => {
        setFastWithdrawCurrencyMaxes(maxes);
      });
      calculateFees();
    }
  }, [user.address]);

  useEffect(async () => {
    if (
      fromNetwork.id === "zksync" &&
      toNetwork.id === "ethereum" &&
      api.apiProvider.eligibleFastWithdrawTokens?.includes(swapDetails.currency)
    ) {
      setWithdrawSpeed("fast");
    } else {
      setWithdrawSpeed("normal");
    }

    // update changePubKeyFee fee if needed
    if (user.address && api.apiProvider?.zksyncCompatible) {
      const usdFee = await api.apiProvider.changePubKeyFee();
      setUsdFee(usdFee);
      if (currencyValue) {
        setActivationFee((usdFee / currencyValue).toFixed(5));
      } else {
        setActivationFee(0);
      }
    }
  }, [fromNetwork, toNetwork, swapDetails.currency, user.address]);

  useEffect(() => {
    calculateFees();
  }, [withdrawSpeed, swapDetails.amount, swapDetails.currency, fromAmounts]);

  const getMax = (swapCurrency, feeCurrency) => {
    let max = 0;
    try {
      const roundedDecimalDigits = Math.min(swapCurrencyInfo.decimals, 8);
      let actualBalance =
        balances[swapCurrency].value / 10 ** swapCurrencyInfo.decimals;
      if (actualBalance !== 0) {
        let receiveAmount = 0;
        if (feeCurrency === "ETH" && swapCurrency === "ETH") {
          receiveAmount = actualBalance - L2FeeAmount - L1FeeAmount;
          max = actualBalance - L2FeeAmount;
        } else if (feeCurrency === swapCurrency) {
          receiveAmount = actualBalance - L2FeeAmount;
          max = actualBalance - L2FeeAmount;
        } else if (swapCurrency === "ETH" && feeCurrency === null) {
          receiveAmount = actualBalance - L1FeeAmount;
          max = actualBalance - L1FeeAmount;
        } else {
          max = actualBalance;
        }
        // one number to protect against overflow
        if (receiveAmount < 0) max = 0;
        else {
          max =
            Math.round(max * 10 ** roundedDecimalDigits - 1) /
            10 ** roundedDecimalDigits;
        }
      }
    } catch (e) {
      max = parseFloat(
        (balances[swapCurrency] && balances[swapCurrency].valueReadable) || 0
      );
    }
    return max;
  };

  useEffect(() => {
    const inputValue = parseFloat(swapDetails.amount) || 0;
    const swapCurrency = swapDetails.currency;
    if (balances.length === 0) return false;
    const getCurrencyBalance = (cur) =>
      balances[cur] && balances[cur].valueReadable
        ? balances[cur].valueReadable
        : 0;
    const userBalance = getCurrencyBalance(swapCurrency);
    const max = getMax(swapCurrency, L2FeeToken);
    const bridgeAmount = inputValue - ZigZagFeeAmount;

    if (!api.getCurrencyInfo(swapDetails.currency)) {
      setFormErr("Loading token details...");
      return;
    }

    let error = null;
    if (inputValue > 0) {
      if (bridgeAmount <= 0) {
        error = "Insufficient amount for fees";
      } else if (!user.id && bridgeAmount <= activationFee) {
        error = `Must be more than ${activationFee} ${swapCurrency}`;
      } else if (inputValue >= userBalance) {
        error = "Insufficient balance";
      } else if (bridgeAmount > max) {
        error = "Insufficient balance for fees";
      } else if (isFastWithdraw()) {
        if (swapCurrency in fastWithdrawCurrencyMaxes) {
          const maxAmount = fastWithdrawCurrencyMaxes[swapCurrency];
          if (bridgeAmount > maxAmount) {
            error = `Max ${swapCurrency} liquidity for fast withdraw: ${maxAmount.toPrecision(
              4
            )}`;
          }
        }
      }
      // 0.0005 -> poly bridge min size
      else if (
        bridgeAmount < 0.0005 &&
        (toNetwork.id === "polygon" || fromNetwork.id === "polygon")
      ) {
        error = "Amount too small";
      }

      const userOrderArray = Object.values(userOrders);
      if (userOrderArray.length > 0) {
        const openOrders = userOrderArray.filter((o) =>
          ["o", "b", "m"].includes(o[9])
        );
        if (
          [1, 1002].includes(network) &&
          fromNetwork.id === "zksync" &&
          openOrders.length > 0
        ) {
          error = "Open limit order prevents you from bridging";
          if (!settings.disableOrderNotification) {
            toast.error(
              "zkSync 1.0 allows one open order at a time. Please cancel your limit order or wait for it to be filled before bridging. Otherwise your limit order will fail.",
              {
                toastId:
                  "zkSync 1.0 allows one open order at a time. Please cancel your limit order or wait for it to be filled before bridging. Otherwise your limit order will fail.",
                autoClose: 20000,
              }
            );
          }
        }
      }
    }

    if (error) {
      setFormErr(error);
      return;
    }

    const feeCurrencyInfo = api.getCurrencyInfo(L2FeeToken);
    if (feeCurrencyInfo && feeCurrencyInfo.decimals) {
      if (balances.length === 0) return false;
      const feeTokenBalance = parseFloat(
        balances[L2FeeToken] &&
          balances[L2FeeToken].value / 10 ** feeCurrencyInfo.decimals
      );

      if (inputValue > 0 && L2FeeAmount > feeTokenBalance) {
        error = "Not enough balance to pay for fees";
      }
    }

    if (error) {
      setFormErr(error);
    } else {
      setFormErr("");
    }
  }, [
    swapDetails,
    ZigZagFeeAmount,
    userOrders,
    activationFee,
    L1FeeAmount,
    L2FeeAmount,
    L2FeeToken,
    api.marketInfo,
    balances[swapDetails.currency],
  ]);

  const setSwapDetails = async (values) => {
    const details = {
      ...swapDetails,
      ...values,
    };

    _setSwapDetails(details);
  };

  const calculateFees = async () => {
    setGasFetching(true);

    // polygon -> zkSync
    if (fromNetwork.id === "polygon" && toNetwork.id === "zksync") {
      const gasFee = await api.getPolygonFee();
      if (gasFee) {
        setL1Fee((35000 * gasFee.fast.maxFee) / 10 ** 9);
        setL2FeeAmount(null);
        setL2FeeToken(null);
        setZigZagFeeToken("ETH");
        setZigZagFee(0.003);
      }
    }
    // zkSync -> polygon
    else if (fromNetwork.id === "zksync" && toNetwork.id === "polygon") {
      let res = await api.transferL2GasFee(swapDetails.currency);
      setL1Fee(null);
      setL2FeeAmount(res.amount); // ZigZag fee
      setL2FeeToken(res.feeToken);
      setZigZagFeeToken(res.feeToken);
      setZigZagFee(0.003);
    }
    // Ethereum -> zkSync aka deposit
    else if (transfer.type === "deposit") {
      const gasFee = await api.getEthereumFee(swapDetails.currency);
      if (gasFee) {
        let maxFee = gasFee.maxFeePerGas / 10 ** 9;
        // For deposit, ethereum gaslimit is 90k, median is 63k
        setL1Fee((70000 * maxFee) / 10 ** 9);
        setL2FeeAmount(null);
        setL2FeeToken(null);
        setZigZagFeeToken(null);
        setZigZagFee(null);
      }
    }
    // zkSync -> Ethereum aka withdraw
    else if (transfer.type === "withdraw") {
      if (api.apiProvider.syncWallet) {
        if (isFastWithdraw()) {
          const [L1res, L2res] = await Promise.all([
            api.withdrawL2FastBridgeFee(swapDetails.currency),
            api.transferL2GasFee(swapDetails.currency),
          ]);
          setL1Fee(L1res);
          setL2FeeAmount(L2res.amount);
          setL2FeeToken(L2res.feeToken);
          setZigZagFeeToken("ETH");
          setZigZagFee(L1res * 3);
        } else {
          let res = await api.withdrawL2GasFee(swapDetails.currency);
          setL1Fee(null);
          setL2FeeAmount(res.amount);
          setL2FeeToken(res.feeToken);
          setZigZagFeeToken(null);
          setZigZagFee(null);
        }
      }
      // bad case, cant calculate fee
    } else {
      console.log(
        `Bad op ==> from: ${fromNetwork.id}, to: ${toNetwork.id}, type: ${transfer.type}`
      );
      setL2FeeToken(null);
      setL2FeeAmount(null);
      setL2FeeToken(null);
      setZigZagFeeToken(null);
      setZigZagFee(null);
    }

    setGasFetching(false);
  };

  const approveSpend = (e) => {
    if (e) e.preventDefault();
    setApproving(true);
    api
      .approveSpendOfCurrency(swapDetails.currency)
      .then(() => {
        setApproving(false);
      })
      .catch((err) => {
        console.log(err);
        if (!settings.disableOrderNotification) {
          toast.error(err.message);
        }
        setApproving(false);
      });
  };

  const renderGuidContent = () => {
    return (
      <div>
        <p style={{ fontSize: "14px", lineHeight: "24px" }}>
          1. Connect to Ethereum network
        </p>
        <p style={{ fontSize: "14px", lineHeight: "24px" }}>
          2. Click "transfer" on Polygon -&gt; zkSync
        </p>
        <p style={{ fontSize: "14px", lineHeight: "24px" }}>
          3. Click "Switch network" to Polygon and wait
        </p>
        <p style={{ fontSize: "14px", lineHeight: "24px" }}>
          4. Click "Confirm" on transfer pop up and wait
        </p>
        <p style={{ fontSize: "14px", lineHeight: "24px" }}>
          5. Click "Switch network" to Ethereum
        </p>
        <p style={{ fontSize: "14px", lineHeight: "24px" }}>
          &nbsp;&nbsp;&nbsp;&nbsp;
          {`Activating a new zkSync wallet costs ~${usdFee}. Enjoy trading on ZigZag!`}
        </p>
      </div>
    );
  };

  const doTransfer = (e) => {
    e.preventDefault();
    let deferredXfer;
    setLoading(true);

    if (fromNetwork.id === "polygon" && toNetwork.id === "zksync") {
      setPolygonLoading(true);
      deferredXfer = api.transferPolygonWeth(
        `${swapDetails.amount}`,
        user.address
      );
      if (!settings.disableOrderNotification) {
        toast.info(renderGuidContent(), {
          closeOnClick: false,
          autoClose: 15000,
        });
      }
    } else if (fromNetwork.id === "zksync" && toNetwork.id === "polygon") {
      deferredXfer = api.transferToBridge(
        `${swapDetails.amount}`,
        swapDetails.currency,
        ZKSYNC_POLYGON_BRIDGE.address,
        user.address
      );
    } else if (fromNetwork.id === "ethereum" && toNetwork.id === "zksync") {
      deferredXfer = api.depositL2(
        `${swapDetails.amount}`,
        swapDetails.currency,
        user.address
      );
    } else if (fromNetwork.id === "zksync" && toNetwork.id === "ethereum") {
      if (isFastWithdraw()) {
        let fee = ZigZagFeeAmount;
        if (L2FeeToken === swapDetails.currency) fee += L2FeeAmount;
        if (swapDetails.currency === "ETH") fee += L1FeeAmount;
        if (fee >= swapDetails.amount * 0.1) {
          const p = (fee / swapDetails.amount) * 100;
          setSlippage(p);
          setIsOpen(true);
        } else {
          deferredXfer = api.transferToBridge(
            `${swapDetails.amount}`,
            swapDetails.currency,
            ZKSYNC_ETHEREUM_FAST_BRIDGE.address,
            user.address
          );
        }
      } else {
        deferredXfer = api.withdrawL2(
          `${swapDetails.amount}`,
          swapDetails.currency
        );
      }
    } else {
      setFormErr("Wrong from/to combination");
      return false;
    }

    const renderGuidContent = () => {
      return (
        <div>
          <p className="text-sm">
            Bridge transaction in process. Confirm or Reject to continue...
          </p>
        </div>
      );
    };
    let orderPendingToast;
    if (deferredXfer) {
      if (!settings.disableOrderNotification) {
        orderPendingToast = toast.info(renderGuidContent(), {
          toastId: "Order pending",
          autoClose: true,
        });
      }
      deferredXfer
        .then(() => {
          setTimeout(() => {
            api.getAccountState();
            setFromAmounts(0);
            api.getWalletBalances();
          }, 1000);
        })
        .catch((e) => {
          console.error("error sending transaction::", e);
          if (!settings.disableOrderNotification) {
            toast.error(e.message);
            toast.dismiss(orderPendingToast);
          }
          setTimeout(() => api.getAccountState(), 1000);
        })
        .finally(() => {
          setPolygonLoading(false);
          setLoading(false);
          setSwapDetails({ amount: "" });
          // setFromAmounts(0);
        });
    }
  };

  const onChangeSellToken = (option) => {
    setSellToken(option);
    const sDetails = {};
    sDetails["currency"] = option.name;
    sDetails["amount"] = "";
    setSwapDetails(sDetails);
    setFromAmounts(0);
  };

  const filterSmallBalances = (balance, currency) => {
    const usdPrice = coinEstimator(currency);
    const usd_balance = usdPrice * balance;

    let b = 0;
    if (usd_balance < 0.02) {
      b = "0.00";
    } else {
      b = balance;
    }
    return b;
  };

  const fromTokenOptions = useMemo(() => {
    if (sellTokenList.length > 0) {
      let t = sellTokenList;
      if (balances.length !== 0) {
        const tickersOfBalance = t.filter((x) => {
          return balances[x] && parseFloat(balances[x].valueReadable) > 0;
        });

        const tickersRest = t.filter((x) => {
          return balances[x] && parseFloat(balances[x].valueReadable) === 0;
        });

        tickersOfBalance.sort((a, b) => {
          return (
            parseFloat(coinEstimator(b) * balances[b].valueReadable) -
            parseFloat(coinEstimator(a) * balances[a].valueReadable)
          );
        });

        t = [...tickersOfBalance, ...tickersRest];
      }

      const p = t.map((item, index) => {
        const price = balances[item]?.valueReadable
          ? `$ ${formatUSD(
              coinEstimator(item) * balances[item]?.valueReadable
            )}`
          : "";
        const isFastWithdraw =
          transfer.type === "withdraw" &&
          api.apiProvider.eligibleFastWithdrawTokens.includes(item);
        return {
          id: index,
          name: item,
          balance: filterSmallBalances(
            balances[item]?.valueReadable,
            swapDetails.currency
          ),
          price: `${price}`,
          isFastWithdraw: isFastWithdraw,
        };
      });
      // setSellToken(p.find((item) => item.name === "ETH"));
      return p;
    } else {
      return [];
    }
  }, [sellTokenList, balances]);

  const onSelectFromNetwork = (option) => {
    setFromNetwork(option);
    const f = NETWORKS.find((i) => i.from.id === option.id);
    setToNetwork(f.to[0]);
  };

  const onSelectToNetwork = (option) => {
    setToNetwork(option);
  };

  const getToBalance = () => {
    let balance, unit;
    if (fromNetwork.id === "polygon") {
      balance = altBalances["ETH"] ? altBalances["ETH"].valueReadable : "0.00";
      unit = "ETH";
    } else if (toNetwork.id === "polygon") {
      balance = altBalances["WETH"]
        ? altBalances["WETH"].valueReadable
        : "0.00";
      unit = "WETH";
    } else {
      balance = altBalances[swapDetails.currency]
        ? altBalances[swapDetails.currency].valueReadable
        : "0.00";
      unit = swapDetails.currency;
    }

    return balance + " " + unit;
  };

  const toNetworkOption = useMemo(() => {
    const t = NETWORKS.find((item) => item.from.id === fromNetwork.id);
    return t.to;
  }, [fromNetwork, NETWORKS]);

  const switchTransferType = () => {
    const f = NETWORKS.find((i) => i.from.id === toNetwork.id);
    setToNetwork(fromNetwork);
    setFromNetwork(f.from);
    setSwitchClicking(true);
  };

  const onChangeFromAmounts = (value) => {
    // if (e.target.value.length > 10) return;
    const amount = value.replace(/[^0-9.]/g, "");
    setFromAmounts(amount);
    const sDetails = {};
    sDetails["amount"] = amount;
    setSwapDetails(sDetails);
  };

  const onCloseWarningModal = () => {
    setIsOpen(false);
    setLoading(false);
  };

  const onConfirmModal = () => {
    setIsOpen(false);
    let deferredXfer;
    deferredXfer = api.transferToBridge(
      `${swapDetails.amount}`,
      swapDetails.currency,
      ZKSYNC_ETHEREUM_FAST_BRIDGE.address,
      user.address
    );
    deferredXfer
      .then(() => {
        setTimeout(() => {
          api.getAccountState();
          setFromAmounts(0);
          api.getWalletBalances();
        }, 1000);
      })
      .catch((e) => {
        console.error("error sending transaction::", e);
        if (!settings.disableOrderNotification) {
          toast.error(e.message);
        }
        setTimeout(() => api.getAccountState(), 1000);
      })
      .finally(() => {
        setPolygonLoading(false);
        setLoading(false);
        setSwapDetails({ amount: "" });
        // setFromAmounts(0);
      });
  };

  return (
    <>
      {tokenLoading && (
        <div className={classNames("flex justify-center align-center mt-48")}>
          <LoadingSpinner />
        </div>
      )}
      {!tokenLoading && (
        <div>
          <SlippageWarningModal
            isOpen={isOpen}
            closeModal={onCloseWarningModal}
            confirmModal={onConfirmModal}
            slippage={slippage}
          />
          <SwitchNetwork
            fromNetworkOptions={NETWORKS.map((item) => item.from)}
            onChangeFromNetwork={onSelectFromNetwork}
            fromNetwork={fromNetwork}
            toNetworkOptions={toNetworkOption}
            onChangeToNetwork={onSelectToNetwork}
            toNetwork={toNetwork}
            onClickSwitchNetwork={switchTransferType}
          />
          <SelectAsset
            fromNetwork={fromNetwork}
            fromToken={sellToken}
            fromTokenOptions={fromTokenOptions}
            onChangeFromToken={onChangeSellToken}
            onChangeFromAmounts={onChangeFromAmounts}
            fromAmounts={fromAmounts}
            estimatedValue={estimatedValue}
            L1Fee={L1FeeAmount}
            L2Fee={L2FeeAmount}
            balances={balances}
            swapDetails={swapDetails}
            onChange={setSwapDetails}
            feeCurrency={L2FeeToken}
            isOpenable={
              !(
                fromNetwork.id === "polygon" ||
                (fromNetwork.id === "zksync" && toNetwork.id === "polygon")
              )
            }
            gasFetching={gasFetching}
            swapCurrencyInfo={swapCurrencyInfo}
            allowance={allowance}
          />
          {user.address && (
            <TransactionSettings
              user={user}
              transfer={transfer}
              isSwapAmountEmpty={isSwapAmountEmpty}
              fromNetwork={fromNetwork}
              toNetwork={toNetwork}
              L1Fee={L1FeeAmount}
              L2Fee={L2FeeAmount}
              ZigZagFee={ZigZagFeeAmount}
              swapDetails={swapDetails}
              isFastWithdraw={isFastWithdraw}
              balances={balances}
              usdFee={usdFee}
              withdrawSpeed={withdrawSpeed}
              onChangeSpeed={setWithdrawSpeed}
              activationFee={activationFee}
              L2FeeToken={L2FeeToken}
              ZigZagFeeToken={ZigZagFeeToken}
              hasError={hasError}
              fastWithdrawDisabled={
                !api.apiProvider.eligibleFastWithdrawTokens?.includes(
                  swapDetails.currency
                )
              }
            />
          )}
          {!user.address && (
            <ConnectWalletButton
              isLoading={polygonLoding}
              className="w-full py-3 mt-3 uppercase"
            />
          )}
          {user.address && (
            <>
              {balances[swapDetails.currency] &&
                !hasAllowance &&
                !hasError &&
                fromNetwork.id !== "polygon" && (
                  <Button
                    isLoading={isApproving}
                    scale="md"
                    disabled={
                      formErr.length > 0 ||
                      Number(swapDetails.amount) === 0 ||
                      swapDetails.currency === "ETH"
                    }
                    onClick={approveSpend}
                    className="w-full py-3 mt-3 uppercase"
                  >
                    APPROVE
                  </Button>
                )}
              {hasError && (
                <Button
                  variant="sell"
                  scale="md"
                  className="w-full py-3 mt-3 uppercase"
                >
                  {formErr}
                </Button>
              )}
              {hasAllowance && !hasError && (
                <Button
                  className="w-full py-3 mt-3 uppercase"
                  isLoading={loading}
                  disabled={
                    formErr.length > 0 ||
                    (L2FeeAmount === null && L1FeeAmount === null) ||
                    !hasAllowance ||
                    Number(swapDetails.amount) === 0
                  }
                  onClick={doTransfer}
                >
                  transfer
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default BridgeContainer;
