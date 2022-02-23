import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { networkSelector } from "lib/store/features/api/apiSlice";
import { DefaultTemplate } from "components";
import cx from "classnames";
import api from "lib/api";
import Swap from "./Swap/Swap";
import SwapReceipts from "./SwapReceipts/SwapReceipts";
import SwapIncompatible from "./Swap/SwapIncompatible";
import "./SwapPage.style.css";

export default function SwapPage() {
  const network = useSelector(networkSelector);
  const isSwapCompatible = useMemo(
    () => network && api.isImplemented("depositL2"),
    [network]
  );
  const tab = useParams().tab || "swap";

  return (
    <DefaultTemplate>
      <div className="swap_section">
        <div className="swap_container">
          <div className="swap_head_tabs">
            <Link
              className={cx({ swap_head_tab_active: tab === "swap" })}
              to="/swap"
            >
              Swap
            </Link>
            <Link
              className={cx({ swap_head_tab_active: tab === "receipts" })}
              to="/swap/receipts"
            >
              Receipts
            </Link>
          </div>
        </div>
        <div className="swap_container" style={{ flex: "1 1 auto" }}>
          {isSwapCompatible ? (
            tab === "swap" ? (
              <Swap />
            ) : (
              <SwapReceipts />
            )
          ) : (
            <SwapIncompatible />
          )}
        </div>
      </div>
    </DefaultTemplate>
  );
}
