import React, { useState } from 'react'
import { useTranslation } from "react-i18next";
import "../../../../translations/i18n";
import { IoMdAddCircleOutline } from 'react-icons/io'
import { HiOutlineArrowCircleUp } from 'react-icons/hi'
import horizontalDots from 'assets/icons/threedot-horizontal-icon.png'
import USDTImage from 'assets/images/currency/USDT.svg'
import { Button, Dropdown, Menu, MenuItem, Modal } from 'components'
import PoolModalInput from '../PoolModalInput/PoolModalInput'

const Pool = () => {
  const [show, setShow] = useState(false);
  const arePoolsActive = false; // used for testing
  const { t } = useTranslation();

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
      <MenuItem key="withdrawTokens">{t("withdraw_token")}</MenuItem>
    </Menu>
  )
  
  return (
    <>
        <div className="pool_databox_container">
            <div className="pool_databox">
                <h3 className="pool_databox_title">{t("total_staked_c")}</h3>
                <h1 className="pool_databox_number">$999,999</h1>
            </div>
            <div className="pool_databox">
                <h3 className="pool_databox_title">{t("your_rewards_c")}</h3>
                <h1 className="pool_databox_number">$999,999</h1>
                <a href="#claim" className="pool_badge databox_link">{t("claim_all")}</a>
            </div>
        </div>

        <div className="pool_box">
            <div className="pool_box_top">
                <h4>{t("mamoth_pool")}</h4>
                <Button className="bg_btn" style={{ width: '120px', padding: '10px 5px' }} onClick={() => setShow(true)}>
                    <IoMdAddCircleOutline size={18} style={{ marginTop: -3 }} /> {t("deposit_c")}
                </Button>

                <Modal title="Deposit Tokens" onClose={() => setShow(false)} show={show}>
                    <div className="pool_modal_tip_box">
                        <strong>{t("tip")}</strong> {t("when_you_add_liquidity_text")}
                    </div>
                    <PoolModalInput currency="USDC" balance="2299"/>
                    <PoolModalInput currency="USDT" balance="8303"/>
                    <Button className="bg_btn" onClick={() => setShow(false)}>
                        {t("approve_c")}
                    </Button>
                </Modal>
            
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
                    <div className="pool_table">
                        <table>
                            <tr>
                                <th>{t("staked_c")}</th>
                                <th>{t("tvl_c")}</th>
                                <th>{t("rewards_c")}</th>
                                <th></th>
                            </tr>
                            <tr>
                                <td>50424.6 <strong>USDT</strong></td>
                                <td>1.8B <strong>USDT</strong></td>
                                <td>1245 <strong>ZZ</strong></td>
                                <td width="120"></td>
                            </tr>
                        </table>
                        <Button className="bg_btn zig_btn_sm" style={{ width: 120 }}>
                            <HiOutlineArrowCircleUp size={18} style={{ marginTop: -3 }} /> {t("withdraw_c")}
                        </Button>
                    </div>
                </div>
            </div>
            :
            <div className="pool_liquidity_container" style={{alignItems: 'center', justifyContent: 'center'}}>
                <p>{t("your_liquidity_positions_should_appear_here")}</p>
            </div>
            }
        </div>
    </>
  )
}

export default Pool
