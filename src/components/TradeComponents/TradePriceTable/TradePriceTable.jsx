import React from "react";
// css
import "./TradePriceTable.css";
const TradePriceTable = (props) => {
  return (
    <>
      <table className={`trade_price_table ${props.className}`}>
        <thead>
          <tr>
            <th>Price(USDT)</th>
            <th>Amount(ETH)</th>
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
