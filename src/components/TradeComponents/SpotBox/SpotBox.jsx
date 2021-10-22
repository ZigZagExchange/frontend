import React from "react";
// css
import "./SpotBox.css";
// assets
import threeDotIcon from "../../../assets/icons/threedot-icon.png";
import informationButton from "../../../assets/icons/information-button.png";
import SpotForm from "../../../utills/SpotForm/SpotForm";
const SpotBox = (props) => {
  return (
    <>
      <div className="spot_box">
        <div className="spot_head">
          <div className="sh_l">
            <h2>SPOT</h2>
          </div>
          <div className="sh_r">
            <img src={threeDotIcon} alt="..." />
          </div>
        </div>
        <div className="spot_tabs">
          <div className="st_l">
            <h2 className="trade_price_active_tab">Limit</h2>
            <h2>Market</h2>
            <div className="d-flex align-items-center">
              <img src={informationButton} alt="..." />
            </div>
          </div>
        </div>
        <div className="spot_bottom">
          <SpotForm side="buy" initPrice={props.initPrice}/>
          <SpotForm side="sell" initPrice={props.initPrice}/>
        </div>
      </div>
    </>
  );
};

export default SpotBox;
