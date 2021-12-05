import React from 'react'
import logo from 'assets/images/logo.png'
import { DefaultTemplate, SwapButton } from 'components'
import './BridgePage.style.css'

const Bridge = () => {
  return (
    <DefaultTemplate>
      <div className="bridge_section">
        <div className="bridge_container">
          <div className="bridge_box">
            <div className="bridge_box_top">
              <div className="bridge_coin_title">
                <h5>FROM</h5>
                <div className="bridge_coin_details">
                  <div className="bridge_coin_image">
                    <img alt="Logo" src={logo} />
                  </div>
                  <div className="bridge_coin_name">ZigZag</div>
                </div>
              </div>
              <div className="bridge_input_box">
                <input placeholder="0.00" type="text" />
                <span className="bridge_input_right">
                  <a href="#max">Max</a>
                </span>
              </div>
              <div className="bridge_coin_stats">
                <div className="bridge_coin_stat">
                  <h5>Estimated value</h5>
                  <span>~$124.90</span>
                </div>
                <div className="bridge_coin_stat">
                  <h5>Available balance</h5>
                  <span>8,112.00 ZIG</span>
                </div>
              </div>
            </div>

            <div className="bridge_box_bottom">
              <div className="bridge_box_swap_wrapper">
                <SwapButton />
                <h5>Switch</h5>
              </div>

              <div className="bridge_coin_stats">
                <div className="bridge_coin_stat">
                  <div className="bridge_coin_details">
                    <div className="bridge_coin_title">
                      <h5>TO</h5>
                      <div className="bridge_coin_details">
                        <div className="bridge_coin_image">
                          <img
                            alt="Bitcoin logo"
                            src="https://assets.coingecko.com/coins/images/1/thumb_2x/bitcoin.png?1547033579"
                          />
                        </div>
                        <div className="bridge_coin_name">Bitcoin</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bridge_coin_stat">
                  <h5>Available balance</h5>
                  <span>1.00 BTC</span>
                </div>
              </div>

              <div className="bridge_transfer_fee">
                Estimated transfer fee: ~12.820675 ZIG
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultTemplate>
  )
}

export default Bridge
