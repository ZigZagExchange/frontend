import React, { useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import { HiOutlineArrowCircleUp } from "react-icons/hi";
import horizontalDots from "assets/icons/threedot-horizontal-icon.png";
import USDTImage from "assets/images/currency/USDT.svg";
import { Button, Dropdown, Menu, MenuItem, Modal } from "components";
import PoolModalInput from "../PoolModalInput/PoolModalInput";

const Pool = () => {
  const [show, setShow] = useState(false);
  const arePoolsActive = false; // used for testing

  const handleMenu = ({ key }) => {
    switch (key) {
      case "withdrawTokens":
        return;
      default:
        throw new Error("Invalid dropdown option");
    }
  };

  const dropdownMenu = (
    <Menu onSelect={handleMenu}>
      <MenuItem key="withdrawTokens">Withdraw Tokens</MenuItem>
    </Menu>
  );

  return (
    <>
      <div className="pool_databox_container">
        <div className="pool_databox">
          <h3 className="pool_databox_title">MAMMOTH LP BALANCE</h3>
          <h1 className="pool_databox_number">999,999</h1>
        </div>
      </div>

      <div className="pool_box">
        <div className="pool_box_top">
          <h4>Mammoth Pool</h4>
          <Button
            className="bg_btn"
            style={{ width: "120px", padding: "10px 5px" }}
            onClick={() => setShow(true)}
          >
            <IoMdAddCircleOutline size={18} style={{ marginTop: -3 }} /> DEPOSIT
          </Button>

          <Modal
            title="Deposit Tokens"
            onClose={() => setShow(false)}
            show={show}
          >
            <div className="pool_modal_tip_box">
              <strong>Tip:</strong> When you add liquidity, you will receive
              pool tokens representing your position. These tokens automatically
              earn fees proportional to your share of the pool, and can be
              redeemed at any time.
            </div>
            <PoolModalInput currency="USDC" balance="2299" />
            <PoolModalInput currency="USDT" balance="8303" />
            <Button className="bg_btn" onClick={() => setShow(false)}>
              APPROVE
            </Button>
          </Modal>
        </div>

        {arePoolsActive ? (
          <div className="pool_liquidity_container">
            <div className="pool_liquidity_box">
              <div className="pool_liquidity_box_top">
                <h4>
                  <img
                    src={USDTImage}
                    alt="USDT"
                    className="pool_token_image"
                  />{" "}
                  USDT
                  <span className="pool_badge">44.2% APY</span>
                </h4>
                <Dropdown overlay={dropdownMenu}>
                  <img src={horizontalDots} alt="Settings" />
                </Dropdown>
              </div>
              <div className="pool_table">
                <table>
                  <tr>
                    <th>STAKED</th>
                    <th>TVL</th>
                    <th>REWARDS</th>
                    <th></th>
                  </tr>
                  <tr>
                    <td>
                      50424.6 <strong>USDT</strong>
                    </td>
                    <td>
                      1.8B <strong>USDT</strong>
                    </td>
                    <td>
                      1245 <strong>ZZ</strong>
                    </td>
                    <td width="120"></td>
                  </tr>
                </table>
                <Button className="bg_btn zig_btn_sm" style={{ width: 120 }}>
                  <HiOutlineArrowCircleUp size={18} style={{ marginTop: -3 }} />{" "}
                  WITHDRAW
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="pool_liquidity_container"
            style={{ alignItems: "center", justifyContent: "center" }}
          >
            <p>Your Liquidity Positions should appear here.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Pool;
