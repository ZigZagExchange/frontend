import React, {useState} from "react";
// libarary
import {NavLink} from "react-router-dom";
// css
import "./Header.css";
// assets
import logo from "../../assets/images/logo.png";
import settingIcon from "../../assets/icons/setting-icon.png";
import menu from "../../assets/icons/menu.png";
import darkPlugHead from "../../assets/icons/dark-plug-head.png";
// component
import Button from "../../utills/Button/Button";

const Header = (props) => {
    // state to open or close the sidebar in mobile
    const [show, setShow] = useState(false);

    return (
        <>
            <header>
                <div className="mobile_header mb_h">
                    <img src={logo} alt="logo"/>
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
                {show ? (
                    <div className="mb_header_container mb_h">
                        <img src={logo} alt="logo"/>
                        <div className="head_left">
                            <ul>
                                <li>
                                    <NavLink exact to="/" activeClassName="active_link">
                                        Trade
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink exact to="https://rinkeby.zksync.io" activeClassName="active_link">
                                        Wallet
                                    </NavLink>
                                </li>
                            </ul>
                        </div>
                        <div className="head_right">
                            <div className="d-flex align-items-center justify-content-between">
                                <img src={settingIcon} alt="..."/>
                                {
                                    props.user.address ? (
                                        <button className="address_button">
                                            {props.user.address.slice(0,4)}...{props.user.address.slice(0,-4)}
                                        </button>
                                    ) : (
                                        <button className="bg_btn">
                                            <img src={darkPlugHead} alt="..."/> CONNECT WALLET
                                        </button>
                                    )
                                }
                            </div>
                            <div className="eu_text">
                                <select>
                                    <option>zkSync</option>
                                    <option>Starknet</option>
                                    <option>Loopring</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : null}
                {/* desktop header */}
                <div className="d-flex align-items-center justify-content-between w-100 dex_h">
                    <div className="head_left">
                        <img src={logo} alt="logo"/>
                        <ul>
                            <li>
                                <NavLink exact to="/" activeClassName="active_link">
                                    Trade
                                </NavLink>
                            </li>
                            <li>
                                <a href="https://rinkeby.zksync.io">
                                    Wallet
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="head_right">
                        <img className="me-3" src={settingIcon} alt="..."/>
                        { props.user.address ? (
                            <button className="address_button">
                                {props.user.address.slice(0,6)}...{props.user.address.slice(-4)}
                            </button>
                        ) : (
                            <Button
                                className="bg_btn"
                                text="CONNECT WALLET"
                                img={darkPlugHead}
                                onClick={props.signInHandler}
                            />
                        )}
                        <div className="eu_text">
                            <select>
                                <option>zkSync - Rinkeby</option>
                                <option disabled>zkSync - Mainnet</option>
                                <option disabled>Starknet</option>
                                <option disabled>Loopring</option>
                            </select>
                        </div>
                        <img src={menu} alt="..."/>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
