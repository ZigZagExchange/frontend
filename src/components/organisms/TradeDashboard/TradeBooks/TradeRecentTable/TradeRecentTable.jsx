import React, { useEffect } from "react";
// css
import "./TradeRecentTable.css";
import { numStringToSymbol } from "lib/utils";

const TradeRecentTable = (props) => {
  const scrollToBottom = () => {
    if (props.scrollToBottom) {
      const tableDiv = document.getElementsByClassName(props.className);
      if (tableDiv.length > 0) tableDiv[0].scrollTop = tableDiv[0].scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [props.priceTableData]);

  const maxQuantity = Math.max(...props.priceTableData.map((d) => d.td2));
  let onClickRow;
  if (props.onClickRow) onClickRow = props.onClickRow;
  else onClickRow = () => null;

  return (
    <>
      <table className={`trade_recent_table ${props.className}`}>
        {props.head && (
          <thead>
            <tr>
              <th>Time</th>
              <th>Price</th>
              <th>Amount</th>
            </tr>
          </thead>
        )}
        <tbody>
          {props.priceTableData.map((d, i) => {
            const color = d.side === "b" ? "#27302F" : "#2C232D";
            const breakpoint = Math.round((d.td2 / maxQuantity) * 100);
            let rowStyle;
            if (props.useGradient) {
              rowStyle = {
                backgroundImage: `linear-gradient(to left, ${color}, ${color} ${breakpoint}%, #171c28 0%)`,
              };
            } else {
              rowStyle = {};
            }
            let time = "--:--:--"
            if(d.td1) time = new Date(d.td1).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
            const price =
              typeof d.td2 === "number" ? d.td2.toPrecision(6) : d.td2;
            const amount =
              typeof d.td3 === "number" ? d.td3.toPrecision(6) : d.td3;
            return (
              <tr key={i} style={rowStyle} onClick={() => onClickRow(d)}>
                <td> {time} </td>
                <td>{numStringToSymbol(price, 2)}</td>
                <td className={d.side === "b" ? "up_value" : "down_value"}>
                  {numStringToSymbol(amount, 2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default TradeRecentTable;
