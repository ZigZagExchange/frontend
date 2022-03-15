import { useSelector } from "react-redux";
import React, { useMemo } from "react";
import { BiChevronDown } from "react-icons/bi";
import { GoGlobe } from "react-icons/go";
import { NavLink } from "react-router-dom";
import { networkSelector } from "lib/store/features/api/apiSlice";
import api from "lib/api";
import logo from "assets/images/logo.png";
import "./Header.css";

export const HeaderBridge = (props) => {
  // state to open or close the sidebar in mobile
  const network = useSelector(networkSelector);

  const [, bridgeLink] = useMemo(() => {
    switch (network) {
      case 1:
        return ["https://wallet.zksync.io/", "/bridge"];
      case 1000:
        return ["https://rinkeby.zksync.io/", "/bridge"];
      default:
        return [];
    }
  }, [network]);

  return (
    <>
      <header className="bridge_header">
        <div className="d-flex align-items-center justify-content-center w-100">
          <div className="head_left">
            <a href="http://info.zigzag.exchange" rel="noreferrer">
              <img src={logo} alt="logo" />
            </a>
            <ul>
              <li>
                <NavLink exact to="/" activeClassName="active_link">
                  Trade
                </NavLink>
              </li>
              <li>
                {bridgeLink ? (
                  <NavLink
                    exact
                    to={bridgeLink || ""}
                    activeClassName="active_link"
                  >
                    Bridge
                  </NavLink>
                ) : (
                  // eslint-disable-next-line
                  <a rel="noreferrer">Bridge</a>
                )}
              </li>
              <li>
                <NavLink exact to="/list-pair" activeClassName="active_link">
                  List Pair
                </NavLink>
              </li>
              <li>
                <a
                  href="https://docs.zigzag.exchange/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Docs
                </a>
              </li>
            </ul>
            <label htmlFor="networkSelector" className="eu_text">
              <GoGlobe className="eu_network" />
              <select
                id="networkSelector"
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
            </label>
          </div>
        </div>
      </header>
    </>
  );
};
