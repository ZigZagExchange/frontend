import React from "react";
import TokenDropDownModal from "components/organisms/TokenDropdownModal";
const SwapContianer = () => {
  return (
    <div className="border-l rounded-lg border-r border-t border-b border-foreground-400 p-4 mt-4">
      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold">From</p>
        <p className="text-sm font-normal">Available Balance: 1.09393 ETH</p>
      </div>
      <div className="mt-3 bg-foreground-200 py-2 px-3 rounded-lg flex items-center justify-between">
        <TokenDropDownModal />
        <button className="bg-[#07071C] px-2 py-1 rounded-md text-sm font-semibold text-primary-900 ml-2.5 hover:bg-slate-800">
          Max
        </button>
        <input
          className="bg-transparent ml-3 text-right text-2xl font-semibold focus:outline-none"
          placeholder="0.00"
        />
      </div>
      <p className="text-sm font-normal text-right mt-1 text-slate-400">
        Estimated value: ~ $943.77
      </p>
    </div>
  );
};

export default SwapContianer;
