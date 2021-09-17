import React, { useState } from "react";
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
    const [price, setPrice] = useState(3370.93);
    const [amount, setAmount] = useState("");
    function updatePrice (e) {
        setPrice(e.target.value);
    }
    function updateAmount (e) {
        setAmount(e.target.value);
    }

  return (
    <>
      <form className="spot_form">
        <div className="spf_head">
          <span>Avbl</span>
          {balanceHtml}
        </div>
        <div className="spf_input_box">
          <span className="spf_desc_text">Price</span>
          <input type="text" value={price} onChange={updatePrice}/>
          <span>USDT</span>
        </div>
        <div className="spf_input_box">
          <div className="spf_desc_text">Amount</div>
          <input type="text" value={amount} onChange={updateAmount}/>
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
