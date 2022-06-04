import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { format } from "date-fns";
import {
  bridgeReceiptsSelector,
  clearBridgeReceipts,
} from "lib/store/features/api/apiSlice";
import api from "lib/api";

const TransferHistory = () => {
  const receipts = useSelector(bridgeReceiptsSelector);
  const dispatch = useDispatch();
  const [groupArray, setGroupArray] = useState([]);

  useEffect(() => {
    let tempArray = [];
    let tempObj = { date: "", items: [] };
    receipts.forEach((item, key) => {
      const mdate = format(item.date, "MMM d, Y");
      if (tempObj.date === "") {
        tempObj = { date: mdate, items: [] };
      }
      if (tempObj.date !== mdate) {
        tempArray.push(tempObj);
        tempObj = { date: mdate, items: [] };
      }
      tempObj.items.push(item);
      if (key === receipts.length - 1) {
        tempArray.push(tempObj);
      }
    });
    setGroupArray(tempArray);
  }, [receipts]);

  return (
    <div>
      {receipts.length > 0 && (
        <div className="flex justify-between mt-4">
          <p className="text-sm font-semibold dark:text-foreground-800 font-work">
            Viewing {receipts.length} transfers
          </p>
          <button
            className="text-sm hover:underline font-work text-primary-900 underline-offset-1"
            onClick={() => dispatch(clearBridgeReceipts())}
          >
            Clear all
          </button>
        </div>
      )}
      {receipts.length === 0 && (
        <p className="mt-4 text-sm font-semibold text-foreground-800 font-work">
          No bridge receipts yet.
        </p>
      )}
      {groupArray.map((group, index) => {
        return (
          <div className="mt-5" key={index}>
            <p className="text-sm font-semibold font-work">{group.date}</p>
            <div className="mt-2 border divide-y rounded-lg dark:border-foreground-500 border-primary-500 dark:divide-foreground-500 divide-primary-500">
              {group.items.map((item, idx) => {
                return (
                  <div
                    className="flex items-center justify-between px-6 py-5"
                    key={idx}
                  >
                    <div className="flex items-center gap-5 ">
                      <p className="inline-block px-2 py-1 text-xs font-semibold border rounded-lg font-work border-foreground-500">
                        {item.type === "eth_to_zksync" ? "Deposit" : "Withdraw"}
                      </p>
                      <img
                        src={api.getCurrencyLogo(item.token)}
                        alt="icon"
                        className="w-7 h-7"
                      />
                      <p className="text-xs font-semibold font-work">
                        {item.amount} {item.token}
                      </p>
                    </div>
                    <div className="flex gap-5">
                      <a
                        href={`https://rinkeby.etherscan.io/tx/${item.txId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-gray-400 font-work hover:underline underline-offset-2"
                      >{`${item.txId.substr(0, 10)}...${item.txId.substr(
                        -6
                      )}`}</a>
                      <p className="text-xs font-semibold text-gray-400 font-work">
                        {format(item.date, "H:mm")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransferHistory;
