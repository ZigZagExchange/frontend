import React from "react";
// css
import "./TradePriceTable.css";
const TradePriceTable = (props) => {
  return (
    <>
      <table className={`trade_price_table ${props.className}`}>
        <thead>
          <tr>
            <th>Price</th>
            <th>Amount</th>
            <th>Total(USDT)</th>
          </tr>
        </thead>
        <tbody>
          {props.priceTableData.map((d, i) => {
            const price = typeof d.td1 === "number" ? d.td1.toFixed(2) : d.td1;
            const amount = typeof d.td2 === "number" ? d.td2.toFixed(4) : d.td2;
            const total = typeof d.td3 === "number" ? d.td3.toFixed(2) : d.td3;
            return (
              <tr key={i}>
                <td className={d.side === 'b' ? "up_value": "down_value"}>{price}</td>
                <td>{amount}</td>
                <td>{total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default TradePriceTable;
