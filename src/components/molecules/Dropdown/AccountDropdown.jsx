import { useSelector } from "react-redux";
import React, { useState, useEffect, useRef } from "react";
import styled from 'styled-components'
import Button from "../Button/Button";
import { AccountButton } from '../ExpandableButton'
import Dropdown from './Dropdown'
import { useCoinEstimator } from "components";
import Loader from "react-loader-spinner";
import {
  networkSelector,
  balancesSelector,
} from "lib/store/features/api/apiSlice";
import { formatUSD, HideMenuOnOutsideClicked } from "lib/utils";
import api from "lib/api";
import { IconButton as baseIcon } from "../IconButton";
import Text from "components/atoms/Text/Text";
import { PlusIcon, CompareArrowIcon, DeleteIcon, ExternalLinkIcon } from "components/atoms/Svg";
import ToggleButton from "../Toggle/ToggleButton";

const DropdownWrapper = styled.div`
    position: relative;
`

const DropdownDisplay = styled.div`
  position: absolute;
  z-index: 99;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  box-shadow: 0px 8px 16px 0px #0101011A;
  width: ${({ isMobile }) => isMobile ? '250px' : '400px'};
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
`

const DropdownHeader = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const Divider = styled.div`
  background: ${({ theme }) => theme.colors.foreground400};
  margin: 0px 20px;
  height: 1px;
`

const CurrencyImg = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 8px;
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.colors.foreground400};
`

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

const IconButtonWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 10px;
`

const IconButton = styled(baseIcon)`
  width: 24px;
  height: 24px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.foreground400};
  border-radius: 9999px;
  padding: 0px !important;
  svg {
      margin-right: 0px !important;
      margin-left: 0px !important;
  }
`

const AccountDropdown = ({ notext }) => {
  const [isOpened, setIsOpened] = useState(false)
  const network = useSelector(networkSelector);
  const balanceData = useSelector(balancesSelector);
  const [totalBalance, setTotalBalance] = useState(0);
  const [selectedLayer, setSelectedLayer] = useState(2);
  const coinEstimator = useCoinEstimator();
  const isMobile = window.innerWidth < 430
  const wrapperRef = useRef(null)

  HideMenuOnOutsideClicked(wrapperRef, setIsOpened)

  const wallet =
    selectedLayer === 1 ? balanceData.wallet : balanceData[network];

  const toggle = () => {
    setIsOpened(!isOpened)
  }

  const disconnect = () => {
    api.signOut()
    toggle()
  }

  const popoutzkScan = () => {
    window.open(`https://rinkeby.zkscan.io/explorer/accounts/${wallet["ETH"]["allowance"]["_hex"]}`, "_blank");
  }

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

  const clickItem = (text) => {
    alert(text)
  }

  const accountData = [
    { text: '0x83AD...83H4', url: '#', icon: <DeleteIcon /> },
    { text: '0x12BV...b89G', url: '#', icon: <DeleteIcon /> }
  ]

  useEffect(() => {
    if (wallet?.length === 0) return
    if (wallet === null || wallet === undefined) return
    const sum_array = Object.keys(wallet)
      .filter(filterSmallBalances)
      .sort(sortByNotional)
      .map((ticker) => {
        return coinEstimator(ticker) * wallet[ticker].valueReadable
      })
    const sumValue = Object.values(sum_array).reduce((a, b) => a + b, 0)
    setTotalBalance(sumValue)
  }, [wallet, filterSmallBalances, sortByNotional])

  return (
    <DropdownWrapper ref={wrapperRef}>
      <AccountButton notext={notext} expanded={isOpened} onClick={toggle}></AccountButton>
      {isOpened &&
        <DropdownDisplay isMobile={isMobile}>
          {/* <DropdownHeader>
            <Dropdown width={242} item={accountData} rightIcon context="0x83AD...83H4" clickFunction={clickItem} />
            <IconButtonWrapper>
              <IconButton variant="secondary" startIcon={<PlusIcon />}></IconButton>
              <IconButton variant="secondary" startIcon={<CompareArrowIcon />}></IconButton>
            </IconButtonWrapper>
          </DropdownHeader>
          <Divider /> */}
          <DropdownHeader>
            <div>
              <Text font="primaryTiny" color="foregroundMediumEmphasis">TOTAL BALANCE</Text>
              <Text font="primaryHeading6" color="foregroundHighEmphasis">
                ${formatUSD(totalBalance)}
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
                          <Text font="primarySmallSemiBold" color="foregroundHighEmphasis">{wallet[ticker].valueReadable} {ticker}</Text>
                          <Text font="primaryTiny" color="foregroundMediumEmphasis">
                            $
                            {formatUSD(
                              coinEstimator(ticker) * wallet[ticker].valueReadable
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
            <Button variant="outlined" scale="imd" onClick={popoutzkScan} className="mr-[1rem]">
              <Text font="primaryBoldDisplay" color="foregroundHighEmphasis" textAlign="center">
                <ExternalLinkIcon size={10} />
                zkScan
              </Text>
            </Button>
            <Button variant="outlined" scale="imd" onClick={disconnect}>
              <Text font="primaryBoldDisplay" color="foregroundHighEmphasis" textAlign="center">DISCONNECT</Text>
            </Button>
          </DropdownFooter>
        </DropdownDisplay>
      }
    </DropdownWrapper>
  )
}

export default AccountDropdown