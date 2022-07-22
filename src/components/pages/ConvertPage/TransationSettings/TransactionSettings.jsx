import React, { useState } from "react";
import { EditIcon } from "components/atoms/Svg";
import { CheckIcon } from "@heroicons/react/solid";
import { QuestionHelper } from "components";
import { formatPrice } from "lib/utils";

const TransactionSettings = ({
  transactionType,
  onSetSlippageValue,
  slippageValue,
  transactionFee,
  feeToken,
  estimatedValueFee,
}) => {
  const [editableSlippage, setEditableSlippage] = useState(false);
  const onEditableSlippage = () => {
    setEditableSlippage(!editableSlippage);
    if (editableSlippage && slippageValue === "") {
      onSetSlippageValue("2.00");
    }
  };

  return (
    <div className="p-4 mt-4 border-t border-b border-l border-r rounded-lg dark:border-foreground-400 border-primary-500">
      <p className="text-lg font-work">Transaction Settings</p>
      <div className="flex justify-between mt-4">
        <p className="flex items-center gap-2 text-base ">
          Slippage Tolerance
          <QuestionHelper
            text={
              <div>
                <p>
                  Your order will only get filled within your slippage
                  tolerance.
                </p>
                <p>
                  Unfilled orders remain open for 60 seconds and are
                  automatically closed after.
                </p>
              </div>
            }
            placement="bottom"
          ></QuestionHelper>
        </p>
        <p className="flex items-center h-6 gap-2 text-base ">
          {!editableSlippage ? (
            <>
              {Number(slippageValue).toFixed(2)}%
              <EditIcon
                size={16}
                className="cursor-pointer hover:opacity-75"
                onClick={onEditableSlippage}
              />
            </>
          ) : (
            <>
              <input
                value={slippageValue}
                onChange={(e) => onSetSlippageValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onEditableSlippage()}
                className="w-16 px-1 py-1 text-base font-semibold text-right rounded-sm dark:ring-foreground-500 hover:ring-primary-600 ring-1 ring-offset-0 focus:outline-none dark:bg-foreground-200 bg-primary-300"
              />
              %
              <CheckIcon
                className="w-6 cursor-pointer hover:opacity-75"
                onClick={onEditableSlippage}
              />
            </>
          )}
        </p>
      </div>
      <div className="flex justify-between mt-4">
        <p className="flex items-center gap-2 text-base font-light ">
          Estimated gas fee
        </p>
        <div className="flex items-center gap-2 text-base ">
          {
            `${formatPrice(transactionFee)} ${
              feeToken
            } (~$${
              estimatedValueFee.toFixed(2)
            })`
          }
        </div>
      </div>
    </div>
  );
};

export default TransactionSettings;
