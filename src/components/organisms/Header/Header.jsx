import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import CheckIcon from "@mui/icons-material/Check";
import { useLocation } from "react-router-dom";
import { userSelector } from "lib/store/features/auth/authSlice";
import {
  networkSelector,
  isConnectingSelector,
} from "lib/store/features/api/apiSlice";
import api from "lib/api";
import logo from "assets/images/logo.png";
import { TabMenu, Tab } from "components/molecules/TabMenu";
import { Dropdown, AccountDropdown } from "components/molecules/Dropdown";
import { ConnectWalletButton } from "components/molecules/Button";
import {
  DiscordIcon,
  ExternalLinkIcon,
  TelegramIcon,
  TwitterIcon,
  DeleteIcon,
  MenuIcon,
} from "components/atoms/Svg";
import { toNumber } from "lodash";
import ToggleTheme from "components/molecules/Toggle/ToggleTheme";
import useTheme from "components/hooks/useTheme";
import { formatAmount } from "../../../lib/utils";
import { SwapVerticalCircleSharp } from "@material-ui/icons";

const langList = [
  { text: "EN", url: "#" },
  { text: "FR", url: "#" },
];

const networkLists = [
  { text: "zkSync - Mainnet", value: 1, url: "#", selectedIcon: <CheckIcon /> },
  {
    text: "zkSync - Rinkeby",
    value: 1000,
    url: "#",
    selectedIcon: <CheckIcon />,
  },
];

const accountLists = [
  { text: "0x83AD...83H4", url: "#", icon: <DeleteIcon /> },
  { text: "0x12BV...b89G", url: "#", icon: <DeleteIcon /> },
];

const HeaderWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  width: 100%;
  height: 56px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.foreground400};
  align-items: center;
  background-color: ${({ theme }) => theme.colors.backgroundHighEmphasis};
  position: fixed;
  padding: 0px 20px;
  z-index: 100;
  box-shadow: ${({ isMobile }) =>
    isMobile ? "0px 8px 16px 0px #0101011A" : ""};
  ${({ isMobile }) => (isMobile ? "backdrop-filter: blur(8px);" : "")}

  button {
    &:hover {
      // background-color: ${({ theme }) =>
        `${theme.colors.foregroundHighEmphasis} !important`};

      div {
        color: ${({ theme }) =>
          `${theme.colors.primaryHighEmphasis} !important`};

        svg path {
          fill: ${({ theme }) =>
            `${theme.colors.primaryHighEmphasis} !important`};
        }
      }
    }
  }
`;

const LogoWrapper = styled.div``;

const ButtonWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: end;
  gap: 19px;
`;

const MenuButtonWrapper = styled.div`
  cursor: pointer;
`;

const NavWrapper = styled.div`
  display: grid;
  grid-template-columns: 32px 421px;
  align-items: center;
`;

const ActionsWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-items: center;
`;

const SocialWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-items: center;
  width: 120px;
`;

const LanguageWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 27px;
`;

const SocialLink = styled.a`
  &:hover {
    svg path {
      fill: ${({ theme }) => `${theme.colors.primaryHighEmphasis} !important`};
    }
  }

  svg path {
    fill: ${({ theme }) => theme.colors.foregroundLowEmphasis};
  }
`;

const StyledDropdown = styled(Dropdown)`
  padding: 16px 0px 16px 16px;
  width: auto;
`;

const VerticalDivider = styled.div`
  width: 1px;
  height: 32px;
  background-color: ${({ theme }) => theme.colors.foreground400};
`;

const SideMenuWrapper = styled.div`
  position: fixed;
  width: 320px;
  top: 0;
  left: 0;
  height: 100vh;
  background: ${({ theme }) => theme.colors.backgroundLowEmphasis};
  z-index: 9999;
  display: grid;
  grid-auto-flow: row;
  justify-content: center;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.foreground400};
  backdrop-filter: blur(8px);
`;

const HorizontalDivider = styled.div`
  width: 229px;
  height: 1px;
  background: ${({ theme }) => theme.colors.foreground400};
`;

const ActionSideMenuWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: space-between;
  span {
    font-family: WorkSans-SemiBold;
    font-size: 12px;
    line-height: 14px;
    text-transform: uppercase;
  }
`;

export const Header = (props) => {
  // state to open or close the sidebar in mobile
  const [show, setShow] = useState(false);
  const connecting = useSelector(isConnectingSelector);
  // const [connecting, setConnecting] = useState(false);
  const user = useSelector(userSelector);
  const network = useSelector(networkSelector);
  const hasBridge = api.isImplemented("depositL2");
  const history = useHistory();
  const [index, setIndex] = useState(0);
  const [language, setLanguage] = useState(langList[0].text);
  const [account, setAccount] = useState(accountLists[0].text);
  const [networkName, setNetworkName] = useState("");
  const [networkItems, setNetWorkItems] = useState(networkLists);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  useEffect(() => {
    const netName = networkLists.filter((item, i) => {
      return item.value === network;
    });
    setNetworkName(netName[0].text);
  });

  useEffect(() => {
    let temp = networkItems.reduce((acc, item) => {
      if (item.text === networkName) item["iconSelected"] = true;
      else item["iconSelected"] = false;
      acc.push(item);
      return acc;
    }, []);

    setNetWorkItems(temp);
  }, [networkName]);

  useEffect(() => {
    api.emit("connecting", props.isLoading);
    // setConnecting(props.isLoading)
  }, [props.isLoading]);

  useEffect(() => {
    switch (location.pathname) {
      case "/":
        setIndex(0);
        break;
      case "/convert":
        setIndex(1);
        break;
      case "/bridge":
        setIndex(2);
        break;
      case "/list-pair":
        setIndex(3);
        break;
      case "/dsl":
        setIndex(5);
        break;

      default:
        setIndex(0);
        break;
    }
  }, []);

  const changeLanguage = (text) => {
    setLanguage(text);
  };

  const changeAccount = (text) => {
    alert(text);
  };

  const changeNetwork = (text, value) => {
    setNetworkName(text);

    api.setAPIProvider(value);
    api.refreshNetwork().catch((err) => {
      console.log(err);
    });
  };

  const handleClick = (newIndex) => {
    switch (newIndex) {
      case 0:
        history.push("/");
        break;
      case 1:
        setIndex(newIndex);
        localStorage.setItem("tab_index", newIndex);
        history.push("/convert");
        break;

      case 2:
        setIndex(newIndex);
        localStorage.setItem("tab_index", newIndex);
        history.push("bridge");
        break;
      case 3:
        setIndex(newIndex);
        localStorage.setItem("tab_index", newIndex);
        history.push("/list-pair");
        break;
      case 4:
        window.open("https://docs.zigzag.exchange/", "_blank");
        break;
      case 5:
        setIndex(newIndex);
        localStorage.setItem("tab_index", newIndex);
        history.push("/dsl");
        break;
      default:
        break;
    }
  };

  const isMobile = window.innerWidth < 1034;

  return (
    <HeaderWrapper isMobile={isMobile}>
      {isMobile ? (
        <>
          <LogoWrapper>
            <Link to="/">
              <a href="/" rel="noreferrer">
                <img src={logo} alt="logo" height="32" />
              </a>
            </Link>
          </LogoWrapper>
          <ButtonWrapper>
            {user.address ? (
              <>
                <AccountDropdown notext networkName={networkName} />
              </>
            ) : (
              <ConnectWalletButton />
            )}
            <MenuButtonWrapper>
              <MenuIcon onClick={() => setShow(!show)} />
            </MenuButtonWrapper>
          </ButtonWrapper>
        </>
      ) : (
        <>
          <NavWrapper>
            <Link to="/">
              <a href="/" rel="noreferrer">
                <img src={logo} alt="logo" height="32" />
              </a>
            </Link>
            <TabMenu
              activeIndex={index}
              onItemClick={handleClick}
              style={{ paddingTop: "20px" }}
            >
              <Tab>TRADE</Tab>
              {hasBridge && <Tab>CONVERT</Tab>}
              {hasBridge && <Tab>BRIDGE</Tab>}
              <Tab>LIST PAIR</Tab>
              {hasBridge && (
                <Tab>
                  DOCS
                  <ExternalLinkIcon size={12} />
                </Tab>
              )}
              {hasBridge && <Tab>DSL</Tab>}

              {/* {hasBridge && <Tab>Old BRIDGE</Tab>} */}
            </TabMenu>
          </NavWrapper>
          <ActionsWrapper>
            <SocialWrapper>
              <SocialLink
                target="_blank"
                rel="noreferrer"
                href="https://discord.gg/zigzag"
              >
                <DiscordIcon />
              </SocialLink>
              <SocialLink
                target="_blank"
                rel="noreferrer"
                href="https://twitter.com/ZigZagExchange"
              >
                <TwitterIcon />
              </SocialLink>
              <SocialLink
                target="_blank"
                rel="noreferrer"
                href="https://t.me/zigzagexchange"
              >
                <TelegramIcon />
              </SocialLink>
            </SocialWrapper>
            <VerticalDivider />
            <LanguageWrapper>
              <StyledDropdown
                adClass="lang-dropdown"
                transparent
                item={langList}
                context={language}
                clickFunction={changeLanguage}
              />
              <ToggleTheme isDark={isDark} toggleTheme={toggleTheme} />
            </LanguageWrapper>
            <VerticalDivider />

            <Dropdown
              adClass="network-dropdown"
              width={162}
              item={networkItems}
              context={networkName}
              clickFunction={changeNetwork}
              leftIcon={true}
            />
            {user.address ? (
              <AccountDropdown networkName={networkName} />
            ) : (
              <ConnectWalletButton />
            )}
          </ActionsWrapper>
        </>
      )}
      {show && isMobile ? (
        <SideMenuWrapper>
          {user.id && user.address ? (
            <Dropdown
              adClass="network-dropdown"
              isMobile={true}
              style={{ justifySelf: "center" }}
              width={242}
              item={networkItems}
              context={networkName}
              clickFunction={changeNetwork}
              leftIcon={true}
            />
          ) : (
            <></>
          )}
          <TabMenu row activeIndex={index} onItemClick={handleClick}>
            <Tab>TRADE</Tab>
            {hasBridge && <Tab>CONVERT</Tab>}
            {hasBridge && <Tab>BRIDGE</Tab>}
            <Tab>LIST PAIR</Tab>
            {hasBridge && (
              <Tab>
                DOCS
                <ExternalLinkIcon size={12} />
              </Tab>
            )}
            {hasBridge && <Tab>DSL</Tab>}
          </TabMenu>
          <HorizontalDivider />
          <ActionSideMenuWrapper>
            <span>Language: </span>
            <StyledDropdown
              adClass="lang-dropdown"
              transparent
              item={langList}
              context={language}
              clickFunction={changeLanguage}
            />
          </ActionSideMenuWrapper>
          <ActionSideMenuWrapper>
            <span>Theme: </span>
            <ToggleTheme isDark={isDark} toggleTheme={toggleTheme} />
          </ActionSideMenuWrapper>
          <HorizontalDivider />
          <SocialWrapper style={{ justifySelf: "center" }}>
            <SocialLink
              target="_blank"
              rel="noreferrer"
              href="https://discord.gg/zigzag"
            >
              <DiscordIcon />
            </SocialLink>
            <SocialLink
              target="_blank"
              rel="noreferrer"
              href="https://twitter.com/ZigZagExchange"
            >
              <TwitterIcon />
            </SocialLink>
            <SocialLink
              target="_blank"
              rel="noreferrer"
              href="https://t.me/zigzagexchange"
            >
              <TelegramIcon />
            </SocialLink>
          </SocialWrapper>
        </SideMenuWrapper>
      ) : (
        <></>
      )}
    </HeaderWrapper>
  );
};
