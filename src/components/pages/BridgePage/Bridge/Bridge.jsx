import React, {useEffect, useMemo, useState} from 'react'
import { useSelector } from "react-redux";
import { SwapButton, Button, useCoinEstimator } from 'components'
import {
  networkSelector,
  balancesSelector,
} from "lib/store/features/api/apiSlice"
import Loader from "react-loader-spinner"
import { userSelector } from "lib/store/features/auth/authSlice";
import ethLogo from "assets/images/currency/ETH.svg"
import api from 'lib/api';
import { MAX_ALLOWANCE } from 'lib/api/constants';
import { formatUSD } from 'lib/utils';
import cx from 'classnames';
import { BiError } from 'react-icons/bi';
import { MdSwapCalls } from 'react-icons/md';
import logo from 'assets/images/logo.png'
import BridgeSwapInput from '../BridgeSwapInput/BridgeSwapInput';
import ConnectWalletButton from "../../../atoms/ConnectWalletButton/ConnectWalletButton";
import Pane from "../../../atoms/Pane/Pane";
import {x} from "@xstyled/styled-components"
import Toggle from "../../../atoms/Toggle/Toggle";
import {AiOutlineQuestionCircle} from "react-icons/all";
import Tooltip from "../../../atoms/Tooltip/Tooltip";
import ExternalLink from "../../ListPairPage/ExternalLink";
import {HiExternalLink} from "react-icons/hi";

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
  const network = useSelector(networkSelector);
  const [transfer, setTransfer] = useState(defaultTransfer);
  const [swapDetails, _setSwapDetails] = useState(() => ({ amount: '', currency: 'ETH' }));
  const currencies = useMemo(() => null, [transfer.type])
  const coinEstimator = useCoinEstimator()
  const currencyValue = coinEstimator(swapDetails.currency)
  const activationFee = parseFloat((user.address && !user.id ? (15 / currencyValue) : 0).toFixed(5))
  const estimatedValue = (+swapDetails.amount * coinEstimator(swapDetails.currency) || 0)

  let walletBalances = balanceData.wallet || {}
  let zkBalances = balanceData[network] || {}


  const fastWithdrawTokens = [
    "ETH",
    "FRAX"
  ]
  const [isFastWithdraw, setIsFastWithdraw] = useState(false)
  const showFastSwapOption = transfer.type === "withdraw"
    && swapDetails.currency
    && fastWithdrawTokens.includes(swapDetails.currency)
    && api.isZksyncChain()

  useEffect(() => {
    if (user.address) {
      api.getFastWithdrawAccountBalances().then(res => console.log("debug:: res", res))
    }
  }, [user.address])

  const setSwapDetails = values => {
    const details = {
      ...swapDetails,
      ...values,
    };

    _setSwapDetails(details);

    const setFee = bridgeFee => {
      setBridgeFee(bridgeFee)

      const bals = transfer.type === 'deposit' ? walletBalances : zkBalances
      const detailBalance = parseFloat(bals[details.currency] && bals[details.currency].valueReadable) || 0
      const input = parseFloat(details.amount) || 0
      if (input > 0) {
        if (input < 0.001) {
          setFormErr('Must be at least 0.001')
        } else if (input <= activationFee) {
          setFormErr(`Must be more than ${activationFee} ${swapDetails.currency}`)
        } else if (input > (detailBalance - parseFloat(bridgeFee))) {
          setFormErr('Insufficient balance')
        } else {
          setFormErr('')
        }
      } else {
        setFormErr('')
      }
    }

    if (api.apiProvider.syncWallet && transfer.type === 'withdraw') {
      setFee(null)
      api.withdrawL2Fee(details.currency)
        .then(fee => {
          if (isFastWithdraw) {
            // TODO: add l2 withdraw fee here
            console.log("debug:: hit here", fee)
            setFee(fee)
          } else {
            setFee(fee)
          }
        })
        .catch(err => {
          console.log(err)
          setFee(null)
        })  
    } else {
      setFee(0)
    }
  }

  const switchTransferType = e => {
    if (e) e.preventDefault()
    transfer.type = transfer.type === 'deposit' ? 'withdraw' : 'deposit'
    setTransfer(transfer)
    setSwapDetails({})
  }

  const disconnect = () => {
    api.signOut()
      .catch(err => console.log(err))
  }

  const ethLayer1Header = (
    <div className="bridge_coin_details">
      <div className="bridge_coin_image" style={{ background: '#fff' }}>
        <img
          alt="Ethereum logo"
          src={ethLogo}
        />
      </div>
      <div className="bridge_coin_name">Ethereum L1</div>
    </div>
  )

  const zkSyncLayer2Header = (
    <div className="bridge_coin_details">
      <div className="bridge_coin_image">
        <img alt="Logo" src={logo} />
      </div>
      <div className="bridge_coin_name">zkSync L2</div>
    </div>
  )

  const balances = transfer.type === 'deposit' ? walletBalances : zkBalances
  const altBalances = transfer.type === 'deposit' ? zkBalances : walletBalances
  const hasAllowance = balances[swapDetails.currency] && balances[swapDetails.currency].allowance.gte(MAX_ALLOWANCE.div(3))
  const hasError = formErr && formErr.length > 0

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
      deferredXfer = api.withdrawL2(`${swapDetails.amount}`, swapDetails.currency)
    }

    deferredXfer
      .then(state => {
        setTimeout(() => api.getAccountState(), 1000)
        setLoading(false)
      })
      .catch(e => {
        console.log(e.message)
        setLoading(false)
      })
  }

  return (
    <>
      <div className="bridge_box">
          <Pane size={"md"} variant={"light"}>
            <div className="bridge_coin_title">
              <h5>FROM</h5>
              {transfer.type === 'withdraw' ? zkSyncLayer2Header : ethLayer1Header}
            </div>
            <BridgeSwapInput
              bridgeFee={bridgeFee}
              balances={balances}
              currencies={currencies}
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
              <SwapButton onClick={switchTransferType} />
              <h5>Switch</h5>
            </div>

            <div className="bridge_coin_stats">
              <div className="bridge_coin_stat">
                <div className="bridge_coin_details">
                  <div className="bridge_coin_title">
                    <h5>TO</h5>
                    {transfer.type !== 'withdraw' ? zkSyncLayer2Header : ethLayer1Header}
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
            {showFastSwapOption && <x.div flexDirection={"column"} display={"flex"} alignItems={"flex-end"}>
                <Toggle value={isFastWithdraw} onClick={setIsFastWithdraw}/>
                <x.div display={"flex"} alignItems={"center"} mt={1}>
                  <x.div fontSize={12}>Fast Withdraw?</x.div>
                  <FastWithdrawTooltip/>
                </x.div>
              </x.div>}
            {transfer.type === 'deposit' && user.address && !user.id && <div className="bridge_transfer_fee">
              One-Time Activation Fee: {activationFee} {swapDetails.currency} (~$15.00)
            </div>}
            {user.address ? (
              user.id && <div className="bridge_transfer_fee">
                Bridge Fee: {typeof bridgeFee !== 'number' ? (
                  <div style={{ display: 'inline-flex', margin: '0 5px' }}>
                      <Loader
                      type="TailSpin"
                      color="#444"
                      height={16}
                      width={16}
                    />
                  </div>
                ) : bridgeFee} {swapDetails.currency}
              </div>
            ) : (
              <div className="bridge_transfer_fee">
                🔗 &nbsp;Please connect your wallet
              </div>
            )}
            <div className="bridge_button">
              {!user.address && <ConnectWalletButton/>}
              {user.address && balances[swapDetails.currency] && !hasAllowance && <Button
                loading={isApproving}
                className={cx("bg_btn", { zig_disabled: formErr.length > 0 || swapDetails.amount.length === 0, })}
                text="APPROVE"
                style={{ marginBottom: 10 }}
                onClick={approveSpend}
              />}
              {user.address && hasError && <Button
                className="bg_btn zig_btn_disabled bg_err"
                text={formErr}
                icon={<BiError />}
              />}
              {user.address && !hasError && <Button
                loading={loading}
                className={cx("bg_btn", { zig_disabled: bridgeFee === null || !hasAllowance || swapDetails.amount.length === 0 })}
                text="TRANSFER"
                icon={<MdSwapCalls />}
                onClick={doTransfer}
              />}
            </div>
          </Pane>
      </div>
      {user.address ? (
        <div className="bridge_connected_as">
          <span className="bridge_bubble_connected" />
          {' '}Connected as {`${user.address.substr(0, 6)}...${user.address.substr(-5)}`}
          <span onClick={disconnect} className="bridge_disconnect">{' • '}<a href="#disconnect">Disconnect</a></span>
        </div>
      ) : (
        <div className="bridge_connected_as">
          <span className="bridge_bubble_disconnected" />
          Disconnected
        </div>
      )}
    </>

  )
}

const FastWithdrawTooltip = () => {
  const renderLabel = () => {
    return <x.div>
      <x.div>Utilize our fast withdrawal bridge to instantly withdraw ETH and FRAX</x.div>
      <x.div><ExternalLink href={"https://docs.zigzag.exchange/zksync/fast-withdraw-bridge"}>
        Learn more <HiExternalLink />
      </ExternalLink></x.div>
    </x.div>
  }

  return <>
    <Tooltip placement={"right"} label={renderLabel()}>
      <x.div display={"inline-flex"} color={"blue-gray-600"} ml={2} alignItems={"center"}>
        <AiOutlineQuestionCircle size={14}/>
      </x.div>
    </Tooltip>
  </>
}

export default Bridge
