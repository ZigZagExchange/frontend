import React from "react";
// css
import "./SpotBox.css";
// assets
import threeDotIcon from "../../../assets/icons/threedot-icon.png";
import informationButton from "../../../assets/icons/information-button.png";
import SpotForm from "../../../utills/SpotForm/SpotForm";
import {useDataContext} from "../../../context/dataContext"



const SpotBox = () => {
  const {dataState} = useDataContext();
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
          <SpotForm side="buy" name={"BUY" + "  " +"  " + dataState?.currency_name_1} num={1}/>
          <SpotForm side="sell" name={"SELL" + "  " + "  " + dataState?.currency_name_2} num={2}/>
        </div>
      </div>
    </>
  );
};

export default SpotBox;
