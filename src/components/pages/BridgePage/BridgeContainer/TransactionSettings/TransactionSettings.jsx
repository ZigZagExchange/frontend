import React from "react";
import { useSelector } from "react-redux";
import classNames from "classnames";
import { formatPrice, shortenAddress } from "lib/utils";
import { RadioGroup } from "@headlessui/react";
import { QuestionHelper } from "components";
import { x } from "@xstyled/styled-components";
import { settingsSelector } from "lib/store/features/api/apiSlice";
import { useCoinEstimator } from "components";
import { useTranslation } from "react-i18next";

const TransactionSettings = ({
  user,
  transfer,
  isSwapAmountEmpty,
  fromNetwork,
  toNetwork,
  L1Fee,
  L2Fee,
  ZigZagFee,
  swapDetails,
  isFastWithdraw,
  usdFee,
  onChangeSpeed,
  withdrawSpeed,
  activationFee,
  L2FeeToken,
  ZigZagFeeToken,
  hasError,
  formErr,
  fastWithdrawDisabled,
}) => {
  const coinEstimator = useCoinEstimator();
  const settings = useSelector(settingsSelector);
  const { t } = useTranslation();

  return (
    <div className="p-2 mt-3 border rounded-lg sm:p-4 dark:border-foreground-400 border-primary-500">
      <p className="text-base font-work">{t("transaction_settings")}</p>
      <div className="flex justify-between mt-3">
        {user.address && <p className="text-sm font-work ">{t("address")}</p>}
      </div>
      {user.address && (
        <div className="py-2 mt-2 font-sans text-sm tracking-wider text-center border rounded-lg dark:border-foreground-400 border-primary-500 text-slate-400 ">
          {settings.hideAddress
            ? "*****...*****"
            : shortenAddress(user.address, 10)}
        </div>
      )}
      {user.address && user.id && !isSwapAmountEmpty && (
        <>
          {transfer.type === "withdraw" && (
            <>
              {fromNetwork.id === "zksync" && toNetwork.id === "ethereum" && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <p className="font-sans text-sm ">{t("withdraw_speed")}:</p>
                    <QuestionHelper
                      text={
                        <x.div>
                          <x.div mb={2}>
                            {t("fast_receive_within_seconds_through")}.
                          </x.div>
                          <x.div mb={2}>
                            {t("normal_use_bridge_and_receive")}.
                          </x.div>
                        </x.div>
                      }
                      placement="bottom"
                    ></QuestionHelper>
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
                            className={classNames("text-sm ", {
                              "text-gray-500": disabled,
                            })}
                          >
                            {t("fast")}
                          </p>
                          <div
                            className={classNames(
                              "inline-flex items-center justify-center w-5 h-5 mt-1 border dark:border-foreground-400 border-primary-500 rounded-full",
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
                          <p className="text-sm ">{t("normal")}</p>
                          <div className="inline-flex items-center justify-center w-5 h-5 mt-1 border rounded-full dark:border-foreground-400 border-primary-500">
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
              {ZigZagFee && (
                <div className="flex items-center justify-between mt-3">
                  <p className="font-sans text-sm ">{t("bridge_fee")}:</p>
                  <p className="font-sans text-sm ">
                    {`~${formatPrice(ZigZagFee)} ${ZigZagFeeToken} ($${(
                      ZigZagFee * coinEstimator(ZigZagFeeToken)
                    ).toFixed(2)})`}
                  </p>
                </div>
              )}
              {isFastWithdraw && L1Fee && toNetwork.id === "ethereum" && (
                <div className="flex items-center justify-between mt-3">
                  <p className="font-sans text-sm ">{t("ethereum_L1_gas")}:</p>
                  <p className="font-sans text-sm ">
                    {`~${formatPrice(L1Fee)} ${swapDetails.currency} ($${(
                      L1Fee * coinEstimator(swapDetails.currency)
                    ).toFixed(2)})`}
                  </p>
                </div>
              )}
              {L2Fee && (
                <div className="flex items-center justify-between mt-3">
                  <p className="font-sans text-sm ">
                    {t("zksync_L2_gas_fee")}:
                  </p>
                  <p className="font-sans text-sm ">
                    {`~${formatPrice(L2Fee)} ${L2FeeToken} ($${(
                      L2Fee * coinEstimator(L2FeeToken)
                    ).toFixed(2)})`}
                  </p>
                </div>
              )}
              {!L2Fee && <div>{t("loading")}...</div>}
              {!formErr && swapDetails.amount - ZigZagFee > 0 && (
                <div className="flex items-center justify-between mt-3">
                  <p className="font-sans text-sm ">{t("you_will_receive")}:</p>
                  <p className="font-sans text-sm ">
                    {toNetwork.id === "ethereum" &&
                      ` ~${formatPrice(swapDetails.amount - ZigZagFee)} ${
                        swapDetails.currency
                      } ${t("on_ethereum_L1")}`}
                  </p>
                </div>
              )}
            </>
          )}
          {transfer.type === "deposit" && (
            <>
              {ZigZagFee && (
                <div className="flex items-center justify-between mt-3">
                  <p className="font-sans text-sm ">{t("bridge_fee")}:</p>
                  <p className="font-sans text-sm ">
                    {`~${formatPrice(ZigZagFee)} ${ZigZagFeeToken} ($${(
                      ZigZagFee * coinEstimator(ZigZagFeeToken)
                    ).toFixed(2)})`}
                  </p>
                </div>
              )}
              {L1Fee && fromNetwork.id === "ethereum" && (
                <div className="flex items-center justify-between mt-3">
                  <p className="font-sans text-sm ">
                    {fromNetwork.id === "ethereum" &&
                      `${t("ethereum_gas_fee")}: `}
                  </p>
                  <p className="font-sans text-sm ">
                    {fromNetwork.id === "ethereum" &&
                      `~${formatPrice(L1Fee)} ETH ($${(
                        L1Fee * coinEstimator("ETH")
                      ).toFixed(2)})`}
                  </p>
                </div>
              )}
              {!L1Fee && !hasError && fromNetwork.id === "ethereum" && (
                <div>{t("loading")}</div>
              )}
              {!formErr && swapDetails.amount - ZigZagFee > 0 && (
                <div className="flex items-center justify-between mt-3">
                  <p className="font-sans text-sm ">{t("you_will_receive")}:</p>
                  <p className="font-sans text-sm ">
                    {fromNetwork.id === "ethereum" &&
                      toNetwork.id === "zksync" &&
                      ` ${formatPrice(swapDetails.amount - ZigZagFee)}`}
                    {fromNetwork.id === "ethereum" &&
                      toNetwork.id === "zksync" &&
                      ` ${swapDetails.currency} ${t("on_zksync_L2")}`}
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
      {transfer.type === "deposit" && user.address && !user.id && (
        <div className="flex justify-between mt-4">
          <div className="flex space-x-2">
            <div>
              <p className="font-sans text-sm ">
                {t("one_time_account_activation_fee")}:
              </p>
              <p className="font-sans text-sm ">(~${usdFee})</p>
            </div>
            <QuestionHelper
              text="The account activation fee is a one-time fee to register your account with zkSync."
              placement="top"
            ></QuestionHelper>
          </div>
          <p className="font-sans text-sm ">
            {activationFee} {swapDetails.currency} (~${usdFee})
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionSettings;
