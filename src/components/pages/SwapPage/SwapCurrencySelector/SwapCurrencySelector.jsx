import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { networkSelector } from "lib/store/features/api/apiSlice";
import { userSelector } from "lib/store/features/auth/authSlice";
import styled, { css } from "@xstyled/styled-components";
import { FiChevronDown } from "react-icons/fi";
import { useCoinEstimator } from "components";
import { formatUSD } from "lib/utils";
import api from "lib/api";

const StyledSwapCurrencySelector = styled.div`
  height: 46px;
  padding: 0 10px;
  background: #fff;
  border-radius: 15px;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid #fff;
  box-shadow: 2px 2px 2px 0 rgba(0, 0, 0, 0.2);
  cursor: pointer;
  user-select: none;

  &:hover {
    border-color: #7b8ab6;
  }

  select {
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
  }
`;

const SwapCurrencyWrapper = styled.div`
  position: relative;

  .currencyIcon > img {
    width: 28px;
    height: 28px;
    object-fit: contain;
  }

  .currencyName {
    flex: 1 1 auto;
    margin-left: 8px;
    font-size: 15px;
    color: #333;

    svg {
      position: relative;
      top: -1px;
      margin-left: 5px;
    }
  }
`;

const SwapCurrencyOptions = styled.ul`
  position: absolute;
  top: 120%;
  left: 0;
  z-index: 2;
  width: 260px;
  box-shadow: 0 2px 7px 3px rgba(0, 0, 0, 0.2);
  background: #fff;
  padding: 0;
  list-style-type: none;
  border-radius: 15px;
  opacity: 0;
  pointer-events: none;
  transform: rotate(180deg) translateY(20px);
  cursor: pointer;

  ${(p) =>
    p.show &&
    css`
      opacity: 1;
      pointer-events: all;
      transform: rotate(0deg) translateY(0);
    `}

  .currencyBalance {
    line-height: 1.1;
    text-align: right;
    margin-left: auto;

    strong {
      display: block;
      font-weight: 600;
      font-family: "Iceland", sans-serif;
      font-size: 18px;
      color: #226;
    }

    small {
      font-size: 12px;
    }
  }

  .currencyOption {
    display: flex;
    padding: 13px;
    flex-direction: row;
    align-items: center;

    &:first-child {
      border-top-left-radius: 15px;
      border-top-right-radius: 15px;
    }

    &:last-child {
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
    }

    &:hover {
      background: #eee;
    }

    &:active,
    &:focus {
      background: #def;
    }
  }
`;

const SwapCurrencySelector = ({
  onChange,
  currencies,
  balances = {},
  value,
}) => {
  const [tickers, setTickers] = useState([]);
  const [showingOptions, setShowingOptions] = useState(false);
  const network = useSelector(networkSelector);
  const user = useSelector(userSelector);
  const coinEstimator = useCoinEstimator();

  useEffect(() => {
    const tickers = (currencies || Object.keys(api.currencies))
      .filter((c) => {
        return api.currencies[c].chain[network];
      })
      .sort();

    setTickers(tickers);
    onChange(api.currencies["ETH"] ? "ETH" : tickers[0]);
  }, [user.id, network, currencies]);

  const hideOptions = (e) => {
    if (e) e.preventDefault();
    setShowingOptions(false);
  };

  const toggleOptions = (e) => {
    if (e) e.preventDefault();
    e.stopPropagation();
    setShowingOptions(!showingOptions);
  };

  useEffect(() => {
    if (showingOptions) {
      window.addEventListener("click", hideOptions, false);
    }

    return () => {
      window.removeEventListener("click", hideOptions);
    };
  }, [showingOptions]);

  if (!value) {
    return null;
  }

  const currency = api.currencies[value];

  const selectOption = (ticker) => (e) => {
    if (e) e.preventDefault();
    onChange(ticker);
  };

  return (
    <SwapCurrencyWrapper>
      <StyledSwapCurrencySelector onClick={toggleOptions}>
        <div className="currencyIcon">
          <img src={currency.image.default} alt={currency.name} />
        </div>
        <div className="currencyName">
          {value}
          <FiChevronDown />
        </div>
      </StyledSwapCurrencySelector>
      <SwapCurrencyOptions onClick={hideOptions} show={showingOptions}>
        {tickers.map((ticker, key) =>
          ticker === value ? null : (
            <li
              key={key}
              onClick={selectOption(ticker)}
              tabIndex="0"
              className="currencyOption"
            >
              <div className="currencyIcon">
                <img
                  src={api.currencies[ticker].image.default}
                  alt={currency.name}
                />
              </div>
              <div className="currencyName">{ticker}</div>
              {balances[ticker] && (
                <div className="currencyBalance">
                  <strong>{balances[ticker].valueReadable}</strong>
                  <small>
                    $
                    {formatUSD(
                      coinEstimator(ticker) * balances[ticker].valueReadable
                    )}
                  </small>
                </div>
              )}
            </li>
          )
        )}
      </SwapCurrencyOptions>
    </SwapCurrencyWrapper>
  );
};

export default SwapCurrencySelector;
