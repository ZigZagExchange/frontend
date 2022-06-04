import React, { useState } from "react";
import { InfoIcon } from "components/atoms/Svg";
import classNames from "classnames";
import { formatUSD, formatPrice } from "lib/utils";
import { RadioGroup } from "@headlessui/react";
const TransactionSettings = ({
  user,
  transfer,
  isSwapAmountEmpty,
  fromNetwork,
  toNetwork,
  L1Fee,
  L2Fee,
  swapDetails,
  isFastWithdraw,
  balances,
  usdFee,
  onChangeSpeed,
  withdrawSpeed,
  activationFee,
  L2FeeToken,
  hasError,
  fastWithdrawDisabled,
}) => {
  return (
    <div className="p-2 mt-3 border rounded-lg sm:p-4 dark:border-foreground-400 border-primary-500">
      <p className="font-sans text-sm font-semibold tracking-wide font-work">
        Transaction Settings
      </p>
      <div className="flex justify-between mt-3">
        <p className="font-sans text-sm font-work">Address</p>
        <div className="flex space-x-2">
          <p className="font-sans text-sm font-work">
            {user.address ? "Connected Address" : "Disconnected"}
          </p>
          <div className="flex items-center justify-center w-5 h-5 border rounded-md dark:border-white border-primary-500">
            {user.address ? (
              <div className="w-3 h-3 rounded-sm bg-gradient-to-tr from-primary-900 to-secondary-900"></div>
            ) : (
              <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
            )}
          </div>
        </div>
      </div>
      {user.address && (
        <div className="py-2 mt-2 font-sans text-sm tracking-wider text-center border rounded-lg dark:border-foreground-400 border-primary-500 text-slate-400 font-work">
          {user.address}
        </div>
      )}
      {user.address && user.id && !isSwapAmountEmpty && (
        <>
          {transfer.type === "withdraw" && (
            <>
              {fromNetwork.id === "zksync" && toNetwork.id === "ethereum" && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <p className="font-sans text-sm font-work">
                      Withdraw speed:
                    </p>
                    <InfoIcon size={16} />
                  </div>
                  <RadioGroup
                    value={withdrawSpeed}
                    onChange={onChangeSpeed}
                    className="flex mt-3 space-x-2"
                  >
                    <RadioGroup.Option
                      value="fast"
                      disabled={fastWithdrawDisabled}
                    >
                      {({ checked, disabled }) => (
                        <div className="text-center cursor-pointer">
                          <p
                            className={classNames("text-sm font-work", {
                              "text-gray-500": disabled,
                            })}
                          >
                            Fast
                          </p>
                          <div
                            className={classNames(
                              "inline-flex items-center justify-center w-5 h-5 mt-1 border border-white rounded-full",
                              disabled ? "border-gray-600" : ""
                            )}
                          >
                            {checked && (
                              <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-primary-900 to-secondary-900"></div>
                            )}
                          </div>
                        </div>
                      )}
                    </RadioGroup.Option>
                    <RadioGroup.Option value="normal">
                      {({ checked }) => (
                        <div className="text-center cursor-pointer">
                          <p className="text-sm font-work">Normal</p>
                          <div className="inline-flex items-center justify-center w-5 h-5 mt-1 border border-white rounded-full">
                            {checked && (
                              <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-primary-900 to-secondary-900"></div>
                            )}
                          </div>
                        </div>
                      )}
                    </RadioGroup.Option>
                  </RadioGroup>
                </div>
              )}
              {L2Fee && fromNetwork.id === "zksync" && (
                <div className="flex items-center justify-between mt-3">
                  <p className="font-sans text-sm font-work">
                    zkSync L2 gas fee:
                  </p>
                  <p className="font-sans text-sm font-work">{`~${L2Fee} ${L2FeeToken}`}</p>
                </div>
              )}
              {!L2Fee && <div>Loading...</div>}
              {transfer.type === "withdraw" && toNetwork.id === "ethereum" && (
                <>
                  {isFastWithdraw && L1Fee && (
                    <div className="flex items-center justify-between mt-3">
                      <p className="font-sans text-sm font-work">
                        Ethereum L1 gas + bridge fee:
                      </p>
                      <p className="font-sans text-sm font-work">
                        {" "}
                        ~{formatPrice(L1Fee)} {swapDetails.currency}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <p className="font-sans text-sm font-work">
                      You'll receive:
                    </p>
                    <p className="font-sans text-sm font-work">
                      {isFastWithdraw ? " ~" : " "}
                      {isFastWithdraw && L1Fee
                        ? formatPrice(swapDetails.amount - L1Fee)
                        : formatPrice(swapDetails.amount)}
                      {" " + swapDetails.currency} on Ethereum L1
                    </p>
                  </div>
                </>
              )}
            </>
          )}
          {transfer.type === "deposit" && (
            <>
              {L1Fee && (
                <div className="flex items-center justify-between mt-3">
                  <p className="font-sans text-sm font-work">
                    {fromNetwork.id === "polygon" && `Polygon gas fee: `}
                    {fromNetwork.id === "ethereum" && `Gas fee: `}
                  </p>
                  <p className="font-sans text-sm font-work">
                    {fromNetwork.id === "polygon" &&
                      `~${formatPrice(L1Fee)} MATIC`}
                    {fromNetwork.id === "ethereum" &&
                      `~${formatPrice(L1Fee)} ETH`}
                  </p>
                </div>
              )}
              {!L1Fee && !hasError && <div>Loading</div>}
              {transfer.type === "deposit" && (
                <div className="flex items-center justify-between mt-3">
                  <p className="font-sans text-sm font-work">You'll receive:</p>
                  <p className="font-sans text-sm font-work">
                    {fromNetwork.id === "polygon" &&
                      ` ~${formatPrice(swapDetails.amount)}`}
                    {toNetwork.id === "polygon" &&
                      ` ~${formatPrice(swapDetails.amount)}`}
                    {fromNetwork.id === "ethereum" &&
                      toNetwork.id === "zksync" &&
                      ` ${formatPrice(swapDetails.amount)}`}

                    {fromNetwork.id === "polygon" && ` ETH on zkSync L2`}
                    {toNetwork.id === "polygon" && ` WETH on Polygon`}
                    {fromNetwork.id === "ethereum" &&
                      toNetwork.id === "zksync" &&
                      ` ${swapDetails.currency} on zkSync L2`}
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-2">
          <p className="font-sans text-sm font-work">Address:</p>
          <InfoIcon size={16} />
        </div>
        <p className="font-sans text-sm font-work">0.0001894 ETH</p>
      </div> */}
      {transfer.type === "deposit" && user.address && !user.id && (
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <p className="font-sans text-sm font-work">
              One-time Account Activation fee:(~${usdFee})
            </p>
            <InfoIcon size={16} />
          </div>
          <p className="font-sans text-sm font-work">
            {activationFee} {swapDetails.currency} (~${usdFee})
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionSettings;
