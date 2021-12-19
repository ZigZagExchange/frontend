import { useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import { BiChevronDown } from 'react-icons/bi'
import { FaDiscord, FaTelegramPlane, FaTwitter } from 'react-icons/fa'
import { GoGlobe } from 'react-icons/go'
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Button, Dropdown, AccountDropdown, Menu, MenuItem } from 'components'
import { userSelector } from 'lib/store/features/auth/authSlice'
import { networkSelector } from 'lib/store/features/api/apiSlice'
import api from 'lib/api'
import logo from 'assets/images/logo.png'
import menu from 'assets/icons/menu.png'
import darkPlugHead from 'assets/icons/dark-plug-head.png'
import './Header.css'

export const Header = (props) => {
  // state to open or close the sidebar in mobile
  const [show, setShow] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const user = useSelector(userSelector)
  const network = useSelector(networkSelector)
  const history = useHistory()
  const location = useLocation()

  const hasBridge = api.isImplemented('depositL2')

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

  const connect = () => {
    setConnecting(true)
    api.signIn(network)
      .then(state => {
        if (!state.id && !/^\/bridge(\/.*)?/.test(location.pathname)) {
          history.push('/bridge')
        }
        setConnecting(false)
      })
      .catch(() => setConnecting(false))
  }

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
                {hasBridge && <li>
                  <NavLink exact to="/bridge" activeClassName="active_link">
                    Bridge
                  </NavLink>
                </li>}
                <li>
                  <NavLink exact to="/pool" activeClassName="active_link">
                    Pool
                  </NavLink>
                </li>
              </ul>
            </div>
            <div className="head_right">
              <div className="d-flex align-items-center justify-content-between">
                {user.id && user.address ? (
                  <Dropdown overlay={dropdownMenu}>
                    <button className="address_button">
                      {user.address.slice(0, 6)}...
                      {user.address.slice(-4)}
                    </button>
                  </Dropdown>
                ) : (
                  <Button loading={connecting} className="bg_btn" onClick={connect}>
                    <img src={darkPlugHead} alt="..." /> CONNECT WALLET
                  </Button>
                )}
              </div>
              <div className="eu_text">
                <GoGlobe className="eu_network" />
                <select
                  value={network.toString()}
                  onChange={(e) => {
                    api.setAPIProvider(parseInt(e.target.value))
                    api.refreshNetwork().catch(err => {
                      console.log(err)
                    })
                  }}
                >
                  <option value="1">zkSync - Mainnet</option>
                  <option value="1000">zkSync - Rinkeby</option>
                </select>
                <BiChevronDown className="eu_caret" />
              </div>
            </div>
          </div>
        ) : null}

        {/* desktop header */}
        <div className="head_wrapper_desktop dex_h">
          <div className="head_left">
            <a href="http://info.zigzag.exchange" rel="noreferrer"><img src={logo} alt="logo" /></a>
            <ul>
              <li>
                <NavLink exact to="/" activeClassName="active_link">
                  Trade
                </NavLink>
              </li>
              {hasBridge && <li>
                <NavLink exact to="/bridge" activeClassName="active_link">
                  Bridge
                </NavLink>
              </li>}
              {process.env.NODE_ENV === 'development' && <li>
                <NavLink exact to="/pool" activeClassName="active_link">
                  Pool
                </NavLink>
              </li>}
            </ul>
          </div>
          <div className="head_left head_left_socials">
          <ul>
            <li className="head_social_link">
              <a target="_blank" rel="noreferrer" href="https://discord.gg/zigzag"><FaDiscord /></a>
            </li>
            <li className="head_social_link"> 
              <a target="_blank" rel="noreferrer" href="https://twitter.com/ZigZagExchange"><FaTwitter /></a>
            </li>  
            <li className="head_social_link">
              <a target="_blank" rel="noreferrer" href="https://t.me/zigzagexchange"><FaTelegramPlane /></a> 
            </li>  
            </ul>
                  
                </div>
          <div className="head_right">
            <label htmlFor="networkSelector" className="eu_text">
                <GoGlobe className="eu_network" />
                <select
                  id="networkSelector"
                  value={network.toString()}
                  onChange={(e) => {
                    api.setAPIProvider(parseInt(e.target.value))
                    api.refreshNetwork().catch(err => {
                      console.log(err)
                    })
                  }}
                >
                  <option value="1">zkSync - Mainnet</option>
                  <option value="1000">zkSync - Rinkeby</option>
                </select>
                <BiChevronDown className="eu_caret" />
              </label>
            <div className="head_account_area">
              {user.id && user.address ? (
                <AccountDropdown />
              ) : (
                <Button
                  className="bg_btn"
                  loading={connecting}
                  text="CONNECT WALLET"
                  img={darkPlugHead}
                  onClick={connect}
                />
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
