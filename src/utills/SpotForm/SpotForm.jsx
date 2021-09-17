import React from "react";
// css
import "./SpotForm.css";
// components
import RangeSlider from "../RangeSlider/RangeSlider";
import Button from "../Button/Button";
import darkPlugHead from "../../assets/icons/dark-plug-head.png";
//helpers
import { signinzksync } from "../../helpers";

const SpotForm = (props) => {
    const balanceHtml = (props.side === "buy") ?
              <strong>-USDT</strong> :
              <strong>-ETH</strong>;
  return (
    <>
      <form className="spot_form">
        <div className="spf_head">
          <span>Avbl</span>
          {balanceHtml}
        </div>
        <div className="spf_input_box">
          <span className="spf_desc_text">Price</span>
          <input type="text" value="3370.93" />
          <span>USDT</span>
        </div>
        <div className="spf_input_box">
          <div className="spf_desc_text">Amount</div>
          <input type="text" value="3370.93" />
          <div>ETH</div>
        </div>
        <div className="spf_range">
          <RangeSlider />
        </div>
        <div className="spf_btn">
          <Button className="bg_btn" text="CONNECT WALLET" img={darkPlugHead} onClick={signinzksync}/>
        </div>
      </form>
    </>
  );
};

export default SpotForm;
