import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useHistory, useLocation } from "react-router-dom";
import { BiChevronDown } from "react-icons/bi";
import { AiOutlineCaretDown } from "react-icons/ai";
import { FaDiscord, FaTelegramPlane, FaTwitter } from "react-icons/fa";
import { GoGlobe } from "react-icons/go";
import { HiExternalLink } from "react-icons/hi";
import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Button, Dropdown, AccountDropdown, Menu, MenuItem } from "components";
import ConnectWalletButton from "../../atoms/ConnectWalletButton/ConnectWalletButton";
import { userSelector } from "lib/store/features/auth/authSlice";
import { networkSelector } from "lib/store/features/api/apiSlice";
import api from "lib/api";
import logo from "assets/images/logo.png";
import menu from "assets/icons/menu.png";
import "./Header.css";
import { Dev } from "../../../lib/helpers/env";
import { formatAmount } from "../../../lib/utils";

export const Header = (props) => {
  // state to open or close the sidebar in mobile
  const mobileRef = useRef();
  const [show, setShow] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const user = useSelector(userSelector);
  const network = useSelector(networkSelector);
  const hasBridge = api.isImplemented("depositL2");
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const detectOutside = e => {
      if (show && mobileRef.current && !mobileRef.current.contains(e.target)) {
        setShow(false)
      }
    }
    document.addEventListener("touchmove", detectOutside)
    return () => {
      document.removeEventListener("touchmove", detectOutside)
    }
  }, [show])

  useEffect(()=>{
    setConnecting(props.isLoading)
  }, [props.isLoading])


  const connect = async () => {
    try {
      setConnecting(true);
      const state = await api.signIn(network);
      const walletBalance = formatAmount(state.committed.balances['ETH'], { decimals: 18 });
      const activationFee = await api.apiProvider.changePubKeyFee('ETH');

      if (!state.id && (!/^\/bridge(\/.*)?/.test(location.pathname)) && (isNaN(walletBalance) || walletBalance < activationFee)) {
        history.push("/bridge");
      }
      setConnecting(false);
    } catch (e) {
      console.error(e);
      setConnecting(false);
    }
  };

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
  return (
    <>
      <header>
        <div className="mobile_header main_header mb_h">
          <img src={logo} alt="logo" height="30" /> 
          <div className="head_account_area">
          {user.address ? (
            <Dropdown overlay={dropdownMenu}>
              <button className="address_button">
                <span>
                  {user.address.slice(0, 8)}···
                  {user.address.slice(-4)}
                  <h4>WALLET</h4>
                </span>
                <AiOutlineCaretDown />
              </button>
            </Dropdown>
          ) : (
            <ConnectWalletButton />
          )}
          </div>
          {/* open sidebar function */}
          <img
            onClick={() => {
              setShow(!show);
            }}
            src={menu}
            alt="..."
          />
        </div>
        {/* mobile sidebar */}
          <div className={show ? "mb_header_container active mb_h" : "mb_header_container mb_h"} ref={mobileRef}>
            <img src={logo} alt="logo" />
            <div className="head_left">
              <ul className="flex-column mt-4">
                <li>
                  <NavLink exact to="/" activeClassName="active_link">
                    Trade
                  </NavLink>
                </li>
                {hasBridge && (
                  <li>
                    <NavLink exact to="/bridge" activeClassName="active_link">
                      Bridge
                    </NavLink>
                  </li>
                )}
                <li>
                  <NavLink exact to="/list-pair" activeClassName="active_link">
                    List Pair
                  </NavLink>
                </li>
                {hasBridge && (
                  <li>
                    <a
                      href="https://docs.zigzag.exchange/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Docs <HiExternalLink />
                    </a>
                  </li>
                )}
                
                <Dev>
                  <li>
                    <NavLink exact to="/pool" activeClassName="active_link">
                      Pool
                    </NavLink>
                  </li>
                  <li>
                    <NavLink exact to="/dsl" activeClassName="active-link">
                      DSL
                    </NavLink>
                  </li>
                  <li>
                    <NavLink exact to="/swap" activeClassName="active-link">
                      Swap
                    </NavLink>
                  </li>
                </Dev>
              </ul>
            </div>
            <div className="head_right">
              <div className="d-flex align-items-center justify-content-between">
                {user.address ? (
                  <Dropdown overlay={dropdownMenu}>
                    <button className="address_button">
                      {user.address.slice(0, 8)}···
                      {user.address.slice(-4)}
                    </button>
                  </Dropdown>
                ) : (
                  <ConnectWalletButton />
                )}
              </div>
              <div className="eu_text mt-3">
                <GoGlobe className="eu_network" />
                <select
                  value={network.toString()}
                  onChange={(e) => {
                    api.setAPIProvider(parseInt(e.target.value));
                    api.refreshNetwork().catch((err) => {
                      console.log(err);
                    });
                  }}
                >
                  <option value="1">zkSync - Mainnet</option>
                  <option value="1000">zkSync - Rinkeby</option>
                </select>
                <BiChevronDown className="eu_caret" />
              </div>
              <div className="head_left head_left_socials">
                <ul>
                  <li className="head_social_link">
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href="https://discord.gg/zigzag"
                    >
                      <FaDiscord />
                    </a>
                  </li>
                  <li className="head_social_link">
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href="https://twitter.com/ZigZagExchange"
                    >
                      <FaTwitter />
                    </a>
                  </li>
                  <li className="head_social_link">
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href="https://t.me/zigzagexchange"
                    >
                      <FaTelegramPlane />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        {/* desktop header */}
        <div className="main_header head_wrapper_desktop dex_h">
          <div className="head_left">
            <Link to="/">
              <a href="/" rel="noreferrer">
                <img src={logo} alt="logo" height="30" />
              </a>
            </Link>
            <ul>
              <li>
                <NavLink exact to="/" activeClassName="active_link">
                  Trade
                </NavLink>
              </li>
              {hasBridge && (
                <li>
                  <NavLink exact to="/bridge" activeClassName="active_link">
                    Bridge
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink exact to="/list-pair" activeClassName="active_link">
                  List Pair
                </NavLink>
              </li>
              {hasBridge && (
                <li>
                  <a
                    href="https://docs.zigzag.exchange/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Docs <HiExternalLink />
                  </a>
                </li>
              )}
              <Dev>
                <li>
                  <NavLink exact to="/pool" activeClassName="active_link">
                    Pool
                  </NavLink>
                </li>
                <li>
                  <NavLink exact to="/dsl" activeClassName="active_link">
                    DSL
                  </NavLink>
                </li>
                <li>
                  <NavLink exact to="/swap" activeClassName="active-link">
                    Swap
                  </NavLink>
                </li>
              </Dev>
            </ul>
          </div>
          <div className="head_right">
            <div className="head_left head_left_socials">
              <ul>
                <li className="head_social_link">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://discord.gg/zigzag"
                  >
                    <FaDiscord />
                  </a>
                </li>
                <li className="head_social_link">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://twitter.com/ZigZagExchange"
                  >
                    <FaTwitter />
                  </a>
                </li>
                <li className="head_social_link">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://t.me/zigzagexchange"
                  >
                    <FaTelegramPlane />
                  </a>
                </li>
              </ul>
            </div>
            <label htmlFor="networkSelector" className="eu_text">
              <GoGlobe className="eu_network" />
              <select
                id="networkSelector"
                value={network.toString()}
                onChange={(e) => {
                  api.setAPIProvider(parseInt(e.target.value));
                  if(user.address){
                    api.refreshNetwork().catch((err) => {
                      console.log(err);
                    });
                  }
                }}
              >
                <option value="1">zkSync - Mainnet</option>
                <option value="1000">zkSync - Rinkeby</option>
              </select>
              <BiChevronDown className="eu_caret" />
            </label>
            <div className="head_account_area">
              {user.address ? (
                <AccountDropdown />
              ) : (
                <Button
                  className="bg_btn zig_btn_sm"
                  loading={connecting}
                  text="CONNECT WALLET"
                  onClick={connect}
                />
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
