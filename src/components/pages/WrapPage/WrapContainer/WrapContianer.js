import React from "react";
import api from "lib/api";
import { formatUSD, formatPrice } from "lib/utils";
import {
  SwitchVerticalIcon,
  SwitchHorizontalIcon,
} from "@heroicons/react/solid";

const WrapContianer = ({
  balances,
  fromToken,
  onChangeAmounts,
  amount,
  estimatedValueSell,
  estimatedValueBuy,
  onSwitchTokenBtn,
  toToken,
  onClickMax,
}) => {
  return (
    <div className="p-4 mt-5 border rounded-lg dark:border-foreground-400 border-primary-500">
      <div className="flex items-center justify-between">
        <p className="text-lg font-work">From</p>
        <p className="text-sm font-normal ">
          Available Balance:{" "}
          {balances[fromToken]
            ? Number(balances[fromToken].valueReadable).toPrecision(8)
            : "0.00"}
          {` ${fromToken}`}
        </p>
      </div>
      <div className="flex items-center justify-between px-3 py-2 mt-3 rounded-lg dark:bg-foreground-200 bg-primary-300 hover:ring-1 hover:ring-offset-0 hover:dark:ring-foreground-500 hover:ring-primary-600">
        <img
          src={api.getCurrencyLogo(fromToken)}
          style={{ width: 25, height: 25 }}
        />
        {fromToken && fromToken}
        <button
          className="bg-[#07071C] px-2 py-1 rounded-md text-sm font-semibold text-primary-900 ml-2.5 hover:bg-slate-800 "
          onClick={onClickMax}
        >
          Max
        </button>
        <input
          className="ml-3 text-2xl font-semibold text-right bg-transparent w-36 md:w-64 focus:outline-none"
          placeholder="0.00"
          onChange={onChangeAmounts}
          value={amount}
        />
      </div>
      <p className="mt-1 text-sm font-normal text-right text-slate-400 ">
        Estimated value: ~ ${formatUSD(estimatedValueSell)}
      </p>
      <div className="relative h-px mx-2 my-5 dark:bg-foreground-400 bg-primary-500">
        <button
          className="absolute inset-x-0 w-10 h-10 mx-auto -mt-5 rounded-full shadow-xl bg-gradient-to-r from-primary-900 to-secondary-900 hover:brightness-105"
          onClick={onSwitchTokenBtn}
        >
          <SwitchVerticalIcon className="absolute inset-x-0 mx-auto -mt-3.5 w-7 hover:opacity-80 text-white origin-center hover:rotate-180 transition-all duration-300 ease-in-out" />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-lg font-work">To</p>
        <p className="flex items-center text-sm font-normal ">
          1 {fromToken} = {formatPrice(1)} {toToken}
          <SwitchHorizontalIcon className="w-4" />
        </p>
      </div>
      <div className="flex items-center justify-between px-3 py-2 mt-3 rounded-lg dark:bg-foreground-200 bg-primary-300 hover:ring-1 hover:ring-offset-0 hover:dark:ring-foreground-500 hover:ring-primary-600">
        <img
          src={api.getCurrencyLogo(toToken)}
          style={{ width: 25, height: 25 }}
        />
        {toToken && toToken}
        <input
          className="ml-3 text-2xl font-semibold text-right bg-transparent focus:outline-none w-36 md:w-auto"
          placeholder="0.00"
          value={amount}
          onChange={onChangeAmounts}
        />
      </div>
      <p className="mt-1 text-sm font-normal text-right text-slate-400 ">
        Estimated value: ~ ${formatUSD(estimatedValueBuy)}
      </p>
    </div>
  );
};

export default WrapContianer;
