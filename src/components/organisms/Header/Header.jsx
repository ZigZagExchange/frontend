import { useSelector } from 'react-redux'
import React, { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Button, Dropdown, Menu, MenuItem } from 'components'
import { userSelector } from 'lib/store/features/auth/authSlice'
import { networkSelector } from 'lib/store/features/api/apiSlice'
import api from 'lib/api'
import logo from 'assets/images/logo.png'
import settingIcon from 'assets/icons/setting-icon.png'
import menu from 'assets/icons/menu.png'
import darkPlugHead from 'assets/icons/dark-plug-head.png'
import './Header.css'

export const Header = (props) => {
  // state to open or close the sidebar in mobile
  const [show, setShow] = useState(false)
  const user = useSelector(userSelector)
  const network = useSelector(networkSelector)

  const [walletLink, bridgeLink] = useMemo(() => {
    switch (network) {
      case 1:
        return [
          'https://wallet.zksync.io/',
          '/bridge'
        ]
      case 1000:
        return [
          'https://rinkeby.zksync.io/',
          '/bridge'
        ]
      default:
        return []
    }
  }, [network])

  useEffect(() => {
    const accountUpdater = setInterval(() => {
      api.getAccountState() 
    }, 3000)

    return () => {
      clearInterval(accountUpdater)
    }
  }, [])

  const handleMenu = ({ key }) => {
    switch (key) {
      case 'signOut':
        api.signOut()
        return
      default:
        throw new Error('Invalid dropdown option')
    }
  }

  const dropdownMenu = (
    <Menu onSelect={handleMenu}>
      <MenuItem key="signOut">Disconnect</MenuItem>
    </Menu>
  )

  return (
    <>
      <header>
        <div className="mobile_header mb_h">
          <img src={logo} alt="logo" />
          {/* open sidebar function */}
          <img
            onClick={() => {
              setShow(!show)
            }}
            src={menu}
            alt="..."
          />
        </div>
        {/* mobile sidebar */}
        {show ? (
          <div className="mb_header_container mb_h">
            <img src={logo} alt="logo" />
            <div className="head_left">
              <ul>
                <li>
                  <NavLink exact to="/" activeClassName="active_link">
                    Trade
                  </NavLink>
                </li>
                <li>
                  {bridgeLink
                    ? (
                      <NavLink exact to={bridgeLink || ""} activeClassName="active_link">
                        Bridge
                      </NavLink>
                    )
                    : (
                      // eslint-disable-next-line
                      <a rel="noreferrer">Bridge</a>
                    )}
                </li>
                <li>
                  <a href={walletLink} target="_blank" rel="noreferrer">
                    Wallet
                  </a>
                </li>
              </ul>
            </div>
            <div className="head_right">
              <div className="d-flex align-items-center justify-content-between">
                <img src={settingIcon} alt="..." />
                {user.address ? (
                  <Dropdown overlay={dropdownMenu}>
                    <button className="address_button">
                      {user.address.slice(0, 6)}...
                      {user.address.slice(-4)}
                    </button>
                  </Dropdown>
                ) : (
                  <button className="bg_btn" onClick={() => api.signIn(network)}>
                    <img src={darkPlugHead} alt="..." /> CONNECT WALLET
                  </button>
                )}
              </div>
              <div className="eu_text">
                <select
                  defaultValue={network.toString()}
                  onChange={(e) => api.setAPIProvider(parseInt(e.target.value))}
                >
                  <option value="1">zkSync - Mainnet</option>
                  <option value="1000">zkSync - Rinkeby</option>
                  <option value="1001">Starknet Goerli</option>
                </select>
              </div>
            </div>
          </div>
        ) : null}

        {/* desktop header */}
        <div className="d-flex align-items-center justify-content-between w-100 dex_h">
          <div className="head_left">
            <a href="http://info.zigzag.exchange" rel="noreferrer"><img src={logo} alt="logo" /></a>
            <ul>
              <li>
                <NavLink exact to="/" activeClassName="active_link">
                  Trade
                </NavLink>
              </li>
              <li>
                {bridgeLink
                  ? (
                    <NavLink exact to={bridgeLink || ""} activeClassName="active_link">
                      Bridge
                    </NavLink>
                  )
                  : (
                    // eslint-disable-next-line
                    <a rel="noreferrer">Bridge</a>
                  )}
              </li>
              <li>
                <a href={walletLink} target="_blank" rel="noreferrer">Wallet</a>
              </li>
            </ul>
          </div>
          <div className="head_left">
          <ul>
            <li>
              <a target="_blank" rel="noreferrer" href="https://discord.gg/zigzag">Discord</a>
            </li>
            <li> 
              <a target="_blank" rel="noreferrer" href="https://twitter.com/ZigZagExchange">Twitter</a>
            </li>  
            <li>
              <a target="_blank" rel="noreferrer" href="https://t.me/zigzagexchange">Telegram</a> 
            </li>  
            </ul>
                  
                </div>
          <div className="head_right">
            {user.address ? (
              <Dropdown overlay={dropdownMenu}>
                <button className="address_button">
                  {user.address.slice(0, 6)}...
                  {user.address.slice(-4)}
                </button>
              </Dropdown>
            ) : (
              <Button
                className="bg_btn"
                text="CONNECT WALLET"
                img={darkPlugHead}
                onClick={() => api.signIn(network)}
              />
            )}
            <div className="eu_text">
              <select
                defaultValue={network.toString()}
                onChange={(e) => api.setAPIProvider(parseInt(e.target.value))}
              >
                <option value="1">zkSync - Mainnet</option>
                <option value="1000">zkSync - Rinkeby</option>
                <option value="1001">Starknet</option>
              </select>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
