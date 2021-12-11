import React from 'react'
import { IoMdAddCircleOutline } from 'react-icons/io'
import horizontalDots from 'assets/icons/threedot-horizontal-icon.png'
import USDTImage from 'assets/images/currency/USDT.svg'
import { Button, Dropdown, Menu, MenuItem } from 'components'

const Pool = () => {
  // eslint-disable-next-line
  const arePoolsActive = true; // used for testing

  const handleMenu = ({ key }) => {
    switch (key) {
      case 'withdrawTokens':
        return
      default:
        throw new Error('Invalid dropdown option')
    }
  }

  const dropdownMenu = (
    <Menu onSelect={handleMenu}>
      <MenuItem key="withdrawTokens">Withdraw Tokens</MenuItem>
    </Menu>
  )
  
  return (
    <>
        <div className="pool_databox_container">
            <div className="pool_databox">
                <h3 className="pool_databox_title">TOTAL STAKED</h3>
                <h1 className="pool_databox_number">$999,999</h1>
            </div>
            <div className="pool_databox">
                <h3 className="pool_databox_title">YOUR REWARDS</h3>
                <h1 className="pool_databox_number">$999,999</h1>
                <a href="#claim" className="pool_badge databox_link">Claim All</a>
            </div>
        </div>

        <div className="pool_box">
            <div className="pool_box_top">
                <h4>Mammoth Pool</h4>
                <Button className="bg_btn" style={{ width: '120px', padding: '10px 5px' }}>
                    <IoMdAddCircleOutline size={18} style={{ marginTop: -3 }} /> DEPOSIT
                </Button>
            </div>
            
            {arePoolsActive ? 
            <div className="pool_liquidity_container">
                <div className="pool_liquidity_box">
                    <div className="pool_liquidity_box_top">
                        <h4><img src={USDTImage} alt="USDT" className="pool_token_image"/> USDT
                            <span className="pool_badge">44.2% APY</span>
                        </h4>
                        <Dropdown overlay={dropdownMenu}>
                            <img src={horizontalDots} alt="Settings" />
                        </Dropdown>
                        
                    </div>
                    <table>
                        <tr>
                            <th>STAKED</th>
                            <th>TVL</th>
                            <th>REWARDS</th>
                        </tr>
                        <tr>
                            <td>50424.6 <strong>USDT</strong></td>
                            <td>1.8B <strong>USDT</strong></td>
                            <td>1245 <strong>ZZ</strong></td>
                        </tr>
                    </table>
                </div>
            </div>
            :
            <div className="pool_liquidity_container" style={{alignItems: 'center', justifyContent: 'center'}}>
                <p>Your Liquidity Positions should appear here.</p>
            </div>
            }
        </div>
    </>
  )
}

export default Pool
