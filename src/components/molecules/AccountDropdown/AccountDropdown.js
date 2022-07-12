import { useDispatch, useSelector } from "react-redux";
import React, { useState, useEffect } from "react";
import { IoMdGrid, IoMdLogOut, IoMdOpen } from "react-icons/io";
import { AiOutlineCaretDown } from "react-icons/ai";
import styled, { css } from "@xstyled/styled-components";
import { useCoinEstimator } from "components";
import Loader from "react-loader-spinner";
import { userSelector } from "lib/store/features/auth/authSlice";
import { networkSelector, balancesSelector, layoutSelector } from "lib/store/features/api/apiSlice";
import { formatUSD, formatPrice } from "lib/utils";
import api from "lib/api";
import { setLayout } from "lib/helpers/storage/layouts";
import { Modal, Tooltip } from "components";
import FirstLayoutImage from "assets/images/layout/layout1.svg";
import SecondLayoutImage from "assets/images/layout/layout2.svg";
import ThirdLayoutImage from "assets/images/layout/layout3.svg";
import FourthLayoutImage from "assets/images/layout/layout4.svg";

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

  @media screen and (max-width: 991px) {
    position: fixed;
    margin-top: 0;
    width: 100%;
    border-radius: 0;
  }
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

  & h4 {
    margin: 0;
    font-size: 10px;
    text-align: center;
    text-transform: uppercase;
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
`;

const DropdownFooter = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  width: 100%;
`;
const LayoutButton = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  padding: 15px;
  cursor: pointer;
  font-size: 13px;
  line-height: 1.1;
  background: rgba(0, 0, 0, 0.04);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  svg {
    font-size: 15px;
    position: relative;
    top: -1px;
  }
  &:hover {
    background: #4d76af;
    color: #fff;
  }
  &:active {
    background: #36527a;
    color: #fff;
  }
`;
const DropdownExplorer = styled.div`
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  padding: 15px;
  cursor: pointer;
  font-size: 13px;
  line-height: 1.1;
  background: rgba(0, 0, 0, 0.04);

  a {
    color: inherit;
    text-decoration: none;
  }

  &:hover {
    background: #4d76af;
  }

  &:hover > a {
    color: #fff;
  }
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
  }

  &:active {
    background: #c44;
    color: #fff;
  }
`;

const LoaderContainer = styled.div`
display: flex;
align - items: center;
justify - content: center;
height: 100px;
`;

const LayoutItem = styled.div`
display: flex;
width: 100 %;
justify - content: center;
align - items: center;
font - size: 15px;
filter: invert(52 %) sepia(5 %) saturate(958 %) hue - rotate(167deg) brightness(97 %) contrast(82 %);
padding: 10px;
  & img {
  height: 150px;
  width: auto;
  user - drag: none;
  -webkit - user - drag: none;
  user - select: none;
  -moz - user - select: none;
  -webkit - user - select: none;
  -ms - user - select: none;
}
`;

const LayoutList = styled.div`
display: grid;
grid - template - columns: 50 % 50 %;
  ${LayoutItem}: nth - child(${(props) => props.layout + 1}) {
  filter: invert(84 %) sepia(18 %) saturate(211 %) hue - rotate(186deg) brightness(107 %) contrast(106 %);
}
`;

export const AccountDropdown = () => {
  const dispatch = useDispatch();

  const user = useSelector(userSelector);
  const network = useSelector(networkSelector);
  const balanceData = useSelector(balancesSelector);
  const [show, setShow] = useState(false);

  //UI layouts
  const layout = useSelector(layoutSelector);
  const [showLayout, setShowLayout] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(layout);

  const changeLayout = (l) => {
    //local state
    dispatch({ type: "api/setLayout", payload: l });
    setLayout(l);

    setSelectedLayout(l);
  };

  const [selectedLayer, setSelectedLayer] = useState(2);
  const coinEstimator = useCoinEstimator();
  const { profile, address } = user;

  const wallet = selectedLayer === 1 ? balanceData.wallet : balanceData[network];
  const explorer = address ? api.getExplorerAccountLink(network, address) : null;
  const networkName = selectedLayer === 1 ? "Etherscan" : api.getNetworkDisplayName(network);

  useEffect(() => {
    const hideDisplay = () => setShow(false);
    document.addEventListener("click", hideDisplay, false);
    return () => {
      document.removeEventListener("click", hideDisplay);
    };
  }, []);

  useEffect(() => {
    if (show) {
      // update Ethereum balance
      api.getWalletBalances();
    }
  }, [show]);

  const handleKeys = (e) => {
    if (~[32, 13, 27].indexOf(e.which)) {
      e.preventDefault();
      setShow(!show);
    }
  };

  const filterSmallBalances = (currency) => {
    const balance = wallet[currency].valueReadable;
    const usdBalance = coinEstimator(currency) * wallet[currency].valueReadable;

    //filter out small balances L2 below 2cents
    if (selectedLayer !== 1) {
      if (usdBalance < 0.02) return false;
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

  return (
    <DropdownContainer
      onKeyDown={handleKeys}
      onClick={(e) => e.stopPropagation()}
      show={show}
      tabIndex="0"
    >
      <DropdownButton onClick={() => setShow(!show)} tabIndex="0">
        <AvatarImg src={profile.image} />
        <span>
          {profile.name}
          <h4>Wallet</h4>
        </span>
        <AiOutlineCaretDown />
      </DropdownButton>
      <DropdownDisplay>
        <DropdownHeader>
          <h3>Your Wallet</h3>
          <WalletToggle>
            <WalletToggleItem onClick={() => setSelectedLayer(1)} show={selectedLayer === 1}>
              L1
            </WalletToggleItem>
            <WalletToggleItem onClick={() => setSelectedLayer(2)} show={selectedLayer === 2}>
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
                          {formatPrice(wallet[ticker].valueReadable)} {ticker}
                        </strong>
                        <small>
                          ${formatUSD(coinEstimator(ticker) * wallet[ticker].valueReadable)}
                        </small>
                      </div>
                    </CurrencyListItem>
                  );
                })}
            </CurrencyList>
          )}
        </DropdownContent>
        <DropdownFooter>
          <LayoutButton
            onClick={() => {
              setShowLayout(!showLayout);
              setShow(!show);
            }}
            tabIndex="0"
          >
            <IoMdGrid style={{ position: "relative", marginTop: 1, marginRight: 3 }} /> Layouts
          </LayoutButton>

          <Modal
            title="Select a Layout"
            show={showLayout}
            onClose={() => setShowLayout(!showLayout)}
          >
            <LayoutList layout={selectedLayout}>
              <LayoutItem onClick={() => changeLayout(0)}>
                <Tooltip placement={"bottom"} label={"Default Layout"}>
                  <img src={FirstLayoutImage} alt="Default" />
                </Tooltip>
              </LayoutItem>
              <LayoutItem onClick={() => changeLayout(1)}>
                <Tooltip placement={"bottom"} label={"Chart Focused Layout"}>
                  <img src={ThirdLayoutImage} alt="Chart Focused" />
                </Tooltip>
              </LayoutItem>
              <LayoutItem onClick={() => changeLayout(2)}>
                <Tooltip placement={"bottom"} label={"Chart Focused RTL Layout"}>
                  <img src={FourthLayoutImage} alt="Chart Focused RTL" />
                </Tooltip>
              </LayoutItem>
              <LayoutItem onClick={() => changeLayout(3)}>
                <Tooltip placement={"bottom"} label={"Default RTL Layout"}>
                  <img src={SecondLayoutImage} alt="Default RTL" />
                </Tooltip>
              </LayoutItem>
            </LayoutList>
          </Modal>

          <DropdownExplorer>
            <a target="_blank" rel="noreferrer" href={explorer}>
              <IoMdOpen style={{ position: "relative", top: -2 }} /> {networkName}
            </a>
          </DropdownExplorer>

          <SignOutButton onClick={() => api.signOut()}>
            <IoMdLogOut style={{ position: "relative", top: -1 }} /> Disconnect
          </SignOutButton>
        </DropdownFooter>
      </DropdownDisplay>
    </DropdownContainer>
  );
};
