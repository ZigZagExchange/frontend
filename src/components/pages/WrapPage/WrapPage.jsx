import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useTheme from "components/hooks/useTheme";
import api from "lib/api";
import { DefaultTemplate } from "components";
import { ExternalLinkIcon, InfoIcon } from "components/atoms/Svg";
import NetworkSelection from "components/organisms/NetworkSelection";
import WrapContianer from "./WrapContainer";

import classNames from "classnames";
import TransactionSettings from "./TransationSettings";
import { Button } from "components/molecules/Button";

import { useCoinEstimator } from "components";
import { userSelector } from "lib/store/features/auth/authSlice";
import {
  networkSelector,
  balancesSelector,
  settingsSelector,
} from "lib/store/features/api/apiSlice";

export default function WrapPage() {
  const coinEstimator = useCoinEstimator();

  const { isDark } = useTheme();

  const user = useSelector(userSelector);
  const settings = useSelector(settingsSelector);
  const balanceData = useSelector(balancesSelector);
  const network = useSelector(networkSelector);

  const [tType, setTtype] = useState("wrap");
  const [amount, setAmount] = useState();
  const [balances, setBalances] = useState([]);
  const [sellToken, setSellToken] = useState('ETH');
  const [buyToken, setBuyToken] = useState('WETH');
  const [fee, setFee] = useState({
    'wrap': 0.0005,
    'unwrap': 0.0005
  });
  const [orderButtonDisabled, setOrderButtonDisabled] = useState(false);

  const estimatedValueSell = amount * coinEstimator(sellToken) || 0;
  const estimatedValueBuy = amount * coinEstimator(buyToken) || 0;

  const zkBalances = useMemo(
    () => (balanceData[network] ? balanceData[network] : {}),
    [balanceData, network]
  );

  const updateFee = async () => {
    const fees = await api.getWrapFees();
    setFee(fees);
  }

  useEffect(async () => {
    await new Promise(r => setTimeout(r, 2500)); // wait for provider to be ready
    updateFee(); // update now
    setInterval(updateFee, 30000); // keep fees updated
  }, [])

  useEffect(async () => {
    if (!user.address) return;
    setBalances(zkBalances);
  }, [user.address, zkBalances]);

  useEffect(() => {
    if (sellToken && buyToken) {
      if (sellToken === 'ETH' && buyToken === 'WETH') {
        setTtype("wrap");
      } else if (sellToken === 'WETH' && buyToken === 'ETH') {
        setTtype("unwrap");
      }
    }
  }, [sellToken, buyToken]);

  const onSwitchTokenBtn = () => {
    setSellToken(buyToken);
    setBuyToken(sellToken);
  };

  const onChangeAmounts = (event) => {
    const amount = event.target.value.replace(/[^0-9.]/g, "");
    setAmount(amount);
  };

  const onClickExchange = async () => {
    let wrapAmount;
    if (typeof amount === "string") {
      wrapAmount = parseFloat(amount.replace(",", "."));
    } else {
      wrapAmount = amount;
    }
    wrapAmount = isNaN(wrapAmount) ? 0 : wrapAmount;
    if (!wrapAmount) {
      toast.error("No amount available", {
        toastId: "No amount available",
      });
      return;
    }

    if (wrapAmount < 0) {
      toast.error("Amount can't be negative", {
        toastId: "Amount can't be negative",
      });
      return;
    }

    const userBalance = balances[sellToken]?.valueReadable;
    if (!userBalance || wrapAmount > userBalance) {
      toast.error(`Amount exceeds ${sellToken} balance`, {
        toastId: `Amount exceeds ${sellToken} balance`,
      });
      return;
    }

    if (sellToken==='ETH' && (wrapAmount + fee) > userBalance) {
      toast.error(`Remaining ETH balance too low to pay fees`, {
        toastId: `Remaining ETH balance too low to pay fees`,
      });
      return;
    }

    let orderPendingToast;
    setOrderButtonDisabled(true);
    orderPendingToast = toast.info(
      "Order pending. Sign or Cancel to continue...",
      {
        toastId: "Order pending. Sign or Cancel to continue...",
      }
    );

    try {
      if (tType === "wrap") {
        await api.warpETH(wrapAmount);
      } else if (tType === "unwrap") {
        await api.unWarpETH(wrapAmount);
      } else {
      console.error('Bad tType');
      return;
    }
      setTimeout(() => {
        setOrderButtonDisabled(false);
      }, 20000);
    } catch (e) {
      console.log(e);
      toast.error(e.message);
      setOrderButtonDisabled(false);
    }
    await api.getBalances();
    setAmount(0)
    toast.dismiss(orderPendingToast);
  };

  const onClickMax = () => {
    const balance = balances[sellToken]?.valueReadable;
    let dust = 0;
    let fee = 0;
    // for unwrap we dont have to leave dust or care about fees
    if (tType === 'wrap') {
      dust = 0.005;
      fee = fee[tType] ? fee[tType] : 0.0005;
    }
    
    if (balance) {
      let s_amounts = balance - fee;
      if (s_amounts < 0) {
        toast.warn(
          "Can not set max amount, balance too low to pay gas fees.",
          {
            toastId: "Can not set max amount, balance too low to pay gas fees.",
          }
        );
        setAmount(0);
        return;
      }

      s_amounts = balance - dust
      if (s_amounts < 0) {
        toast.warn(
          "Can not set max amount, you should keep some ETH to pay for other transactions.",
          {
            toastId: "Can not set max amount, you should keep some ETH to pay for other transactions.",
          }
        );
        setAmount(0);
        return;
      }
      setAmount(s_amounts);
    }
  };

  return (
    <DefaultTemplate>
      <div className={classNames("flex justify-center", { dark: isDark })}>
        <div className="w-full max-w-lg px-1 sm:px-0">
          <p className="mt-10 text-3xl font-semibold font-work ">
            ZigZag Wrap Interface
          </p>
          <WrapContianer
            transactionType={tType}
            balances={balances}
            fromToken={sellToken}
            onChangeAmounts={onChangeAmounts}
            amount={amount}
            estimatedValueSell={estimatedValueSell}
            estimatedValueBuy={estimatedValueBuy}
            onSwitchTokenBtn={onSwitchTokenBtn}
            toToken={buyToken}
            onClickMax={onClickMax}
          />
          <TransactionSettings
            transactionType={tType}
            fee={fee}
          />
          <Button
            isLoading={false}
            className="w-full py-3 my-3 uppercase"
            scale="imd"
            onClick={onClickExchange}
            disabled={orderButtonDisabled || !user.address}
          >
            {tType === 'wrap' ? 'WRAP ETH' : 'UNWRAP WETH'}
          </Button>
        </div>
      </div>
    </DefaultTemplate>
  );
}
