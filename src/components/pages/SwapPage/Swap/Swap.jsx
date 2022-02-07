import React, { useMemo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { SwapButton, Button, useCoinEstimator } from "components";
import { networkSelector } from "lib/store/features/api/apiSlice";
import { userSelector } from "lib/store/features/auth/authSlice";
import api from "lib/api";
import { MAX_ALLOWANCE } from "lib/api/constants";
import { formatUSD } from "lib/utils";
import cx from "classnames";
import { BiError } from "react-icons/bi";
import { MdSwapCalls } from "react-icons/md";
import darkPlugHead from "assets/icons/dark-plug-head.png";
import SwapSwapInput from "../SwapSwapInput/SwapSwapInput";

const defaultTransfer = {
  type: "deposit",
};

const Swap = () => {
  // eslint-disable-next-line
  const user = useSelector(userSelector);
  const [zkBalances, setBalances] = useState({});
  const [loading, setLoading] = useState(false);
  const [isApproving, setApproving] = useState(false);
  const [walletBalances, setWalletBalances] = useState({});
  const [formErr, setFormErr] = useState(""); // eslint-disable-line no-unused-vars
  const network = useSelector(networkSelector);
  const [transfer, setTransfer] = useState(defaultTransfer);
  const [swapDetails, _setSwapDetails] = useState(() => ({
    amount: "",
    currency: "ETH",
  }));
  const currencies = useMemo(() => null, [transfer.type]);
  const coinEstimator = useCoinEstimator();

  const currencyValue = coinEstimator(swapDetails.currency);
  const activationFee = parseFloat(
    (user.address && !user.id ? 15 / currencyValue : 0).toFixed(5)
  );
  const estimatedValue =
    +swapDetails.amount * coinEstimator(swapDetails.currency) || 0;

  useEffect(() => {
    api.getBalances().then((newBalances) => {
      setBalances(newBalances);
    });
  }, [user]);

  useEffect(() => {
    const watchWalletFn = () => {
      api.getWalletBalances().then((newWalletBalances) => {
        setWalletBalances(newWalletBalances);
      });
    };

    let watchWallet = setInterval(watchWalletFn, 7000);
    watchWalletFn();

    return () => {
      clearInterval(watchWallet);
    };
  }, []);

  const setSwapDetails = (values) => {
    const details = {
      ...swapDetails,
      ...values,
    };

    _setSwapDetails(details);

    const bals = transfer.type === "deposit" ? walletBalances : zkBalances;
    const detailBalance =
      parseFloat(
        bals[details.currency] && bals[details.currency].valueReadable
      ) || 0;
    const input = parseFloat(details.amount) || 0;

    if (details.amount && details.amount.length > 0) {
      if (input < 0.001) {
        setFormErr("Must be at least 0.001");
      } else if (input <= activationFee) {
        setFormErr(
          `Must be more than ${activationFee} ${swapDetails.currency}`
        );
      } else if (input > detailBalance) {
        setFormErr("Insufficient balance");
      } else {
        setFormErr("");
      }
    } else {
      setFormErr("");
    }
  };

  const switchTransferType = (e) => {
    if (e) e.preventDefault();
    transfer.type = transfer.type === "deposit" ? "withdraw" : "deposit";
    setTransfer(transfer);
    setSwapDetails({});
  };

  const disconnect = () => {
    api.signOut().catch((err) => console.log(err));
  };

  const balances = transfer.type === "deposit" ? walletBalances : zkBalances;
  const hasAllowance =
    balances[swapDetails.currency] &&
    balances[swapDetails.currency].allowance.gte(MAX_ALLOWANCE.div(3));
  const hasError = formErr && formErr.length > 0;

  const approveSpend = (e) => {
    if (e) e.preventDefault();
    setApproving(true);
    api
      .approveSpendOfCurrency(swapDetails.currency)
      .then(() => {
        setApproving(false);
      })
      .catch((err) => {
        console.log(err);
        setApproving(false);
      });
  };

  const doTransfer = (e) => {
    e.preventDefault();
    let deferredXfer;

    setLoading(true);

    if (transfer.type === "deposit") {
      deferredXfer = api.depositL2(
        `${swapDetails.amount}`,
        swapDetails.currency
      );
    } else {
      deferredXfer = api.withdrawL2(
        `${swapDetails.amount}`,
        swapDetails.currency
      );
    }

    deferredXfer
      .then((state) => {
        setTimeout(() => api.getAccountState(), 1000);
        setLoading(false);
      })
      .catch((e) => {
        console.log(e.message);
        setLoading(false);
      });
  };

  return (
    <>
      <div className="swap_box">
        <div className="swap_box_top">
          <div className="swap_coin_title">
            <h5>FROM</h5>
          </div>
          <SwapSwapInput
            balances={balances}
            currencies={currencies}
            value={swapDetails}
            onChange={setSwapDetails}
          />
          <div className="swap_coin_stats">
            <div className="swap_coin_stat">
              <h5>Estimated value</h5>
              <span>~${formatUSD(estimatedValue)}</span>
            </div>
            <div className="swap_coin_stat">
              <h5>Available balance</h5>
              <span>
                {balances[swapDetails.currency] &&
                  balances[swapDetails.currency].valueReadable}
                {` ${swapDetails.currency}`}
              </span>
            </div>
          </div>
        </div>

        <div className="swap_box_bottom">
          <div className="swap_box_swap_wrapper">
            <SwapButton onClick={switchTransferType} />
            <h5>Switch</h5>
          </div>

          <div className="swap_coin_stats">
            <div className="swap_coin_stat">
              <div className="swap_coin_details">
                <div className="swap_coin_title">
                  <h5>TO</h5>
                </div>
              </div>
            </div>
          </div>
          <SwapSwapInput
            balances={balances}
            currencies={currencies}
            value={swapDetails}
            onChange={setSwapDetails}
          />
          <div className="swap_coin_stats" style={{ marginTop: "15px" }}>
            <div className="swap_coin_stat">
              <h5>Estimated value</h5>
              <span>~${formatUSD(estimatedValue)}</span>
            </div>
            <div className="swap_coin_stat">
              <h5>Available balance</h5>
              <span>
                {balances[swapDetails.currency] &&
                  balances[swapDetails.currency].valueReadable}
                {` ${swapDetails.currency}`}
              </span>
            </div>
          </div>

          {!user.address || user.id ? (
            <div className="swap_transfer_fee">
              Swap Tax: 0% (0 {swapDetails.currency})
            </div>
          ) : (
            <div className="swap_transfer_fee">
              One-Time Activation Fee: ${activationFee} ${swapDetails.currency}{" "}
              (~$15.00)
            </div>
          )}
          <div className="swap_button">
            {!user.address && (
              <Button
                className="bg_btn"
                text="CONNECT WALLET"
                img={darkPlugHead}
                onClick={() => api.signIn(network)}
              />
            )}
            {user.address && balances[swapDetails.currency] && !hasAllowance && (
              <Button
                loading={isApproving}
                className={cx("bg_btn", {
                  zig_disabled:
                    formErr.length > 0 || swapDetails.amount.length === 0,
                })}
                text="APPROVE"
                style={{ marginBottom: 10 }}
                onClick={approveSpend}
              />
            )}
            {user.address && hasError && (
              <Button
                className="bg_btn zig_btn_disabled bg_err"
                text={formErr}
                icon={<BiError />}
              />
            )}
            {user.address && !hasError && (
              <Button
                loading={loading}
                className={cx("bg_btn", {
                  zig_disabled:
                    !hasAllowance || swapDetails.amount.length === 0,
                })}
                text="SWAP"
                icon={<MdSwapCalls />}
                onClick={doTransfer}
              />
            )}
          </div>
        </div>
      </div>
      {user.address ? (
        <div className="swap_connected_as">
          <span className="swap_bubble_connected" /> Connected as{" "}
          {`${user.address.substr(0, 6)}...${user.address.substr(-5)}`}
          <span onClick={disconnect} className="swap_disconnect">
            {" • "}
            <a href="#disconnect">Disconnect</a>
          </span>
        </div>
      ) : (
        <div className="swap_connected_as">
          <span className="swap_bubble_disconnected" />
          Disconnected
        </div>
      )}
    </>
  );
};

export default Swap;
