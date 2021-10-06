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
// helpers
import {useAuthContext} from "../../context/authContext";
import {signinzksync} from "../../helpers";

const Header = () => {
    // state to open or close the sidebar in mobile
    const [show, setShow] = useState(false);

    const {user,updateUser} = useAuthContext();

    const signInHandler = async () => {
        try {
            const syncAccountState = await signinzksync();
            //    updating the user in the context
            updateUser(syncAccountState);
        } catch (err) {
            updateUser(null);
            console.log(err.message)
        }
    }

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
                                    user ? (
                                        <button className="address_button">
                                            {user.address.slice(0,4)}...{user.address.slice(0,-4)}
                                        </button>
                                    ) : (
                                        <button className="bg_btn">
                                            <img src={darkPlugHead} alt="..."/> CONNECT WALLET
                                        </button>
                                    )
                                }
                            </div>
                            <div className="eu_text">
                                <span>Eng</span>
                                <hr/>
                                <span>USD</span>
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
                        { user ? (
                            <button className="address_button">
                                {user.address.slice(0,6)}...{user.address.slice(-4)}
                            </button>
                        ) : (
                            <Button
                                className="bg_btn"
                                text="CONNECT WALLET"
                                img={darkPlugHead}
                                onClick={signInHandler}
                            />
                        )}
                        <div className="eu_text">
                            <span>Eng</span>
                            <hr/>
                            <span>USD</span>
                        </div>
                        <img src={menu} alt="..."/>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
