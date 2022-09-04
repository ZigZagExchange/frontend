import React from "react";
import api from "lib/api";
import { utils as ethersUtils } from "ethers";
import TokenDropDownModal from "components/organisms/TokenDropdownModal";
import { formatUSD } from "lib/utils";
import { useCoinEstimator } from "components";

const SelectAsset = ({
  onChangeFromAmounts,
  fromNetwork,
  fromAmounts,
  fromToken,
  onChangeFromToken,
  fromTokenOptions,
  estimatedValue,
  L1Fee,
  L2Fee,
  balances,
  swapDetails,
  feeCurrency,
  isOpenable,
  gasFetching,
  swapCurrencyInfo,
  allowance,
}) => {
  const coinEstimator = useCoinEstimator();
  const onClickMax = () => {
    if (gasFetching) return;
    let max = 0;
    try {
      let currencyInfo = {};
      if (swapDetails.currency === "WETH") {
        currencyInfo = api.getCurrencyInfo("ETH");
      } else {
        currencyInfo = api.getCurrencyInfo(swapDetails.currency);
      }
      const roundedDecimalDigits = Math.min(currencyInfo.decimals, 8);
      let actualBalance = balances[swapDetails.currency].valueReadable;
      if (actualBalance !== 0) {
        let receiveAmount = 0;
        if (feeCurrency === "ETH" && swapDetails.currency === "ETH") {
          receiveAmount = actualBalance - L2Fee - L1Fee;
          max = actualBalance - L2Fee;
        } else if (feeCurrency === swapDetails.currency) {
          receiveAmount = actualBalance - L2Fee;
          max = actualBalance - L2Fee;
        } else if (swapDetails.currency === "ETH" && feeCurrency === null) {
          receiveAmount = actualBalance - L1Fee;
          max = actualBalance - L1Fee;
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
        (balances[swapDetails.currency] &&
          balances[swapDetails.currency].valueReadable) ||
          0
      );
    }

    onChangeFromAmounts(String(max));
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

  return (
    <div className="p-2 mt-3 border rounded-lg sm:p-4 dark:border-foreground-400 border-primary-500 ">
      <div className="flex items-center justify-between w-full">
        <p className="text-sm font-semibold tracking-wide font-work">
          Select an Asset
        </p>
        {swapDetails.currency !== "ETH" &&
        fromNetwork.id !== "polygon" &&
        (swapCurrencyInfo?.decimals
          ? swapDetails.amount * 10 ** swapCurrencyInfo?.decimals
          : "") > allowance ? (
          <p className="text-xs font-work">
            Available allowance:{" "}
            {ethersUtils.formatUnits(allowance, swapCurrencyInfo?.decimals)}
            {` ${swapDetails.currency}`}
          </p>
        ) : null}
        <p className="text-xs font-work">
          Available Balance:{" "}
          {balances[swapDetails.currency]
            ? filterSmallBalances(
                balances[swapDetails.currency].valueReadable,
                swapDetails.currency
              )
            : "0.00"}
          {` ${swapDetails.currency}`}
        </p>
      </div>
      <div className="flex items-center justify-between px-3 py-2 mt-2 rounded-lg dark:bg-foreground-200 bg-primary-300 hover:ring-1 hover:ring-offset-0 hover:dark:ring-foreground-500 hover:ring-primary-600">
        {isOpenable && fromTokenOptions.length > 0 && (
          <TokenDropDownModal
            tickers={fromTokenOptions}
            onSelectedOption={onChangeFromToken}
            selectedOption={fromToken}
          />
        )}
        {!isOpenable && (
          <div className="flex items-center">
            {
              <img
                src={api.getCurrencyLogo("ETH")}
                alt={"WETH"}
                style={{ width: 25, height: 25 }}
              />
            }
            <p className="ml-3 text-lg">{swapDetails.currency}</p>
          </div>
        )}
        <button
          className="bg-[#07071C] px-2 py-1 rounded-md text-sm font-semibold text-primary-900 ml-2.5 hover:bg-slate-800 font-work"
          onClick={onClickMax}
        >
          Max
        </button>
        <input
          className="ml-3 text-2xl font-semibold text-right bg-transparent w-36 md:w-64 focus:outline-none"
          placeholder="0.00"
          onChange={(e) => onChangeFromAmounts(e.target.value)}
          value={fromAmounts === 0 ? "" : fromAmounts}
        />
      </div>
      <p className="mt-1 text-sm font-normal text-right text-slate-400 font-work">
        Estimated value: ~ ${formatUSD(estimatedValue)}
      </p>
    </div>
  );
};

export default React.memo(SelectAsset);
