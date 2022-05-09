import React from "react";
import TokenDropDownModal from "components/organisms/TokenDropdownModal";

import {
  SwitchVerticalIcon,
  SwitchHorizontalIcon,
} from "@heroicons/react/solid";
const SwapContianer = () => {
  return (
    <div className="p-4 mt-4 border-t border-b border-l border-r rounded-lg border-foreground-400">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold font-work">From</p>
        <p className="text-sm font-normal font-work">
          Available Balance: 1.09393 ETH
        </p>
      </div>
      <div className="flex items-center justify-between px-3 py-2 mt-3 rounded-lg bg-foreground-200">
        <TokenDropDownModal />
        <button className="bg-[#07071C] px-2 py-1 rounded-md text-sm font-semibold text-primary-900 ml-2.5 hover:bg-slate-800 font-work">
          Max
        </button>
        <input
          className="ml-3 text-2xl font-semibold text-right bg-transparent focus:outline-none"
          placeholder="0.00"
        />
      </div>
      <p className="mt-1 text-sm font-normal text-right text-slate-400 font-work">
        Estimated value: ~ $943.77
      </p>
      <div className="relative h-px mx-2 my-5 bg-foreground-400">
        <button className="absolute inset-x-0 w-10 h-10 mx-auto -mt-5 rounded-full shadow-xl bg-gradient-to-r from-primary-900 to-secondary-900">
          <SwitchVerticalIcon className="absolute inset-x-0 mx-auto -mt-3.5 w-7 hover:opacity-80" />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">To</p>
        <p className="flex items-center text-sm font-normal font-work">
          1 ETH = 2771.22 USDT
          <SwitchHorizontalIcon className="w-4" />
        </p>
      </div>
      <div className="flex items-center justify-between px-3 py-2 mt-3 rounded-lg">
        <TokenDropDownModal />
        <input
          className="ml-3 text-2xl font-semibold text-right bg-transparent focus:outline-none"
          placeholder="0.00"
        />
      </div>
    </div>
  );
};

export default SwapContianer;
