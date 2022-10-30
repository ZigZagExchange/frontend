import React, { useRef, useCallback, useEffect } from "react";
import api from "lib/api";
import QRCode from "qrcode.react";
import { XIcon, SaveAsIcon } from "@heroicons/react/solid";
import useTheme from "components/hooks/useTheme";
import classNames from "classnames";
import * as htmlToImage from "html-to-image";

import logo from "assets/images/logo.png";

import { useTranslation } from "react-i18next";

const FillCard = ({ fill, closeToast }) => {
  const ref = useRef(null);
  const { isDark } = useTheme();
  const { t } = useTranslation();

  const tradeId = fill[1];
  const market = fill[2];
  const fillstatus = fill[6];
  let feeamount = fill[10];
  const feetoken = fill[11];
  const side = fill[3];
  let feeText = "1 USDC";
  const marketInfo = api.marketInfo["ETH-USDC"];
  if (feeamount && feetoken) {
    feeamount = Number(feeamount);
    const displayFee =
      feeamount > 9999 ? feeamount.toFixed(0) : feeamount.toPrecision(4);
    feeText = feeamount !== 0 ? `${displayFee} ${feetoken}` : "--";
  } else if (["b", "o", "m", "r", "e"].includes(fillstatus)) {
    feeText = "--";
    // cases below make it backward compatible:
  } else if (!marketInfo) {
    feeText = "1 USDC";
  } else if (fillstatus === "r" || !api.isZksyncChain()) {
    feeText = "0 " + marketInfo.baseAsset.symbol;
  } else if (side === "s") {
    feeText = marketInfo.baseFee + " " + marketInfo.baseAsset.symbol;
  } else if (side === "b") {
    feeText = marketInfo.quoteFee + " " + marketInfo.quoteAsset.symbol;
  }

  useEffect(() => {
    ref.current.lastElementChild.lastElementChild.classList.toggle("hidden");
  }, []);

  const downloadQRCode = useCallback(() => {
    if (ref.current === null) {
      return;
    }
    ref.current.lastElementChild.lastElementChild.classList.toggle("hidden");
    htmlToImage
      .toPng(ref.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `${tradeId}.png`;
        link.href = dataUrl;
        link.click();
        ref.current.lastElementChild.lastElementChild.classList.toggle(
          "hidden"
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }, [ref]);

  return (
    <div ref={ref} className={classNames({ dark: isDark })}>
      <div className="dark:bg-[#2B2E4A] -m-2 relative bg-[#ddf1f7] border dark:border-foreground-400 border-slate-300 shadow-lg rounded-md p-4 pr-2">
        <div className="flex justify-between pb-3 border-b dark:border-foreground-500 border-slate-300">
          <div className="flex items-center gap-3 text-lg font-semibold dark:text-foreground-900 text-background-900 font-work">
            <img src={logo} alt="logo" className="w-6" />
            <p>
              {fill[2]}{" "}
              <span
                className={classNames({
                  "text-danger-900": fill[3] === "s",
                  "text-success-900": fill[3] === "b",
                })}
              >
                {fill[3] === "b" ? t("buy") : t("sell")}
              </span>{" "}
              {t("order_successful")}
            </p>
          </div>
          <XIcon
            className="w-5 h-5 dark:text-foreground-900 text-background-900 hover:opacity-75"
            onClick={closeToast}
          />
        </div>
        <div className="pt-3">
          <p className="font-normal font-work dark:text-foreground-900 text-background-900 secret-div">
            {t("use_the_trade_id_to_identify_old_trades")}
          </p>
          <div className="flex items-start gap-4 mt-3">
            {/* <img src={QR} alt="QR" className="w-36" /> */}
            <div className="p-3 rounded-lg bg-foreground-900">
              <QRCode
                id="qrCodeEl"
                size={90}
                value={"https://zigzag.exchange"}
              />
            </div>
            <div>
              <div className="flex gap-2 text-sm font-normal font-work dark:text-foreground-900 text-background-900">
                {t("trade_id")}:{" "}
                <button
                  onClick={() => {
                    window.open(
                      api.getExplorerTxLink(fill[0], fill[7]),
                      "_blank"
                    );
                  }}
                  className="flex items-center gap-2 text-sm font-semibold underline hover:no-underline text-primary-900 underline-offset-1 font-work"
                >
                  #{fill[1]}
                </button>
                <SaveAsIcon
                  className="w-4 h-4 hover:opacity-80 text-primary-900"
                  onClick={() => {
                    navigator.clipboard.writeText(fill[1]);
                  }}
                />
              </div>
              <div className="mt-3 text-sm font-normal font-work dark:text-foreground-900 text-background-900">
                {t("average_buy_price")}:
                <span className="font-bold">
                  {" "}
                  {Number(fill[4])?.toPrecision(6) / 1} {market.split("-")[1]}
                </span>
              </div>
              <div className="mt-3 text-sm font-normal font-work dark:text-foreground-900 text-background-900">
                {t("amount")}:
                <span className="font-bold">
                  {" "}
                  {Number(fill[5])?.toPrecision(6) / 1} {market.split("-")[0]}
                </span>
              </div>
              <div className="mt-3 text-sm font-normal font-work dark:text-foreground-900 text-background-900">
                {t("fee")}:<span className="font-bold"> {feeText}</span>
              </div>
              <button
                className="mt-2 text-sm font-semibold text-primary-900 hover:underline hover:underline-offset-1 font-work"
                onClick={downloadQRCode}
              >
                {t("save_as_image")}
              </button>
            </div>
          </div>
        </div>
        <div
          id="url"
          className="absolute bottom-4 right-2 dark:text-foreground-900 text-background-900 font-work"
        >
          zigzag.exchange
        </div>
      </div>
    </div>
  );
};

export default FillCard;
