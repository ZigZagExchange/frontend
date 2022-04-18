import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useHistory, useLocation } from "react-router-dom";
import { BiChevronDown } from "react-icons/bi";
import { FaDiscord, FaTelegramPlane, FaTwitter } from "react-icons/fa";
import { GoGlobe } from "react-icons/go";
import { HiExternalLink } from "react-icons/hi";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { Menu, MenuItem } from "components";
import { userSelector } from "lib/store/features/auth/authSlice";
import { networkSelector } from "lib/store/features/api/apiSlice";
import api from "lib/api";
import logo from "assets/images/logo.png";
import menu from "assets/icons/menu.png";
import "./Header.css";
import ConnectWalletButton from "../../atoms/ConnectWalletButton/ConnectWalletButton";
import { Dev } from "../../../lib/helpers/env";
import { TabMenu, Tab } from "components/molecules/TabMenu";
import { Dropdown, AccountDropdown } from "components/molecules/Dropdown";
import Button from "components/molecules/Button/Button";
import { DiscordIcon, ExternalLinkIcon, TelegramIcon, TwitterIcon, DeleteIcon, MenuIcon } from "components/atoms/Svg";
import { toNumber } from "lodash";
import ToggleTheme from "components/molecules/Toggle/ToggleTheme";
import useTheme from "components/hooks/useTheme";

const langList = [
  {text:'EN',url:'#'},
  {text:'FR',url:'#'}
]

const networkLists = [
  {text:'zkSync - Mainnet', value: 1, url:'#'},
  {text:'zkSync - Rinkeby', value: 1000, url:'#'}
]

const accountLists = [
  {text:'0x83AD...83H4',url:'#', icon: <DeleteIcon />},
  {text:'0x12BV...b89G',url:'#', icon: <DeleteIcon />}
]

export const Header = (props) => {
  // state to open or close the sidebar in mobile
  const [show, setShow] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const user = useSelector(userSelector);
  const network = useSelector(networkSelector);
  const hasBridge = api.isImplemented("depositL2");
  const history = useHistory();
  const location = useLocation();
  const [index, setIndex] = useState(toNumber(localStorage.getItem("tab_index")));
  const [language, setLanguage] = useState(langList[0].text)
  const [account, setAccount] = useState(accountLists[0].text)
  const [networkName, setNetworkName] = useState(networkLists[0].text)
  const { isDark, toggleTheme } = useTheme()

  const changeLanguage = (text) => {
    setLanguage(text)
  }

  const changeAccount = (text) => {
    alert(text)
  }

  const changeNetwork = (text, value) => {
    setNetworkName(text)
    console.log("networkid: ", value)
    api.setAPIProvider(value);
    api.refreshNetwork().catch((err) => {
      console.log(err);
    });
  }

  const handleClick = (newIndex) => {
    switch (newIndex) {
      case 0:
        setIndex(newIndex);
        localStorage.setItem('tab_index', newIndex)
        history.push('/')
        break;
      case 1:
        setIndex(newIndex);
        localStorage.setItem('tab_index', newIndex)
        history.push('bridge')
        break;
      case 2:
        setIndex(newIndex);
        localStorage.setItem('tab_index', newIndex)
        history.push('/list-pair')
        break;
      case 3:
        window.open('https://docs.zigzag.exchange/', '_blank')
        break;
      default:
        break;
    }
  }

  const handleMenu = ({ key }) => {
    switch (key) {
      case "signOut":
        api.signOut();
        return;
      default:
        throw new Error("Invalid dropdown option");
    }
  };

  const dropdownMenu = (
    <Menu onSelect={handleMenu}>
      <MenuItem key="signOut">Disconnect</MenuItem>
    </Menu>
  );

  const connect = () => {
    setConnecting(true);
    api
      .signIn(network)
      .then((state) => {
        if (!state.id && !/^\/bridge(\/.*)?/.test(location.pathname)) {
          history.push("/bridge");
        }
        setConnecting(false);
      })
      .catch(() => setConnecting(false));
  };

  const isMobile = window.innerWidth < 1034

  return (
    <HeaderWrapper>
      {
        isMobile ?
        <>
          <LogoWrapper>
            <Link to="/">
              <a href="/" rel="noreferrer">
                <img src={logo} alt="logo" height="32" />
              </a>
            </Link>
          </LogoWrapper>
          <ButtonWrapper>
            {user.id && user.address ? ( 
              <>
                <AccountDropdown notext />
              </>
            ) : (
              <Button isLoading={connecting} scale="md" onClick={connect} style={{width: '143px', marginRight: '19px', padding: connecting ? '8px 5px' : '8px 15px'}}>CONNECT WALLET</Button>
            )}
            <MenuButtonWrapper>
              <MenuIcon />
            </MenuButtonWrapper>
          </ButtonWrapper>
        </> :
        <>
          <NavWrapper>
            <Link to="/">
              <a href="/" rel="noreferrer">
                <img src={logo} alt="logo" height="32" />
              </a>
            </Link>
            <TabMenu activeIndex={index} onItemClick={handleClick} style={{paddingTop: '22px'}}>
              <Tab>TRADE</Tab>
              <Tab>BRIDGE</Tab>
              <Tab>LIST PAIR</Tab>
              <Tab>DOCS<ExternalLinkIcon size={12} /></Tab>
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
              <StyledDropdown transparent item={langList} context={language} clickFunction={changeLanguage}/>
              <ToggleTheme isDark={isDark} toggleTheme={toggleTheme} />
            </LanguageWrapper>
            <VerticalDivider />
            {user.id && user.address ? ( 
              <>
                <Dropdown width ={242} item={networkLists} context={networkName} clickFunction={changeNetwork}/>
                <AccountDropdown />
              </>
            ) : (
              <Button isLoading={connecting} scale="md" onClick={connect} style={{width: '143px', padding: connecting ? '8px 5px' : '8px 15px'}}>CONNECT WALLET</Button>
            )}
          </ActionsWrapper>
        </>
      }
    </HeaderWrapper>
  );
};

const HeaderWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  width: 100%;
  height: 57px;
  border-bottom: 1px solid ${({theme}) => theme.colors.foreground400};
  align-items: center;
  background-color: ${({theme}) => theme.colors.backgroundMediumEmphasis};
  position: fixed;
  padding: 0px 20px;
  z-index: 100;
`

const LogoWrapper = styled.div`
`

const ButtonWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: end;
  gap: 23px;
`

const MenuButtonWrapper = styled.div`
  cursor: pointer;
`

const NavWrapper = styled.div`
  display: grid;
  grid-template-columns: 32px 421px;
  align-items: center;
`

const ActionsWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-items: center;
`

const SocialWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-items: center;
  width: 120px;
`

const LanguageWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 27px;
`

const SocialLink = styled.a`
  svg path {
    fill: ${({theme}) => theme.colors.foregroundLowEmphasis};
  }
`

const StyledDropdown = styled(Dropdown)`
  width: fit-content;
`

const VerticalDivider = styled.div`
  width: 1px;
  height: 32px;
  background-color: ${({theme}) => theme.colors.foreground400};
`
