import React, {useEffect, useMemo, useState} from 'react'
import {useSelector} from "react-redux";
import {SwapButton, Button, useCoinEstimator} from 'components'
import {
  networkSelector,
  balancesSelector,
} from "lib/store/features/api/apiSlice"
import Loader from "react-loader-spinner"
import {userSelector} from "lib/store/features/auth/authSlice";
import api from 'lib/api';
import {MAX_ALLOWANCE} from 'lib/api/constants';
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

const defaultTransfer = {
  type: 'deposit',
}

const Bridge = () => {
  const user = useSelector(userSelector);
  const balanceData = useSelector(balancesSelector);
  const [loading, setLoading] = useState(false);
  const [isApproving, setApproving] = useState(false);
  const [formErr, setFormErr] = useState('')
  const [bridgeFee, setBridgeFee] = useState(null)
  const [bridgeFeeToken, setBridgeFeeToken] = useState(null)
  const [zigZagFee, setZigZagFee] = useState(null)
  const network = useSelector(networkSelector);
  const [transfer, setTransfer] = useState(defaultTransfer);
  const [swapDetails, _setSwapDetails] = useState(() => ({amount: '', currency: 'ETH'}));
  const coinEstimator = useCoinEstimator()
  const currencyValue = coinEstimator(swapDetails.currency)
  const activationFee = parseFloat((user.address && !user.id ? (15 / currencyValue) : 0).toFixed(5))
  const estimatedValue = (+swapDetails.amount * coinEstimator(swapDetails.currency) || 0)
  const [fastWithdrawCurrencyMaxes, setFastWithdrawCurrencyMaxes] = useState()

  let walletBalances = balanceData.wallet || {}
  let zkBalances = balanceData[network] || {}

  const [withdrawSpeed, setWithdrawSpeed] = useState("fast")
  const isFastWithdraw = (
    withdrawSpeed === "fast"
    && transfer.type === "withdraw"
    && api.apiProvider.eligibleFastWithdrawTokens.includes(swapDetails.currency))

  const balances = transfer.type === 'deposit' ? walletBalances : zkBalances
  const altBalances = transfer.type === 'deposit' ? zkBalances : walletBalances
  const hasAllowance = balances[swapDetails.currency] && balances[swapDetails.currency].allowance.gte(MAX_ALLOWANCE.div(3))
  const hasError = formErr && formErr.length > 0
  const isSwapAmountEmpty = swapDetails.amount === ""

  useEffect(() => {
    if (user.address) {
      api.getL2FastWithdrawLiquidity().then(maxes => {
        setFastWithdrawCurrencyMaxes(maxes)
      })
    }
  }, [user.address])

  useEffect(() => {
    setSwapDetails({})
    if (withdrawSpeed === "normal") {
      setZigZagFee(null)
    }
  }, [withdrawSpeed])

  useEffect(() => {
    if (!api.apiProvider.eligibleFastWithdrawTokens.includes(swapDetails.currency)) {
      setWithdrawSpeed("normal")
    } else {
      setWithdrawSpeed("fast")
    }
  }, [swapDetails.currency])

  useEffect(() => {
    // since setSwapDetails uses state, instead of recalculating
    // swap details in switchTransferType we recalculate as an effect here.
    setSwapDetails({})
    console.log("debug:: effect called")
  }, [transfer.type])

  const validateInput = (inputValue, swapCurrency) => {
    // TODO: any more validation here?

    const bals = transfer.type === 'deposit' ? walletBalances : zkBalances
    const detailBalance = parseFloat(bals[swapCurrency] && bals[swapCurrency].valueReadable) || 0

    if (inputValue > 0) {
      if (inputValue < 0.001) {
        setFormErr('Must be at least 0.001')
        return false
      } else if (inputValue <= activationFee) {
        setFormErr(`Must be more than ${activationFee} ${swapDetails.currency}`)
        return false
      } else if (inputValue > (detailBalance - parseFloat(bridgeFee))) {
        setFormErr('Insufficient balance')
        return false
      } else if (inputValue - bridgeFee < 0) {
        setFormErr("Amount too small")
        return false
      } else if (isFastWithdraw) {
        if (swapDetails.currency in fastWithdrawCurrencyMaxes) {
          const maxAmount = fastWithdrawCurrencyMaxes[swapDetails.currency]
          if (inputValue > maxAmount) {
            setFormErr(`Max ${swapDetails.currency} liquidity for fast withdraw: ${maxAmount.toPrecision(4)}`)
            return false
          } else if (inputValue - (bridgeFee + zigZagFee) < 0) {
            setFormErr("Amount too small")
            return false
          }
        }
      }
    }
    return true
  }

  const validateFees = (bridgeFee, feeToken) => {
    const bals = transfer.type === 'deposit' ? walletBalances : zkBalances
    const feeTokenBalance = parseFloat(bals[feeToken] && bals[feeToken].valueReadable) || 0

    console.log("debug:: feeToken - bridgeFee", feeToken, bridgeFee, feeTokenBalance)

    if (bridgeFee > feeTokenBalance) {
      setFormErr("Not enough balance to pay for fees")
      return false
    }
    return true
  }

  const setFastWithdrawFees = (setFee, details) => {
    api.withdrawL2FeeFast(details.currency)
      .then(({amount, feeToken}) => {
        setFee(amount, feeToken)
      })
      .catch(e => {
        console.error(e)
        setBridgeFeeToken(null)
        setFee(null)
      })

    api.withdrawL2ZZFeeFast(details.currency)
      .then(res => setZigZagFee(res))
      .catch(e => {
          console.error(e)
          setZigZagFee(null)
      })
  }

  const setNormalWithdrawFees = (setFee, details) => {
    api.withdrawL2Fee(details.currency)
      .then(({feeToken, amount}) => {
        setFee(amount, feeToken)
      })
      .catch(err => {
        console.log(err)
        setBridgeFeeToken(null)
        setFee(null)
      })
  }

  const setDepositFee = (setFee, details) => {
      api.depositL2Fee(details.currency).then(res => {
        setFee(res)
        setZigZagFee(null)
      })
  }

  const setSwapDetails = values => {
    const details = {
      ...swapDetails,
      ...values,
    };

    _setSwapDetails(details);

    const setFee = (bridgeFee, feeToken) => {
      setBridgeFee(bridgeFee)
      setBridgeFeeToken(feeToken)
      const input = parseFloat(details.amount) || 0
      const isInputValid = validateInput(input, details.currency, feeToken)
      const isFeesValid = validateFees(bridgeFee, feeToken)
      if (isFeesValid && isInputValid) {
        setFormErr("")
      }
    }

    // TODO: does this need to be there
    setFee(null)
    setZigZagFee(null)

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
  }

  const switchTransferType = e => {
    e.preventDefault()
    const type = transfer.type === "deposit" ? "withdraw" : "deposit"
    setTransfer({type})
  }

  const disconnect = () => {
    api.signOut()
      .catch(err => console.log(err))
  }

  const approveSpend = (e) => {
    if (e) e.preventDefault()
    setApproving(true)
    api.approveSpendOfCurrency(swapDetails.currency)
      .then(() => {
        setApproving(false)
      })
      .catch(err => {
        console.log(err)
        setApproving(false)
      })
  }

  const doTransfer = e => {
    e.preventDefault()
    let deferredXfer

    setLoading(true)

    if (transfer.type === 'deposit') {
      deferredXfer = api.depositL2(`${swapDetails.amount}`, swapDetails.currency)
    } else {
      if (isFastWithdraw) {
        deferredXfer = api.withdrawL2Fast(`${swapDetails.amount}`, swapDetails.currency)
      } else {
        deferredXfer = api.withdrawL2(`${swapDetails.amount}`, swapDetails.currency)
      }
    }

    deferredXfer
      .then(() => {
        setTimeout(() => api.getAccountState(), 1000)
      })
      .catch(e => {
        console.error(e.message)
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
            bridgeFee={bridgeFee}
            balances={balances}
            value={swapDetails}
            onChange={setSwapDetails}
          />
          <div className="bridge_coin_stats">
            <div className="bridge_coin_stat">
              <h5>Estimated value</h5>
              <span>~${formatUSD(estimatedValue)}</span>
            </div>
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
            {bridgeFeeToken && <x.div fontSize={16} color={"white"}>{bridgeFeeToken}</x.div>}
            {transfer.type === "withdraw" && <x.div>
              {bridgeFee && <>L2 gas fee: {bridgeFee} {bridgeFeeToken}</>}
              {!bridgeFee && <div style={{display: 'inline-flex', margin: '0 5px'}}>
                <Loader
                  type="TailSpin"
                  color="#444"
                  height={16}
                  width={16}
                />
              </div>}
              {isFastWithdraw && zigZagFee && <x.div>
                <div>
                  Bridge Fee: {zigZagFee.toPrecision(4)} {swapDetails.currency}
                </div>
                <x.div color={"blue-gray-300"}>
                  You'll receive: ~{Number(swapDetails.amount - zigZagFee).toPrecision(4)} {swapDetails.currency} on L1
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
                className={cx("bg_btn", {zig_disabled: formErr.length > 0 || swapDetails.amount.length === 0,})}
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
                className={cx("bg_btn", {zig_disabled: bridgeFee === null || !hasAllowance || swapDetails.amount.length === 0})}
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
          <span onClick={disconnect} className="bridge_disconnect">{' • '}<a href="#disconnect">Disconnect</a></span>
        </div>
      ) : (
        <div className="bridge_connected_as">
          <span className="bridge_bubble_disconnected"/>
          Disconnected
        </div>
      )}
    </>

  )
}

export default Bridge
