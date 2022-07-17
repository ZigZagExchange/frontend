import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import classNames from "classnames";
import { format } from "date-fns";
import {
  bridgeReceiptsSelector,
  clearBridgeReceipts,
} from "lib/store/features/api/apiSlice";
import api from "lib/api";

const isMobile = window.innerWidth < 500;

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
    console.log(tempArray);
  }, [receipts]);

  return (
    <div>
      {receipts.length > 0 && (
        <div className="flex justify-between mt-4">
          <p className="text-base font-work dark:text-foreground-800 ">
            Viewing {receipts.length} transfers
          </p>
          <button
            className="bg-[#000000] px-2 py-1 rounded-md text-sm font-semibold text-primary-900 ml-2.5 hover:bg-slate-800 font-work"
            onClick={() => dispatch(clearBridgeReceipts())}
          >
            Clear all
          </button>
        </div>
      )}
      {receipts.length === 0 && (
        <p className="mt-4 text-base font-work dark:text-foreground-800 text-background-800 ">
          No bridge receipts yet.
        </p>
      )}
      {groupArray.map((group, index) => {
        return (
          <div className="mt-5" key={index}>
            <p className="text-sm font-semibold ">{group.date}</p>
            <div className="mt-2 border divide-y rounded-lg dark:border-foreground-500 border-primary-500 dark:divide-foreground-500 divide-primary-500">
              {group.items.map((item, idx) => {
                const type =
                  item.type === "eth_to_zksync" ? "Deposit" : "Withdraw";
                return (
                  <div
                    className="flex items-center justify-between px-6 py-5"
                    key={idx}
                  >
                    <div className="flex items-center gap-5 ">
                      <p className="inline-block px-2 py-1 text-xs font-semibold border rounded-lg dark:border-foreground-400 border-primary-500">
                        {type}
                      </p>
                      <img
                        src={api.getCurrencyLogo(item.token)}
                        alt="icon"
                        className={classNames("w-7 h-7", {
                          "ml-3": type === "Deposit",
                        })}
                      />
                      <p className="text-xs font-semibold ">
                        {Math.round(Number(item.amount) * 10 ** 6) / 10 ** 6}{" "}
                        {item.token}
                      </p>
                    </div>
                    <div className="flex gap-5">
                      <a
                        href={item.txUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-gray-400 hover:underline underline-offset-2"
                      >
                        {isMobile
                          ? `${item.txId.substr(0, 5)}...${item.txId.substr(
                              -4
                            )}`
                          : `${item.txId.substr(0, 10)}...${item.txId.substr(
                              -6
                            )}`}
                      </a>
                      <p className="text-xs font-semibold text-gray-400 ">
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
