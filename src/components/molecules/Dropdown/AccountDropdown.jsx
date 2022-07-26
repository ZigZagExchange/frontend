import { useSelector } from "react-redux";
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Button from "../Button/Button";
import { AccountButton } from "../ExpandableButton";
import Dropdown from "./Dropdown";
import { useCoinEstimator } from "components";
import Loader from "react-loader-spinner";
import {
  networkSelector,
  balancesSelector,
  settingsSelector,
} from "lib/store/features/api/apiSlice";
import {
  formatUSD,
  formatToken,
  HideMenuOnOutsideClicked,
  addComma,
} from "lib/utils";
import { userSelector } from "lib/store/features/auth/authSlice";
import api from "lib/api";
import Text from "components/atoms/Text/Text";
import {
  PlusIcon,
  CompareArrowIcon,
  DeleteIcon,
  ExternalLinkIcon,
} from "components/atoms/Svg";
import ToggleButton from "../Toggle/ToggleButton";

const DropdownWrapper = styled.div`
  position: relative;
`;

const DropdownDisplay = styled.div`
  position: absolute;
  z-index: 99;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  box-shadow: 0px 8px 16px 0px #0101011a;
  width: ${({ isMobile }) => (isMobile ? "280px" : "400px")};
  // height: 331px;
  max-height: 617px;
  background: ${({ theme }) => theme.colors.backgroundLowEmphasis};
  border: 1px solid ${({ theme }) => theme.colors.foreground400};
  top: 45px;
  right: 0px;
  opacity: 1;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(8px);
`;

const DropdownHeader = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Divider = styled.div`
  background: ${({ theme }) => theme.colors.foreground400};
  margin: 0px 20px;
  height: 1px;
`;

const CurrencyImg = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 8px;
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.colors.foreground400};
`;

const CurrencyList = styled.ul`
  display: flex;
  max-height: 17rem;
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

  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
    position: relative;
    z-index: 20;
  }

  ::-webkit-scrollbar-track {
    border-radius: 5px;
    background: transparent;
    height: 23px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background: hsla(0, 0%, 100%, 0.4);
  }

  ::-webkit-scrollbar-thumb:window-inactive {
    background: #fff;
  }
`;

const DropdownFooter = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`;

const LoaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
`;

const AccountDropdown = ({ notext, networkName }) => {
  const [isOpened, setIsOpened] = useState(false);
  const network = useSelector(networkSelector);
  const user = useSelector(userSelector);
  const settings = useSelector(settingsSelector);
  const balanceData = useSelector(balancesSelector);
  const [totalBalance, setTotalBalance] = useState(0);
  const [selectedLayer, setSelectedLayer] = useState(2);
  const [explorer, setExplorer] = useState(null);

  const coinEstimator = useCoinEstimator();
  const isMobile = window.innerWidth < 490;
  const wrapperRef = useRef(null);

  HideMenuOnOutsideClicked(wrapperRef, setIsOpened);

  const wallet =
    selectedLayer === 1 ? balanceData.wallet : balanceData[network];

  useEffect(() => {
    const explorerLink = user.address
      ? api.getExplorerAccountLink(network, user.address, selectedLayer)
      : null;
    setExplorer(explorerLink);
  }, [network, user.address, selectedLayer]);

  const toggle = () => {
    setIsOpened(!isOpened);
  };

  const disconnect = () => {
    api.signOut(true);
    toggle();
  };

  const openWallet = () => {
    if (explorer) {
      window.open(explorer, "_blank");
    }
  };

  const filterSmallBalances = (currency) => {
    const balance = wallet[currency].valueReadable;
    const usdPrice = coinEstimator(currency);
    const usd_balance = usdPrice * wallet[currency].valueReadable;

    //filter out small balances L2 below 2cents
    if (selectedLayer !== 1 && Number(usdPrice) !== 0) {
      if (usd_balance < 0.02) return false;
    }

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

  useEffect(() => {
    if (wallet?.length === 0) return;
    if (wallet === null || wallet === undefined) return;
    const sum_array = Object.keys(wallet)
      .filter(filterSmallBalances)
      .sort(sortByNotional)
      .map((ticker) => {
        return coinEstimator(ticker) * wallet[ticker].valueReadable;
      });
    const sumValue = Object.values(sum_array).reduce((a, b) => a + b, 0);
    setTotalBalance(sumValue);
  }, [wallet, filterSmallBalances, sortByNotional]);

  return (
    <DropdownWrapper ref={wrapperRef}>
      <AccountButton
        notext={notext}
        expanded={isOpened}
        onClick={toggle}
      ></AccountButton>
      {isOpened && (
        <DropdownDisplay isMobile={isMobile}>
          <DropdownHeader>
            <div>
              <Text font="primaryTiny" color="foregroundMediumEmphasis">
                TOTAL BALANCE
              </Text>
              <Text font="primaryHeading6" color="foregroundHighEmphasis">
                {settings.hideBalance
                  ? "****.****"
                  : "$ " + addComma(formatUSD(totalBalance))}
              </Text>
            </div>
            <ToggleButton
              type="option"
              size="sm"
              leftLabel="l1"
              rightLabel="l2"
              width="40"
              selectedLayer={selectedLayer}
              toggleClick={(num) => setSelectedLayer(num)}
            />
          </DropdownHeader>
          <Divider />
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
                        <CurrencyImg
                          src={api.getCurrencyLogo(ticker)}
                          alt={ticker}
                        />
                        <div>
                          <Text
                            font="primarySmallSemiBold"
                            color="foregroundHighEmphasis"
                          >
                            {settings.hideBalance
                              ? "****.****"
                              : formatToken(
                                  wallet[ticker].valueReadable,
                                  ticker
                                ) +
                                " " +
                                ticker}
                          </Text>
                          <Text
                            font="primaryTiny"
                            color="foregroundMediumEmphasis"
                          >
                            {settings.hideBalance
                              ? "****.****"
                              : "$" +
                                formatUSD(
                                  coinEstimator(ticker) *
                                    wallet[ticker].valueReadable
                                )}
                          </Text>
                        </div>
                      </CurrencyListItem>
                    );
                  })}
              </CurrencyList>
            )}
          </DropdownContent>
          <Divider />
          <DropdownFooter>
            <Button
              variant="outlined"
              scale="imd"
              onClick={openWallet}
              className="mr-[1rem]"
            >
              <Text
                font="primaryBoldDisplay"
                color="foregroundHighEmphasis"
                textAlign="center"
              >
                <ExternalLinkIcon size={10} />
                {selectedLayer === 1
                  ? "Etherscan"
                  : networkName.includes("zkSync")
                  ? "zkScan"
                  : "Arbiscan"}
              </Text>
            </Button>
            <Button variant="outlined" scale="imd" onClick={disconnect}>
              <Text
                font="primaryBoldDisplay"
                color="foregroundHighEmphasis"
                textAlign="center"
              >
                DISCONNECT
              </Text>
            </Button>
          </DropdownFooter>
        </DropdownDisplay>
      )}
    </DropdownWrapper>
  );
};

export default AccountDropdown;
