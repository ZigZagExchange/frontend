import React, {useEffect, useState} from 'react'
import {
  constants as ethersConstants,
  utils as ethersUtils
} from 'ethers';
import {useSelector} from "react-redux";
import isEmpty from "lodash/isEmpty";
import {SwapButton, Button, useCoinEstimator} from 'components'
import {
  networkSelector,
  balancesSelector,
} from "lib/store/features/api/apiSlice"
import Loader from "react-loader-spinner"
import {userSelector} from "lib/store/features/auth/authSlice";
import api from 'lib/api';
import {formatUSD} from 'lib/utils';
import cx from 'classnames';
import {BiError} from 'react-icons/bi';
import {MdSwapCalls} from 'react-icons/md';
import BridgeSwapInput from '../BridgeSwapInput/BridgeSwapInput';
import ConnectWalletButton from "../../../atoms/ConnectWalletButton/ConnectWalletButton";
import Pane from "../../../atoms/Pane/Pane";
import {x} from "@xstyled/styled-components"
import RadioButtons from "../../../atoms/RadioButtons/RadioButtons";
import L2Header from "./L2Header";
import L1Header from "./L1Header";
import FastWithdrawTooltip from "./FastWithdrawTooltip";
import { formatPrice } from "lib/utils";
import {MAX_ALLOWANCE} from 'lib/api/constants';

const defaultTransfer = {
  type: "deposit",
};

const Bridge = () => {
  const user = useSelector(userSelector);
  const balanceData = useSelector(balancesSelector);
  const [loading, setLoading] = useState(false);
  const [isApproving, setApproving] = useState(false);
  const [formErr, setFormErr] = useState('')
  const [L2Fee, setL2Fee] = useState(null)
  const [L2FeeToken, setL2FeeToken] = useState(null)
  const [L1Fee, setL1Fee] = useState(null)
  const network = useSelector(networkSelector);
  const [transfer, setTransfer] = useState(defaultTransfer);
  const [swapDetails, _setSwapDetails] = useState(() => ({amount: '', currency: 'ETH'}));
  const [swapCurrencyInfo, setSwapCurrencyInfo] = useState({decimals: 0});
  const [allowance, setAllowance] = useState(ethersConstants.Zero);
  const [hasAllowance, setHasAllowance] = useState(false);
  const coinEstimator = useCoinEstimator()
  const currencyValue = coinEstimator(swapDetails.currency)
  const activationFee = parseFloat((user.address && !user.id ? (15 / currencyValue) : 0).toFixed(5))
  const estimatedValue = (+swapDetails.amount * coinEstimator(swapDetails.currency) || 0)
  const [fastWithdrawCurrencyMaxes, setFastWithdrawCurrencyMaxes] = useState({})

  let walletBalances = balanceData.wallet || {}
  let zkBalances = balanceData[network] || {}

  const [withdrawSpeed, setWithdrawSpeed] = useState("fast")
  const isFastWithdraw = (
    withdrawSpeed === "fast"
    && transfer.type === "withdraw"
    && api.apiProvider.eligibleFastWithdrawTokens.includes(swapDetails.currency))

  const balances = transfer.type === 'deposit' ? walletBalances : zkBalances
  const altBalances = transfer.type === 'deposit' ? zkBalances : walletBalances
  const hasError = formErr && formErr.length > 0
  const isSwapAmountEmpty = swapDetails.amount === ""

  useEffect(() => {
    if (swapDetails.currency === "ETH") {
      setAllowance(MAX_ALLOWANCE);
      setHasAllowance(true);
      return;
    }
    if (isEmpty(balances) || !swapDetails.currency) {
      return;
    }
    const swapCurrencyInfo = api.getCurrencyInfo(swapDetails.currency);
    setSwapCurrencyInfo(swapCurrencyInfo);

    const swapAmountBN = ethersUtils.parseUnits(
      isSwapAmountEmpty ? '0.0' : swapDetails.amount,
      swapCurrencyInfo.decimals
    );
    const allowanceBN = balances[swapDetails.currency]?.allowance ?? ethersConstants.Zero;      
    setAllowance(allowanceBN);
    setHasAllowance(allowanceBN.gte(swapAmountBN));
  }, [balances, swapDetails, isSwapAmountEmpty]);

  useEffect(() => {
    if (user.address) {
      api.getL2FastWithdrawLiquidity().then((maxes) => {
        setFastWithdrawCurrencyMaxes(maxes);
      });
    }
  }, [user.address]);

  useEffect(() => {
    setSwapDetails({});
    if (withdrawSpeed === "normal") {
      setL1Fee(null)
    }
  }, [withdrawSpeed]);

  useEffect(() => {
    if (
      !api.apiProvider.eligibleFastWithdrawTokens.includes(swapDetails.currency)
    ) {
      setWithdrawSpeed("normal");
    } else {
      setWithdrawSpeed("fast");
    }
  }, [swapDetails.currency]);

  useEffect(() => {
    // since setSwapDetails uses state, instead of recalculating
    // swap details in switchTransferType we recalculate as an effect here.
    setSwapDetails({})
  }, [transfer.type])

  const validateInput = (inputValue, swapCurrency) => {
    const swapCurrencyInfo = api.getCurrencyInfo(swapCurrency);
    const bals = transfer.type === 'deposit' ? walletBalances : zkBalances
    const getCurrencyBalance = (cur) => (bals[cur] && bals[cur].value / (10**swapCurrencyInfo.decimals));
    const detailBalance = getCurrencyBalance(swapCurrency)
    let error = null

    if (inputValue > 0) {
      if (inputValue <= activationFee) {
        error = `Must be more than ${activationFee} ${swapCurrency}`
      } else if (inputValue < L2Fee) {
        error = "Amount too small"
      } else if (inputValue >= detailBalance) {
        error = "Insufficient balance"
      } else if (isFastWithdraw) {
        if (inputValue < L1Fee) {
          error = "Amount too small"
        }

        if (swapDetails.currency in fastWithdrawCurrencyMaxes) {
          const maxAmount = fastWithdrawCurrencyMaxes[swapCurrency]
          if (inputValue > maxAmount) {
            error = `Max ${swapCurrency} liquidity for fast withdraw: ${maxAmount.toPrecision(4)}`
          } else if (inputValue < (L2Fee + L1Fee)) {
            error = "Amount too small"
          }
        }
      } else if (L2FeeToken === swapCurrency) {
        if ((inputValue + L2Fee) > detailBalance) {
          error = "Insufficient balance for fees"
        }
      } else {
        const feeCurrencyBalance = getCurrencyBalance(L2FeeToken)
        if (feeCurrencyBalance < L1Fee) {
          error = "Insufficient balance for fees"
        }
      }
    }

    if (error) {
      setFormErr(error)
      return false
    }
    return true
  }

  const validateFees = (inputValue, bridgeFee, feeToken) => {
    const bals = transfer.type === 'deposit' ? walletBalances : zkBalances
    const feeTokenBalance = parseFloat(bals[feeToken] && bals[feeToken].valueReadable) || 0

    if (
      inputValue > 0 &&
      bridgeFee > feeTokenBalance
    ) {
      setFormErr("Not enough balance to pay for fees")
      return false
    }
    return true
  }

  const setFastWithdrawFees = (setFee, details) => {
    await api.withdrawL2FastGasFee(details.currency)
      .then(({amount, feeToken}) => {
        setFee(amount, feeToken)
      })
      .catch(e => {
        console.error(e)
        setL2FeeToken(null)
        setFee(null)
      })

      await api.withdrawL2FastBridgeFee(details.currency)
      .then(res => setL1Fee(res))
      .catch(e => {
          console.error(e)
          setL1Fee(null)
      })
  }

  const setNormalWithdrawFees = (setFee, details) => {
    await api.withdrawL2GasFee(details.currency)
      .then(({amount, feeToken}) => {
        setFee(amount, feeToken)
      })
      .catch(err => {
        console.log(err)
        setL2FeeToken(null)
        setFee(null)
      })
  }

  const setDepositFee = (setFee, details) => {
      await api.depositL2Fee(details.currency).then(res => {
        setFee(null, null)
        setL1Fee(res.amount)
      })
  }

  const setSwapDetails = values => {
    const details = {
      ...swapDetails,
      ...values,
    };

    _setSwapDetails(details);

    const setFee = (bridgeFee, feeToken) => {
      setL2Fee(bridgeFee)
      setL2FeeToken(feeToken)
      const input = parseFloat(details.amount) || 0
      const isInputValid = validateInput(input, details.currency)
      const isFeesValid = validateFees(input, bridgeFee, feeToken)
      if (isFeesValid && isInputValid) {
        setFormErr("")
      }
    };

    setFee(null)
    setL1Fee(null)

    if (transfer.type === "withdraw") {
      if (api.apiProvider.syncWallet) {
        if (isFastWithdraw) {
          setFastWithdrawFees(setFee, details)
        } else {
          setNormalWithdrawFees(setFee, details)
        }
      }
    } else {
      setDepositFee(setFee, details)
    }
  };

  const switchTransferType = e => {
    e.preventDefault()
    const type = transfer.type === "deposit" ? "withdraw" : "deposit"
    setTransfer({type})
  }

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
      if (isFastWithdraw) {
        deferredXfer = api.withdrawL2Fast(
          `${swapDetails.amount}`,
          swapDetails.currency
        );
      } else {
        deferredXfer = api.withdrawL2Normal(`${swapDetails.amount}`, swapDetails.currency)
      }
    }

    deferredXfer
      .then(() => {
        setTimeout(() => api.getAccountState(), 1000)
      })
      .catch(e => {
        console.error("error sending transaction::", e)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <>
      <div className="bridge_box">
        <Pane size={"md"} variant={"light"}>
          <div className="bridge_coin_title">
            <h5>FROM</h5>
            {transfer.type === 'withdraw' ? <L2Header/> : <L1Header/>}
          </div>
          <BridgeSwapInput
            gasFee={L1Fee}
            bridgeFee={L2Fee}
            balances={balances}
            value={swapDetails}
            onChange={setSwapDetails}
            feeCurrency={L2FeeToken}
          />
          <div className="bridge_coin_stats">
            <div className="bridge_coin_stat">
              <h5>Estimated value</h5>
              <span>~${formatUSD(estimatedValue)}</span>
            </div>
            {(
              swapDetails.currency !== "ETH" &&
              (swapDetails.amount * 10 ** swapCurrencyInfo.decimals) > allowance
            ) ? (
              <div className="bridge_coin_stat">
                <h5>Available allowance</h5>
                <span>
                    {ethersUtils.formatUnits(allowance, swapCurrencyInfo.decimals)}
                  {` ${swapDetails.currency}`}
                  </span>
              </div>
            ): null}
            <div className="bridge_coin_stat">
              <h5>Available balance</h5>
              <span>
                  {balances[swapDetails.currency] && balances[swapDetails.currency].valueReadable}
                {` ${swapDetails.currency}`}
                </span>
            </div>
          </div>
        </Pane>

        <Pane size={"md"} borderRadius={"0 0 3xl 3xl"}>
          <div className="bridge_box_swap_wrapper">
            <SwapButton onClick={switchTransferType}/>
            <h5>Switch</h5>
          </div>

          <div className="bridge_coin_stats">
            <div className="bridge_coin_stat">
              <div className="bridge_coin_details">
                <div className="bridge_coin_title">
                  <h5>TO</h5>
                  {transfer.type !== 'withdraw' ? <L2Header/> : <L1Header/>}
                </div>
              </div>
            </div>
            <div className="bridge_coin_stat">
              <h5>Available balance</h5>
              <span>
                  {altBalances[swapDetails.currency] && altBalances[swapDetails.currency].valueReadable}
                {` ${swapDetails.currency}`}
                </span>
            </div>
          </div>
          <x.div flexDirection={"column"} display={"flex"} alignItems={"flex-end"}>
            {transfer.type === "withdraw" && <>
              <RadioButtons
                horizontal
                value={withdrawSpeed}
                onChange={setWithdrawSpeed}
                name={"withdrawSpeed"}
                items={[
                  {
                    id: "fast",
                    name: "Fast",
                    disabled: !api.apiProvider.eligibleFastWithdrawTokens.includes(swapDetails.currency)
                  },
                  {id: "normal", name: "Normal"}]}
              />
              <x.div display={"flex"} mt={2}>
                <x.div fontSize={12} color={"blue-gray-500"}>Withdraw speed</x.div>
                <FastWithdrawTooltip/>
              </x.div>
            </>}
          </x.div>
          {transfer.type === 'deposit' && user.address && !user.id && <div className="bridge_transfer_fee">
            One-Time Activation Fee: {activationFee} {swapDetails.currency} (~$15.00)
          </div>}
          {user.address && user.id && !isSwapAmountEmpty && <div className="bridge_transfer_fee">
            {transfer.type === "withdraw" && <x.div>
              {L2Fee && <>L2 gas fee: {L2Fee} {L2FeeToken}</>}
              {!L2Fee && <div style={{display: 'inline-flex', margin: '0 5px'}}>
                <Loader
                  type="TailSpin"
                  color="#444"
                  height={16}
                  width={16}
                />
              </div>}

              {transfer.type === "withdraw" && <x.div>
                {isFastWithdraw && L1Fee && <div>
                  Bridge Fee: {L1Fee.toPrecision(4)} {swapDetails.currency}
                </div>}
                <x.div color={"blue-gray-300"}>
                  You'll receive: ~{                  
                    formatPrice(swapDetails.amount
                      - (L1Fee ? Number(L1Fee) : 0)
                      - (L2Fee ? Number(L2Fee) : 0)
                    )
                  }
                  {" " + swapDetails.currency} on L1
                </x.div>
              </x.div>}
            </x.div>}
          </div>}

          {!user.address && <div className="bridge_transfer_fee">
            🔗 &nbsp;Please connect your wallet
          </div>}

          <div className="bridge_button">
            {!user.address && <ConnectWalletButton/>}

            {user.address && <>
              {balances[swapDetails.currency] && !hasAllowance && <Button
                loading={isApproving}
                className={cx("bg_btn", {
                  zig_disabled: 
                    formErr.length > 0 ||
                    Number(swapDetails.amount) === 0 ||
                    swapDetails.currency === "ETH"
                  })}
                text="APPROVE"
                style={{marginBottom: 10}}
                onClick={approveSpend}
              />}

              {hasError && <Button
                className="bg_btn zig_btn_disabled bg_err"
                text={formErr}
                icon={<BiError/>}
              />}

              {!hasError && <Button
                loading={loading}
                className={cx("bg_btn", {
                  zig_disabled: 
                    (L2Fee === null && L1Fee === null) ||
                    !hasAllowance ||
                    Number(swapDetails.amount) === 0
                  })}
                text="TRANSFER"
                icon={<MdSwapCalls/>}
                onClick={doTransfer}
              />}
            </>}
          </div>
        </Pane>
      </div>
      {user.address ? (
        <div className="bridge_connected_as">
          <span className="bridge_bubble_connected"/>
          {' '}Connected as {`${user.address.substr(0, 6)}...${user.address.substr(-5)}`}
          <span onClick={() => api.signOut().catch(err => console.log(err))} className="bridge_disconnect">
            {' • '}<a href="#disconnect">Disconnect</a>
          </span>
        </div>
      ) : (
        <div className="bridge_connected_as">
          <span className="bridge_bubble_disconnected"/>
          Disconnected
        </div>
      )}
    </>
  );
};

export default Bridge
