import { useSelector } from "react-redux";
import React, { useState, useEffect } from "react";
import { IoMdLogOut } from "react-icons/io";
import { AiOutlineCaretDown } from "react-icons/ai";
import styled, { css } from "@xstyled/styled-components";
import { useCoinEstimator } from "components";
import Loader from "react-loader-spinner";
import { userSelector } from "lib/store/features/auth/authSlice";
import {
  networkSelector,
  balancesSelector,
} from "lib/store/features/api/apiSlice";
import { formatUSD } from "lib/utils";
import api from "lib/api";

const DropdownDisplay = styled.div`
  position: absolute;
  z-index: 99;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 10px 20px 10px rgba(0, 0, 0, 0.3);
  margin-top: 10px;
  width: 360px;
  height: 400px;
  background: rgba(255, 255, 255, 1);
  backdrop-filter: blur(4px);
  top: 100%;
  right: 0;
  transform: translateY(20px);
  opacity: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
`;

const DropdownButton = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 47px;
  transition: all 0.12s ease-in-out;
  color: rgba(255, 255, 255, 0.4);
  background: rgba(0, 0, 0, 0.5);
  user-select: none;
  cursor: pointer;
  font-weight: bold;
  padding: 0 16px;
  &:focus {
    outline: 0;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    color: rgba(255, 255, 255, 0.6);
  }

  svg {
    margin-left: 5px;
    font-size: 13px;
  }
`;

const AvatarImg = styled.img`
  width: 26px;
  height: 26px;
  border-radius: 35px;
  margin-right: 10px;
`;

const DropdownContainer = styled.div`
  position: relative;

  ${(props) =>
    props.show &&
    css`
      ${DropdownDisplay} {
        pointer-events: all;
        transform: translateY(0);
        opacity: 1;
      }
    `}
`;

const DropdownHeader = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  h3 {
    font-size: 16px;
    color: #3f4b6a;
    text-shadow: 1px 1px 1px #eee;
  }
`;

const WalletToggle = styled.ul`
  display: flex;
  flex-direction: row;
  align-items: center;
  list-style-type: none;
  border: 1px solid #666;
  border-radius: 33px;
  height: 33px;
  padding: 3px;
`;

const WalletToggleItem = styled.li`
  display: block;
  width: 50px;
  font-size: 12px;
  border-radius: 33px;
  padding: 3px;
  text-align: center;
  user-select: none;
  cursor: pointer;

  ${(props) =>
    props.show &&
    css`
      background: #1c2231;
      color: rgba(255, 255, 255, 0.7);
    `}
`;

const CurrencyList = styled.ul`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  list-style-type: none;
  padding: 0;
`;

const CurrencyListItem = styled.li`
  display: flex;
  flex-direction: row;
  align-items: center;
  line-height: 1.2;
  font-size: 14px;
  padding: 12px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  width: 100%;

  > .currency-icon {
    width: 24px;
    height: 24px;
    margin-right: 15px;
    object-fit: contain;
  }

  > div strong {
    display: block;
  }

  > div small {
    font-size: 12px;
    color: #666;
  }
`;

const DropdownContent = styled.div`
  flex: 1 1 auto;
  overflow-y: auto;
`;

const DropdownFooter = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
  overflow: hidden;
  width: 100%;
  flex-shrink: 0;
`;

const SignOutButton = styled.div`
  padding: 15px 20px;
  cursor: pointer;
  font-size: 13px;
  line-height: 1.1;
  background: rgba(0, 0, 0, 0.04);
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  svg {
    font-size: 15px;
  }

  &:hover {
    background: #b66;
    color: #fff;
  }

  &:active {
    background: #c44;
    color: #fff;
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
`;

export const AccountDropdown = () => {
  const user = useSelector(userSelector);
  const network = useSelector(networkSelector);
  const balanceData = useSelector(balancesSelector);
  const [show, setShow] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState(2);
  const coinEstimator = useCoinEstimator();
  const { profile } = user;

  const wallet =
    selectedLayer === 1 ? balanceData.wallet : balanceData[network];

  useEffect(() => {
    const hideDisplay = () => setShow(false);
    document.addEventListener("click", hideDisplay, false);
    return () => {
      document.removeEventListener("click", hideDisplay);
    };
  }, []);

  const handleKeys = (e) => {
    if (~[32, 13, 27].indexOf(e.which)) {
      e.preventDefault();
      setShow(!show);
    }
  };

  const filterSmallBalances = (currency) => {
    const balance = wallet[currency].valueReadable;
    if (balance) {
      return Number(balance) > 0;
    } else {
      return 0;
    }
  };

  const sortByNotional = (cur1, cur2) => {
    const notionalCur1 = coinEstimator(cur1) * wallet[cur1].valueReadable;
    const notionalCur2 = coinEstimator(cur2) * wallet[cur2].valueReadable;
    if (notionalCur1 > notionalCur2) {
      return -1;
    } else if (notionalCur1 < notionalCur2) {
      return 1;
    } else return 0;
  };

  return (
    <DropdownContainer
      onKeyDown={handleKeys}
      onClick={(e) => e.stopPropagation()}
      show={show}
      tabIndex="0"
    >
      <DropdownButton onClick={() => setShow(!show)} tabIndex="0">
        <AvatarImg src={profile.image} alt={profile.name} />
        {profile.name}
        <AiOutlineCaretDown />
      </DropdownButton>
      <DropdownDisplay>
        <DropdownHeader>
          <h3>Your Wallet</h3>
          <WalletToggle>
            <WalletToggleItem
              onClick={() => setSelectedLayer(1)}
              show={selectedLayer === 1}
            >
              L1
            </WalletToggleItem>
            <WalletToggleItem
              onClick={() => setSelectedLayer(2)}
              show={selectedLayer === 2}
            >
              L2
            </WalletToggleItem>
          </WalletToggle>
        </DropdownHeader>
        <DropdownContent>
          {!wallet && (
            <LoaderContainer>
              <Loader type="TailSpin" color="#444" height={24} width={24} />
            </LoaderContainer>
          )}
          {wallet && (
            <CurrencyList>
              {Object.keys(wallet)
                .filter(filterSmallBalances)
                .sort(sortByNotional)
                .map((ticker, key) => {
                  return (
                    <CurrencyListItem key={key}>
                      <img
                        className="currency-icon"
                        src={api.getCurrencyLogo(ticker)}
                        alt={ticker}
                      />
                      <div>
                        <strong>
                          {wallet[ticker].valueReadable} {ticker}
                        </strong>
                        <small>
                          $
                          {formatUSD(
                            coinEstimator(ticker) * wallet[ticker].valueReadable
                          )}
                        </small>
                      </div>
                    </CurrencyListItem>
                  );
                })}
            </CurrencyList>
          )}
        </DropdownContent>
        <DropdownFooter>
          <SignOutButton onClick={() => api.signOut()}>
            <IoMdLogOut style={{ position: "relative", top: -1 }} /> Disconnect
          </SignOutButton>
        </DropdownFooter>
      </DropdownDisplay>
    </DropdownContainer>
  );
};
