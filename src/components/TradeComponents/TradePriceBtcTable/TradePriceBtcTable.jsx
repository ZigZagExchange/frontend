import React from "react";
// css
import "./TradePriceBtcTable.css";
// table data
import {TradePriceBtcTableData} from "../../../Data/TradePriceBtcTable";
// assets
import updownIcon from "../../../assets/icons/up-down-arrow.png";
import arrows from "../../../assets/icons/arrows.png";
import star from "../../../assets/icons/star-icon.png";

const TradePriceBtcTable = () => {
  return (
    <>
      <div className="trade_price_btc_table">
        <table>
          <thead>
            <tr>
              <th>
                Pair
                <img className="ms-2" src={updownIcon} alt="..." />
              </th>
              <th>
                Price
                <img className="ms-2" src={updownIcon} alt="..." />
              </th>
              <th>
                Change
                <img className="ms-2" src={updownIcon} alt="..." />
                <img className="ms-2" src={arrows} alt="..." />
              </th>
            </tr>
          </thead>
          <tbody>
            {TradePriceBtcTableData.map((d, i) => {
              return (
                <tr key={i}>
                  <td>
                    <img className="me-2" src={star} alt="..." />
                    {d.td1}
                    <span>{d.span}</span>
                  </td>
                  <td className={d.td2 < 0 ? "down_value" : "up_value"}>
                    {d.td2}
                  </td>
                  <td className={d.td3 < 0 ? "down_value" : "up_value"}>
                    {d.td3}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TradePriceBtcTable;
