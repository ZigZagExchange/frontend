import React, { useEffect } from "react";
import { useSelector } from "react-redux";
// css
import "./TradePriceTable.css";
import {
  marketInfoSelector,
} from "lib/store/features/api/apiSlice";
import { numStringToSymbol } from "lib/utils";

const TradePriceTable = (props) => {
    const marketInfo = useSelector(marketInfoSelector);
    const scrollToBottom = () => {
        if (props.scrollToBottom) {
            const tableDiv = document.getElementsByClassName(props.className);
            if (tableDiv.length > 0) tableDiv[0].scrollTop = tableDiv[0].scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [props.priceTableData])

    const maxQuantity = Math.max(
        ...props.priceTableData.map((d) => d.td2)
    );
    let onClickRow;
    if (props.onClickRow) onClickRow = props.onClickRow;
    else onClickRow = () => null;

    return (
      <>
        <table className={`trade_price_table ${props.className}`}>
          <thead>
            <tr>
              <th>Price</th>
              <th>Amount</th>
              <th>Total ({marketInfo && marketInfo.quoteAsset.symbol})</th>
            </tr>
          </thead>
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
              const price = typeof d.td1 === "number" ? d.td1.toPrecision(6) : d.td1;
              const amount = typeof d.td2 === "number" ? d.td2.toPrecision(6) : d.td2;
              const total = typeof d.td3 === "number" ? d.td3.toPrecision(6) : d.td3;
              return (
                <tr key={i} style={rowStyle} onClick={() => onClickRow(d)}>
                  <td className={d.side === "b" ? "up_value" : "down_value"}>
                    {price}
                  </td>
                  <td>{numStringToSymbol(amount, 2)}</td>
                  <td>{numStringToSymbol(total, 2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    );
}

export default TradePriceTable;
