import React from "react";
// css
import "./SpotForm.css";
// components
import RangeSlider from "../RangeSlider/RangeSlider";
import Button from "../Button/Button";
import darkPlugHead from "../../assets/icons/dark-plug-head.png";

const SpotForm = () => {
  return (
    <>
      <form className="spot_form">
        <div className="spf_head">
          <span>Avbi</span>
          <strong>-USDT</strong>
        </div>
        <div className="spf_input_box">
          <input type="text" placeholder="Price" />
          <span>3370.93 USDT</span>
        </div>
        <div className="spf_input_box">
          <input type="text" placeholder="Amount" />
          <span>BTC</span>
        </div>
        <div className="spf_range">
          <RangeSlider />
        </div>
        <div className="spf_btn">
          <Button className="bg_btn" text="CONNECT WALLET" img={darkPlugHead} />
        </div>
      </form>
    </>
  );
};

export default SpotForm;
