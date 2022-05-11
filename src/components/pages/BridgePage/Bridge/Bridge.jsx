import React, { useEffect, useState, useMemo } from "react";
import {
  constants as ethersConstants,
  utils as ethersUtils
} from 'ethers';
import { useSelector } from "react-redux";
import isEmpty from "lodash/isEmpty";
import { SwapButton, useCoinEstimator } from "components";
import {
  networkSelector,
  balancesSelector,
} from "lib/store/features/api/apiSlice";
import { userSelector } from "lib/store/features/auth/authSlice";
import { Box } from "@material-ui/core";
import { toast } from "react-toastify";
import styled from "styled-components";

import api from "lib/api";
import { MAX_ALLOWANCE } from "lib/api/constants";
import { formatUSD } from "lib/utils";
import {
  NETWORKS,
  ZKSYNC_ETHEREUM_FAST_BRIDGE,
  ZKSYNC_POLYGON_BRIDGE
} from "./constants"

// import custom components
import { Button } from "../../../atoms/Button";
import BridgeSwapInput from "../BridgeSwapInput/BridgeSwapInput";
import L2Header from "./L2Header";
import L1Header from "./L1Header";
import { BridgeInputBox } from '../BridgeSwapInput/BridgeSwapInput';

const defaultTransfer = {
  type: "deposit",
};

const BridgeBox = styled.div`
  padding: 2rem;
  border: 1px solid ${({ theme }) => theme.colors.foreground400};
  border-radius: 1rem;

  .layer {
    display: flex;
    justify-content: space-between;

    &:not(:last-child) {
      margin-bottom: 12px;
    }

    &.layer-end {
      justify-content: flex-end;
      
      p {
        color: rgba(255, 255, 255, 0.72);
      }
    }
  }

  .bridge_coin_image {
    width: 26px;
    height: 26px;
    text-align: center;
    overflow: hidden;
    border-radius: 50%;
  }

  .bridge_coin_name {
    font-size: 16px;
    font-weight: 600;
    color: #fff;

    span {
      font-size: 12px;
    }
  }

  .font-thin {
    font-weight: 400;
  }

  .maxLink {
    font-size: 10px;
  }

  h3 {
    color: #fff;
    font-size: 14px;
    font-weight: 600;
  }

  h4 {
    color: #fff;
    font-size: 12px;
  }

  p {
    font-size: 10px;
    font-weight: 400;
    color: #fff;
  }
`;

const CustomSwapButton = styled(SwapButton)`
  width: 34px;
  height: 34px;
`

const Bridge = () => {
  const user = useSelector(userSelector);
  const balanceData = useSelector(balancesSelector);
  const [loading, setLoading] = useState(false);
  const [isApproving, setApproving] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [L2Fee, setL2Fee] = useState(null);
  const [L2FeeToken, setL2FeeToken] = useState(null);
  const [L1Fee, setL1Fee] = useState(null);
  const network = useSelector(networkSelector);
  const [transfer, setTransfer] = useState(defaultTransfer);
  const [swapCurrencyInfo, setSwapCurrencyInfo] = useState({ decimals: 0 });
  const [allowance, setAllowance] = useState(ethersConstants.Zero);
  const [hasAllowance, setHasAllowance] = useState(false);
  const [fromNetwork, setFromNetwork] = useState(NETWORKS[0])
  const [toNetwork, setToNetwork] = useState(fromNetwork.to[0])
  const [balances, setBalances] = useState([]);
  const [altBalances, setAltBalances] = useState([]);
  const [polygonLoding, setPolygonLoading] = useState(false)
  const [swapDetails, _setSwapDetails] = useState(() => ({
    amount: "",
    currency: "ETH",
  }));
  const [hasError, setHasError] = useState(false);
  const [activationFee, setActivationFee] = useState(0);
  const [usdFee, setUsdFee] = useState(0);

  const coinEstimator = useCoinEstimator();
  const currencyValue = coinEstimator(swapDetails.currency);

  const estimatedValue =
    +swapDetails.amount * coinEstimator(swapDetails.currency) || 0;
  const [fastWithdrawCurrencyMaxes, setFastWithdrawCurrencyMaxes] = useState(
    {}
  );

  const walletBalances = useMemo(() => (balanceData.wallet) ? balanceData.wallet : {}, [balanceData.wallet])
  const zkBalances = useMemo(() => (balanceData[network]) ? balanceData[network] : {}, [balanceData, network])
  const polygonBalances = useMemo(() => (balanceData.polygon) ? balanceData.polygon : {}, [balanceData.polygon])

  const _getBalances = (_network) => {
    let balances = [];
    if (_network === "polygon") {
      balances = polygonBalances;
    } else if (_network === "ethereum") {
      balances = walletBalances;
    } else if (_network === "zksync") {
      balances = zkBalances;
    } else {
      setFormErr("Bad Network");
    }
    return balances;

  }

  useEffect(async () => {
    if (!user.address) return;
    setBalances(_getBalances(fromNetwork.from.key));
    setAltBalances(_getBalances(toNetwork.key));
  }, [toNetwork, user.address, walletBalances, zkBalances, polygonBalances])

  const [withdrawSpeed, setWithdrawSpeed] = useState("fast");
  const isFastWithdraw =
    withdrawSpeed === "fast" &&
    transfer.type === "withdraw" &&
    api.apiProvider.eligibleFastWithdrawTokens.includes(swapDetails.currency);

  useEffect(() => {
    setHasError(formErr && formErr.length > 0);
  }, [formErr])

  const isSwapAmountEmpty = swapDetails.amount === "";

  useEffect(() => {
    setHasAllowance(
      balances[swapDetails.currency] &&
      balances[swapDetails.currency].allowance.gte(MAX_ALLOWANCE.div(3))
    );
  }, [toNetwork, swapDetails])

  useEffect(() => {
    if (fromNetwork.from.key === 'polygon') {
      api.getPolygonWethBalance()
      setSwapDetails({ amount: '', currency: 'WETH' })
    }
    else if (fromNetwork.from.key === 'ethereum' && swapDetails.currency === 'WETH') {
      api.getWalletBalances()
      setSwapDetails({ amount: '', currency: 'ETH' })
    }
    else if (fromNetwork.from.key === 'zksync' && swapDetails.currency === 'WETH') {
      setSwapDetails({ amount: '', currency: 'ETH' })
    }
    if (fromNetwork.from.key === 'zksync') {
      const type = transfer.type = "withdraw";
      setTransfer({ type });
    }
    else {
      api.getWalletBalances()
      const type = transfer.type = "deposit";
      setTransfer({ type });
    }
  }, [toNetwork, fromNetwork])

  useEffect(() => {
    let _swapCurrencyInfo = {}
    if (swapDetails.currency === 'WETH') {
      _swapCurrencyInfo = api.getCurrencyInfo('ETH');
    }
    else {
      _swapCurrencyInfo = api.getCurrencyInfo(swapDetails.currency);
    }

    setSwapCurrencyInfo(_swapCurrencyInfo)

    if (swapDetails.currency === "ETH") {
      setAllowance(MAX_ALLOWANCE);
      setHasAllowance(true);
      return;
    }
    if (isEmpty(balances) || !swapDetails.currency) {
      return;
    }


    const swapAmountBN = ethersUtils.parseUnits(
      isSwapAmountEmpty ? '0.0' : swapDetails.amount,
      _swapCurrencyInfo?.decimals
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
      setL1Fee(null);
    }
  }, [withdrawSpeed]);

  useEffect(async () => {
    if (
      !api.apiProvider.eligibleFastWithdrawTokens?.includes(swapDetails.currency)
    ) {
      setWithdrawSpeed("normal");
    } else {
      setWithdrawSpeed("fast");
    }

    // update changePubKeyFee fee if needed
    if (
      user.address &&
      !user.id &&
      api.apiProvider?.zksyncCompatible
    ) {
      const usdFee = await api.apiProvider.changePubKeyFee();
      setUsdFee(usdFee);
      setActivationFee((usdFee / currencyValue).toFixed(5));
    }
  }, [swapDetails.currency]);

  useEffect(() => {
    // since setSwapDetails uses state, instead of recalculating
    // swap details in switchTransferType we recalculate as an effect here.
    setSwapDetails({});
  }, [transfer.type]);

  const validateInput = (inputValue, swapCurrency) => {
    if (balances.length === 0) return false;
    const getCurrencyBalance = (cur) => (balances[cur] && swapCurrencyInfo?.decimals ? balances[cur].value / (10 ** (swapCurrencyInfo.decimals)) : 0);
    const detailBalance = getCurrencyBalance(swapCurrency);

    if ((swapDetails.amount.includes('0.0000') || (inputValue > 0 && inputValue < 0.0001)) && (fromNetwork.from.key === 'polygon' || toNetwork.key === 'polygon')) {
      setFormErr("Insufficient amount");
      return false;
    }

    let error = null;
    if (inputValue > 0) {
      if (inputValue <= activationFee) {
        error = `Must be more than ${activationFee} ${swapCurrency}`
      } else if (L2Fee !== null && inputValue < L2Fee) {
        error = "Amount too small";
      } else if (inputValue >= detailBalance) {
        error = "Insufficient balance";
      } else if (isFastWithdraw) {
        if (toNetwork.key !== 'polygon' && L1Fee !== null && inputValue < L1Fee) {
          error = "Amount too small";
        }

        if (swapDetails.currency in fastWithdrawCurrencyMaxes) {
          const maxAmount = fastWithdrawCurrencyMaxes[swapCurrency];
          if (inputValue > maxAmount) {
            error = `Max ${swapCurrency} liquidity for fast withdraw: ${maxAmount.toPrecision(
              4
            )}`;
          } else if (toNetwork.key !== 'polygon' && L1Fee !== null && L2Fee !== null && inputValue < (L2Fee + L1Fee)) {
            error = "Amount too small";
          }
        }
      } else if (L2FeeToken !== null && L2FeeToken === swapCurrency) {
        if (L2Fee !== null && (inputValue + L2Fee) > detailBalance) {
          error = "Insufficient balance for fees";
        }
      } else if (L2FeeToken !== null) {
        const feeCurrencyBalance = getCurrencyBalance(L2FeeToken);
        if (L1Fee != null && feeCurrencyBalance < L1Fee) {
          error = "Insufficient balance for fees";
        }
      }
      /*else if (L1Fee !== null  && inputValue < L1Fee) {
        error = "Amount too small";
      }*/
      else if (inputValue < 0.0001 && (fromNetwork.from.key === 'polygon' || toNetwork.key === 'polygon')) {
        error = "Insufficient amount";
      }
    }

    if (error) {
      setFormErr(error);
      return false;
    }
    return true;
  };

  const validateFees = (inputValue, bridgeFee, feeCurrency) => {
    const feeCurrencyInfo = api.getCurrencyInfo(feeCurrency);
    if (balances.length === 0) return false;
    const feeTokenBalance = parseFloat(balances[feeCurrency] && balances[feeCurrency].value / (10 ** feeCurrencyInfo.decimals))

    if (
      inputValue > 0 &&
      bridgeFee > feeTokenBalance
    ) {
      setFormErr("Not enough balance to pay for fees")
      return false;
    }
    return true;
  };

  const setFastWithdrawFees = (details) => {
    api
      .withdrawL2FastGasFee(details.currency)
      .then(({ amount, feeToken }) => {
        setFee(details, amount, feeToken);
      })
      .catch((e) => {
        console.error(e);
        setL2FeeToken(null);
        setFee(details, null, null);
      });

    api.withdrawL2FastBridgeFee(details.currency)
      .then((res) => {
        setL1Fee(res);
      })
      .catch((e) => {
        console.error(e);
        setL1Fee(null);
      });
  };

  const setNormalWithdrawFees = (details) => {
    api.withdrawL2GasFee(details.currency)
      .then(({ amount, feeToken }) => {
        setFee(details, amount, feeToken);
      })
      .catch((err) => {
        console.log(err);
        setL2FeeToken(null);
        setFee(details, null, null);
      });
  };

  const setFee = (details, bridgeFee, feeToken) => {
    setL2Fee(bridgeFee)
    setL2FeeToken(feeToken)
    const input = parseFloat(details.amount) || 0
    const isInputValid = validateInput(input, details.currency)
    const isFeesValid = validateFees(input, bridgeFee, feeToken)
    if (isFeesValid && isInputValid) {
      setFormErr("");
    }
  };

  const setSwapDetails = async (values) => {
    const details = {
      ...swapDetails,
      ...values,
    };

    _setSwapDetails(details);

    const input = parseFloat(details.amount) || 0
    if ((swapDetails.amount.includes('0.0000') || (input > 0 && input < 0.0001)) && (fromNetwork.from.key === 'polygon' || toNetwork.key === 'polygon')) {
      setFormErr("Insufficient amount");
    }

    setL1Fee(null);

    if (fromNetwork.from.key === 'polygon') {
      const gasFee = await api.getPolygonFee();
      if (gasFee) {
        setL1Fee(35000 * gasFee.fast.maxFee / 10 ** 9);
        setFee(details, 0, null)
      }
    }
    else if (transfer.type === "withdraw") {
      if (api.apiProvider.syncWallet) {
        if (isFastWithdraw) {
          setFastWithdrawFees(details);
        } else {
          setNormalWithdrawFees(details);
        }
      }
    } else {
      const gasFee = await api.depositL2Fee(details.currency);
      if (gasFee) {
        let fee = gasFee.maxFeePerGas
          .add(gasFee.maxPriorityFeePerGas)
          .mul(21000)
        setFee(details, null, null)
        setL1Fee(fee.toString() / 10 ** 18)
      }
    }
  };

  const switchTransferType = (e) => {
    const f = NETWORKS.find(i => i.from.key === toNetwork.key)
    setFromNetwork(f)
    setToNetwork(fromNetwork.from)
    let currency;
    switch (f.from.key) {
      case "polygon":
        currency = "WETH";
        break;
      default:
        currency = swapDetails.currency;
        break;
    }
    setSwapDetails({
      amount: "",
      currency
    })
  };

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

  const renderGuidContent = () => {
    return <div>
      <p style={{ fontSize: '14px', lineHeight: '24px' }}>1. Switch to Polygon network</p>
      <p style={{ fontSize: '14px', lineHeight: '24px' }}>2. Sign the transaction and wait for confirmation</p>
      <p style={{ fontSize: '14px', lineHeight: '24px' }}>3. Wait until "Switch Network" pops up</p>
      <p style={{ fontSize: '14px', lineHeight: '24px' }}>4. Switch back to Ethereum mainnet. Activating a new zkSync wallet costs ~$5. Enjoy trading on ZigZag!</p>
    </div>
  }

  const doTransfer = (e) => {
    e.preventDefault();
    let deferredXfer;
    setLoading(true);
    if (fromNetwork.from.key === "polygon" && toNetwork.key === "zksync") {
      setPolygonLoading(true)
      deferredXfer = api.transferPolygonWeth(`${swapDetails.amount}`, user.address)
      toast.info(
        renderGuidContent(),
        {
          closeOnClick: false,
          autoClose: 15000,
        },
      );
    } else if (fromNetwork.from.key === "zksync" && toNetwork.key === "polygon") {
      deferredXfer = api.transferToBridge(
        `${swapDetails.amount}`,
        swapDetails.currency,
        ZKSYNC_POLYGON_BRIDGE.address,
        user.address
      );
    } else if (fromNetwork.from.key === "ethereum" && toNetwork.key === "zksync") {
      deferredXfer = api.depositL2(
        `${swapDetails.amount}`,
        swapDetails.currency,
        user.address
      );
    } else if (fromNetwork.from.key === "zksync" && toNetwork.key === "ethereum") {
      if (isFastWithdraw) {
        deferredXfer = api.transferToBridge(
          `${swapDetails.amount}`,
          swapDetails.currency,
          ZKSYNC_ETHEREUM_FAST_BRIDGE.address,
          user.address
        );
      } else {
        deferredXfer = api.withdrawL2(
          `${swapDetails.amount}`,
          swapDetails.currency
        );
      }
    } else {
      setFormErr("Wrong from/to combination")
      return false;
    }


    deferredXfer
      .then(() => {
        setTimeout(() => api.getAccountState(), 1000);
      })
      .catch((e) => {
        console.error("error sending transaction::", e);
        setTimeout(() => api.getAccountState(), 1000);
      })
      .finally(() => {
        setPolygonLoading(false)
        setLoading(false);
      });
  };

  const onSelectFromNetwork = ({ key }) => {
    const f = NETWORKS.find((i) => i.from.key === key)
    setFromNetwork(f)
    setToNetwork(f.to[0])
    let currency;
    switch (key) {
      case "polygon":
        currency = "WETH";
        break;
      default:
        currency = "ETH";
        break;
    }
    setSwapDetails({
      amount: "",
      currency
    })

  };

  const onSelectToNetwork = ({ key }) => {
    const t = fromNetwork.to.find((i) => i.key === key)
    setToNetwork(t)
    let currency;
    switch (key) {
      case "polygon":
        currency = "WETH";
        break;
      default:
        currency = "ETH";
        break;
    }
    setSwapDetails({
      amount: "",
      currency
    })
  }

  const getToBalance = () => {
    let balance, unit;
    if (fromNetwork.from.key === "polygon") {
      balance = altBalances["ETH"] ? altBalances["ETH"].valueReadable : '0.00'
      unit = "ETH";
    }
    else if (toNetwork.key === "polygon") {
      balance = altBalances["WETH"] ? altBalances["WETH"].valueReadable : '0.00'
      unit = "WETH";
    }
    else {
      balance = altBalances[swapDetails.currency] ? altBalances[swapDetails.currency].valueReadable : '0.00'
      unit = swapDetails.currency;
    }

    return balance + " " + unit;
  }

  return (
    <>
      <BridgeBox className="mb-3">
        <Box className="layer">
          <Box component="h3">
            Transfer from
          </Box>

          <Box component="h3">
            Transfer to
          </Box>
        </Box>

        <Box className="layer">
          <L1Header networks={NETWORKS} onSelect={onSelectFromNetwork} selectedNetwork={fromNetwork} />

          <Box>
            <CustomSwapButton onClick={switchTransferType} />
          </Box>

          <L2Header networks={fromNetwork.to} selectedNetwork={toNetwork} onSelect={onSelectToNetwork} />
        </Box>
      </BridgeBox>

      <BridgeBox className="mb-3">
        <Box className="layer">
          <Box component="h3">
            Select an Asset
          </Box>

          <Box component="p">
            Available balance:&nbsp;
            {balances[swapDetails.currency] ?
              balances[swapDetails.currency].valueReadable : '0.00'}
            {` ${swapDetails.currency}`}
          </Box>
        </Box>

        <Box className="layer">
          <BridgeSwapInput
            gasFee={L1Fee}
            bridgeFee={L2Fee}
            balances={balances}
            value={swapDetails}
            onChange={setSwapDetails}
            feeCurrency={L2FeeToken}
            isOpenable={!(fromNetwork.from.key === "polygon" || (fromNetwork.from.key === "zksync" && toNetwork.key === "polygon"))}
          />
        </Box>

        <Box className="layer layer-end">
          <Box component="p">
            Estimated value:&nbsp;
            ~${formatUSD(estimatedValue)}
          </Box>
        </Box>
      </BridgeBox>

      <BridgeBox className="mb-3">
        <Box className="layer">
          <Box component="h3">
            Transaction Settings
          </Box>
        </Box>

        <Box className="layer mb-2">
          <Box component="h3" className="font-thin">
            Address
          </Box>

          <Box component="h3" className="font-thin">
            {user.address ? (
              <div className="bridge_connected_as">
                Connected Address
                <span className="bridge_bubble_connected" />
              </div>)
              : (
                <div className="bridge_connected_as">
                  Disconnected
                  <span className="bridge_bubble_disconnected" />
                </div>
              )}
          </Box>
        </Box>

        {user.address ?
          <Box>
            <BridgeInputBox><input placeholder={user.address} disabled={true} className="w-100"></input></BridgeInputBox>
          </Box>
          : ""
        }

        <Box className="layer">
          <Box component="h4">
            L2 gas fee:
          </Box>

          <Box component="h4">
            {L2Fee} Ether
          </Box>
        </Box>

        <Box className="layer">
          <Box component="h4">
            One-time Account Activation fee:&nbsp;
          </Box>

          <Box component="h4">
            {activationFee} {swapDetails.currency}{" "}
          </Box>
        </Box>
      </BridgeBox>

      <Button
        loading={false}
        className="bg_btn"
        text="APPROVE"
        style={{ borderRadius: "8px" }}
      />
    </>
  );
};

export default Bridge;
