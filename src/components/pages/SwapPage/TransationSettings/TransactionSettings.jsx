import React from "react";
import { useSelector } from "react-redux";
import { InfoIcon, EditIcon } from "components/atoms/Svg";
import { marketInfoSelector } from "lib/store/features/api/apiSlice";

const TransactionSettings = ({ transactionType }) => {
  const marketInfo = useSelector(marketInfoSelector);
  return (
    <div className="p-4 mt-4 border-t border-b border-l border-r rounded-lg dark:border-foreground-400 border-primary-500">
      <p className="text-lg font-work">Transaction Settings</p>
      <div className="flex justify-between mt-3">
        <p className="flex items-center gap-2 text-base ">
          Slippage Tolerance
          <InfoIcon size={16} />
        </p>
        <p className="flex items-center gap-2 text-base ">
          2.00%
          <EditIcon size={16} />
        </p>
      </div>
      <div className="flex justify-between mt-3">
        <p className="flex items-center gap-2 text-base font-light ">
          Estimated gas fee:
        </p>
        <div className="flex items-center gap-2 text-base ">
          {transactionType === "buy" && (
            <div>
              {marketInfo &&
                marketInfo.quoteFee &&
                Number(marketInfo.quoteFee).toPrecision(5)}{" "}
              {marketInfo && marketInfo.quoteAsset.symbol}
            </div>
          )}
          {transactionType === "sell" && (
            <div>
              {marketInfo &&
                marketInfo.baseFee &&
                Number(marketInfo.baseFee).toPrecision(5)}{" "}
              {marketInfo && marketInfo.baseAsset.symbol}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionSettings;
