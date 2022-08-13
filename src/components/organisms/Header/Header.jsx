import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useHistory, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import CheckIcon from "@mui/icons-material/Check";
import { userSelector } from "lib/store/features/auth/authSlice";
import { useMediaQuery } from "react-responsive";
import {
  networkSelector,
  isConnectingSelector,
} from "lib/store/features/api/apiSlice";
import api from "lib/api";
import logo from "assets/images/logo.png";
import zksyncLogo from "assets/images/networks/zksync-network.svg";
import arbitrumLogo from "assets/images/networks/arbitrum-network.svg";
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
import ToggleTheme from "components/molecules/Toggle/ToggleTheme";
import useTheme from "components/hooks/useTheme";
import {
  MdOutlineArticle,
  MdOutlineQuiz,
  MdSignalCellularAlt,
  MdAccountBalance,
  MdCreate,
  MdOutlineContactMail,
} from "react-icons/md";
import { FaDiscord, FaGithub } from "react-icons/fa";

const langList = [
  { text: "EN", url: "#" },
  { text: "FR", url: "#" },
];

const networkLists = [
  {
    text: "zkSync",
    value: 1,
    url: "#",
    selectedIcon: <CheckIcon />,
    image: zksyncLogo,
  },
  {
    text: "Arbitrum",
    value: 42161,
    url: "#",
    selectedIcon: <CheckIcon />,
    image: arbitrumLogo,
  },
  {
    text: "zkSync - Goerli",
    value: 1002,
    url: "#",
    selectedIcon: <CheckIcon />,
    image: zksyncLogo,
  },
];

const accountLists = [
  { text: "0x83AD...83H4", url: "#", icon: <DeleteIcon /> },
  { text: "0x12BV...b89G", url: "#", icon: <DeleteIcon /> },
];

const supportLists = [
  {
    text: "Live Support",
    url: "https://discord.com/invite/zigzag",
    icon: <FaDiscord size={14} />,
  },
  {
    text: "FAQ",
    url: "https://info.zigzag.exchange/",
    icon: <MdOutlineQuiz size={14} />,
  },
  {
    text: "Docs",
    url: "https://docs.zigzag.exchange/",
    icon: <MdOutlineArticle size={14} />,
  },
  {
    text: "GitHub",
    url: "https://github.com/ZigZagExchange/",
    icon: <FaGithub size={14} />,
  },
  {
    text: "Uptime Status",
    url: "https://status.zigzag.exchange/",
    icon: <MdSignalCellularAlt size={14} />,
  },
  {
    text: "Contact",
    url: "https://info.zigzag.exchange/#contact",
    icon: <MdOutlineContactMail size={14} />,
  },
];

const communityLists = [
  {
    text: "Governance",
    url: "https://forum.zigzaglabs.io/t/zigzag-exchange",
    icon: <MdAccountBalance size={14} />,
  },
  {
    text: "Blog",
    url: "https://blog.zigzag.exchange/",
    icon: <MdCreate size={14} />,
  },
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
  const isEVM = api.isEVMChain();
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
        setIndex(4);
        break;
      case "/wrap":
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

  const changeNetwork = async (text, value) => {
    setNetworkName(text);

    api.setAPIProvider(value);
    try {
      await api.refreshNetwork();
    } catch (err) {
      console.log(err);
    }

    if (
      (/^\/wrap(\/.*)?/.test(location.pathname) && !api.isEVMChain()) ||
      (/^\/bridge(\/.*)?/.test(location.pathname) &&
        !api.isImplemented("depositL2")) ||
      (/^\/list-pair(\/.*)?/.test(location.pathname) && api.isEVMChain())
    ) {
      setIndex(0);
      history.push("/");
    }
  };

  const handleClick = (newIndex) => {
    switch (newIndex) {
      case 0:
        setIndex(newIndex);
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
        setIndex(newIndex);
        localStorage.setItem("tab_index", newIndex);
        history.push("/dsl");
        break;
      case 5:
        window.open(
          "https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x82af49447d8a07e3bd95bd0d56f35241523fbab1&chain=arbitrum",
          "_blank"
        );
        break;
      default:
        break;
    }
  };

  const isMobile = useMediaQuery({ maxWidth: 1224 });

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
                <AccountDropdown networkName={networkName} />
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
              <Tab display={false}>CONVERT</Tab>
              <Tab display={hasBridge && network !== 1002}>BRIDGE</Tab>
              <Tab display={!isEVM && network !== 1002}>LIST PAIR</Tab>
              <Tab display={false}>
                DOCS
                <ExternalLinkIcon size={12} />
              </Tab>
              <Tab display={isEVM}>
                WRAP
                <ExternalLinkIcon size={12} />
              </Tab>
            </TabMenu>
          </NavWrapper>
          <ActionsWrapper>
            <VerticalDivider />
            <Dropdown
              adClass="menu-dropdown"
              width={200}
              item={supportLists}
              context={"Support"}
              leftIcon={true}
              transparent
            />
            <Dropdown
              adClass="menu-dropdown"
              width={162}
              item={communityLists}
              context={"Community"}
              leftIcon={true}
              transparent
            />
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
              {/* <StyledDropdown
                adClass="lang-dropdown"
                transparent
                item={langList}
                context={language}
                clickFunction={changeLanguage}
              /> */}
              <ToggleTheme isDark={isDark} toggleTheme={toggleTheme} />
            </LanguageWrapper>
            <VerticalDivider />

            <Dropdown
              adClass="network-dropdown"
              width={190}
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
          <TabMenu row activeIndex={index} onItemClick={handleClick}>
            <Tab>TRADE</Tab>
            <Tab display={false}>CONVERT</Tab>
            <Tab display={hasBridge && network !== 1002}>BRIDGE</Tab>
            <Tab display={!isEVM && network !== 1002}>LIST PAIR</Tab>
            <Tab display={false}>
              DOCS
              <ExternalLinkIcon size={12} />
            </Tab>
            <Tab display={isEVM}>
              WRAP
              <ExternalLinkIcon size={12} />
            </Tab>
          </TabMenu>
          <HorizontalDivider />
          {/* <ActionSideMenuWrapper>
            <span>Language: </span>
            <StyledDropdown
              adClass="lang-dropdown"
              transparent
              item={langList}
              context={language}
              clickFunction={changeLanguage}
            />
          </ActionSideMenuWrapper> */}
          <ActionSideMenuWrapper>
            <span>Theme: </span>
            <ToggleTheme isDark={isDark} toggleTheme={toggleTheme} />
          </ActionSideMenuWrapper>
          <HorizontalDivider />
          <Dropdown
            adClass="menu-dropdown"
            width={200}
            item={supportLists}
            context={"Support"}
            leftIcon={true}
            transparent
          />
          <Dropdown
            adClass="menu-dropdown"
            width={162}
            item={communityLists}
            context={"Community"}
            leftIcon={true}
            transparent
          />
          <SocialWrapper style={{ justifySelf: "center", marginTop: "150px" }}>
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
