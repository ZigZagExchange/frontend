import React, { useCallback } from "react";
import styled from "@xstyled/styled-components";
import BridgeCurrencySelector from "../BridgeCurrencySelector/BridgeCurrencySelector";

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

const BridgeSwapInput = ({
  value = {},
  onChange,
  bridgeFee,
  currencies,
  balances = {},
  className,
  decimals,
}) => {
  const setCurrency = useCallback(
    (currency) => onChange({ currency, amount: "" }),
    [onChange]
  );
  const setAmount = useCallback(
    (e) => {
      let amount = e.target.value.replace(/[^0-9.]/g, "")
      amount = amount.split(".").slice(0, 2)
      if (amount.length > 1) amount[1] = amount[1].substr(0, decimals)
      onChange({ amount: amount.join(".") })
    },
    [onChange]
  );

  let maxBalance = parseFloat(
    (balances[value.currency] && balances[value.currency].valueReadable) || 0
  );
  maxBalance -= parseFloat(bridgeFee);

  const setDecimals = () => {
    var t = value.amount;
    value.amount =
      t.indexOf(".") >= 0
        ? t.substr(0, t.indexOf(".")) + t.substr(t.indexOf("."), decimals + 1)
        : t;
  };

  const setMax = () => {
    if (maxBalance > 0) {
      onChange({ amount: maxBalance || "" });
    }
  };

  return (
    <BridgeInputBox>
      <div className="currencySelector">
        <BridgeCurrencySelector
          currencies={currencies}
          balances={balances}
          onChange={setCurrency}
          value={value.currency}
        />
      </div>
      <input
        onChange={setAmount}
        onInput={setDecimals(this)}
        value={value.amount}
        className={className}
        placeholder="0.00"
        type="text"
      />
      <a className="maxLink" href="#max" onClick={setMax}>
        Max
      </a>
    </BridgeInputBox>
  );
};

export default BridgeSwapInput;
