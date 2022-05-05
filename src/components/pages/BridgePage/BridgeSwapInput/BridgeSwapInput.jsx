import React, { useCallback } from "react";
import styled from "@xstyled/styled-components";
import BridgeCurrencySelector from "../BridgeCurrencySelector/BridgeCurrencySelector";
import api from "lib/api";

const BridgeInputBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #fff;
  border-radius: 24px;
  border: none;
  position: relative;
  -webkit-appearance: none;
  appearance: none;
  width: 100%;

  input,
  input:focus {
    font-family: "Iceland", sans-serif;
    width: calc(100% - 148px);
    height: 70px;
    background: transparent;
    padding: 20px 20px 20px 7px;
    font-size: 28px;
    border: none;
    outline: none;
    text-align: right;
    -webkit-appearance: none;
    appearance: none;
  }

  .maxLink {
    position: absolute;
    color: #69f;
    top: -58px;
    right: 0;
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    user-select: none;

    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }
  }

  .currencySelector {
    width: 148px;
    margin-left: 15px;
  }
`;

const BridgeSwapInput = ({ value = {}, onChange, balances = {}, gasFee, bridgeFee, feeCurrency, isOpenable }) => {
  const setCurrency = useCallback(currency => {
    onChange({ currency, amount: '' })
  }, [onChange])
  const setAmount = useCallback(e => {
    if(e.target.value.length > 10) return;
    onChange({ amount: e.target.value.replace(/[^0-9.]/g,'') })
  }, [onChange])

  const setMax = () => {
    let max = 0;
    try {
      let currencyInfo = {};
      if(value.currency === 'WETH'){
        currencyInfo = api.getCurrencyInfo('ETH');
      }
      else {
        currencyInfo = api.getCurrencyInfo(value.currency);
      }
      const roundedDecimalDigits = Math.min(currencyInfo.decimals, 8);
      let balance = balances[value.currency].value / (10 ** currencyInfo.decimals);
      if (balance !== 0) {
        if (feeCurrency === value.currency) {
          balance -= (bridgeFee + gasFee);
        }
        // one number to protect against overflow
        max = Math.round(balance * 10**roundedDecimalDigits - 1) / 10**roundedDecimalDigits;
      }
    } catch (e) {
      max = parseFloat((balances[value.currency] && balances[value.currency].valueReadable) || 0)
    }

    onChange({ amount: String(max) })
  }

  return (
    <BridgeInputBox>
      <div className="currencySelector">
        <BridgeCurrencySelector balances={balances} onChange={setCurrency} value={value.currency} isOpenable={isOpenable} />
      </div>
      <input onChange={setAmount} value={value.amount} placeholder="0.00" type="text" />
      <a className="maxLink" href="#max" onClick={setMax}>
        Max
      </a>
    </BridgeInputBox>
  );
};

export default BridgeSwapInput;
