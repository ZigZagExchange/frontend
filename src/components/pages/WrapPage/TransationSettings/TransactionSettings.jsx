import React from "react";

const TransactionSettings = ({ transactionType, fee }) => {
  return (
    <div className="p-4 mt-4 border-t border-b border-l border-r rounded-lg dark:border-foreground-400 border-primary-500">
      <p className="text-lg font-work">Transaction Settings</p>
      <div className="flex justify-between mt-4">
        <p className="flex items-center gap-2 text-base font-light ">
          Estimated gas fee:
        </p>
        <div className="flex items-center gap-2 text-base ">
          {fee && (
            <div>~ {Number(fee[transactionType]).toPrecision(4)} ETH</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionSettings;
