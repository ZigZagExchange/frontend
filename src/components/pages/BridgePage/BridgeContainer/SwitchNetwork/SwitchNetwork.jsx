import React, { useState } from "react";

import NetworkDropdown from "./NetworkDropdown";
import { SwitchHorizontalIcon } from "@heroicons/react/solid";

const SwitchNetwork = ({
  fromNetworkOptions,
  onChangeFromNetwork,
  fromNetwork,
  toNetworkOptions,
  onChangeToNetwork,
  toNetwork,
  onClickSwitchNetwork,
}) => {
  return (
    <div className="flex gap-2 p-2 mt-4 border rounded-lg sm:p-4 sm:gap-4 dark:border-foreground-400 border-primary-500">
      <div className="w-full">
        <p className="mb-1 text-base tracking-wide font-work">Transfer from</p>
        <NetworkDropdown
          options={fromNetworkOptions}
          setSelectedItem={onChangeFromNetwork}
          selectedItem={fromNetwork}
        />
      </div>
      <div className="flex items-end justify-center pb-2">
        <button
          className="flex items-center justify-center w-10 h-10 border rounded-full shadow-xl dark:border-foreground-400 border-primary-500"
          onClick={onClickSwitchNetwork}
        >
          <SwitchHorizontalIcon className="w-6 text-gray-900 transition-all duration-300 ease-in-out origin-center dark:text-white hover:opacity-80 hover:rotate-180" />
        </button>
      </div>
      <div className="w-full">
        <p className="mb-1 text-base tracking-wide font-work">Transfer to</p>
        <NetworkDropdown
          options={toNetworkOptions}
          setSelectedItem={onChangeToNetwork}
          selectedItem={toNetwork}
        />
      </div>
    </div>
  );
};

export default SwitchNetwork;
