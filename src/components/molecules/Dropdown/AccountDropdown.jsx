import { useSelector } from "react-redux";
import React, { useState, useEffect } from "react";
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
import { formatUSD } from "lib/utils";
import api from "lib/api";
import { IconButton as baseIcon } from "../IconButton";
import Text from "components/atoms/Text/Text";
import { PlusIcon, CompareArrowIcon, DeleteIcon } from "components/atoms/Svg";
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
  width: 400px;
  height: 331px;
  background: ${({ theme }) => theme.colors.backgroundLowEmphasis};
  border: 1px solid ${({ theme }) => theme.colors.foreground400};
  top: 20;
  right: 0;
  opacity: 1;
  display: flex;
  flex-direction: column;
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

const WalletToggle = styled.ul`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: ${({ theme }) => theme.colors.backgroundHighEmphasis};
  border: 1px solid ${({ theme }) => theme.colors.foreground300};
  border-radius: 12px;
  width: 99px;
  height: 29px;
  padding: 4px;
`

const WalletToggleItem = styled.li`
  display: block;
  width: 44px;
  height: 21px;
  border-radius: 8px;
  padding: 4px;
  text-align: center;
  user-select: none;
  cursor: pointer;
  background: ${({ show, theme }) => show ? `linear-gradient(93.46deg, ${theme.colors.primaryHighEmphasis} 16.94%, ${theme.colors.secondaryHighEmphasis} 97.24%)` : 'transparent'};
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

const AccountDropdown = ({width, item, leftIcon, rightIcon, clickFunction}) => {
    const [isOpened, setIsOpened] = useState(false)
    const network = useSelector(networkSelector);
    const balanceData = useSelector(balancesSelector);
    const [show, setShow] = useState(false);
    const [totalBalance, setTotalBalance] = useState(0);
    const [selectedLayer, setSelectedLayer] = useState(2);
    const coinEstimator = useCoinEstimator();
  
    const wallet =
      selectedLayer === 1 ? balanceData.wallet : balanceData[network];
  
    useEffect(() => {
      const hideDisplay = () => setShow(false);
      document.addEventListener("click", hideDisplay, false);
      return () => {
        document.removeEventListener("click", hideDisplay);
      };
    }, []);

    const toggle = () => {
        setIsOpened(!isOpened)
    }
  
    const handleKeys = (e) => {
      if (~[32, 13, 27].indexOf(e.which)) {
        e.preventDefault();
        setShow(!show);
      }
    };

    const disconnect = () => {
      api.signOut()
      toggle()
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
      {text:'0x83AD...83H4',url:'#', icon: <DeleteIcon />},
      {text:'0x12BV...b89G',url:'#', icon: <DeleteIcon />}
    ]

    useEffect(() => {
      const sum_array = Object.keys(wallet)
      .filter(filterSmallBalances)
      .sort(sortByNotional)
      .map((ticker) => {
        return coinEstimator(ticker) * wallet[ticker].valueReadable
      })
      const sumValue = Object.values(sum_array).reduce((a, b) => a+b, 0)
      setTotalBalance(sumValue)
    }, [wallet, filterSmallBalances, sortByNotional])

    return (
        <DropdownWrapper> 
            <AccountButton expanded={isOpened} onClick={toggle}></AccountButton>
            { isOpened &&
              <DropdownDisplay>
                <DropdownHeader>
                  <Dropdown width ={242} item={accountData} rightIcon context="0x83AD...83H4" clickFunction={clickItem}/>
                  <IconButtonWrapper>
                    <IconButton variant="secondary" startIcon={<PlusIcon />}></IconButton>
                    <IconButton variant="secondary" startIcon={<CompareArrowIcon />}></IconButton>
                  </IconButtonWrapper> 
                </DropdownHeader>
                <Divider />
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