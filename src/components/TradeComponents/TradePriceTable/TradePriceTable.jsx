import React from "react";
// css
import "./TradePriceTable.css";
import {useDataContext} from "../../../context/dataContext"


  const TradePriceTable = (props) => {
  const {dataState} = useDataContext();
  return (
    <>
      <table className={`trade_price_table ${props.className}`}>
        <thead>
          <tr>
            <th>Price({dataState?.currency_name_1})</th>
            <th>Amount({dataState?.currency_name_2})</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {props.priceTableData.map((d, i) => {
            return (
              <tr key={i}>
                <td className={props.value}>{d.td1}</td>
                <td>{d.td2}</td>
                <td>{d.td3}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default TradePriceTable;
