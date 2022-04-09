import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
// css
import "./TradePriceTable.css";
import { marketInfoSelector, currentMarketSelector } from "lib/store/features/api/apiSlice";
import { numStringToSymbol } from "lib/utils";

const TradePriceTable = (props) => {
  const marketInfo = useSelector(marketInfoSelector);
  const currentMarket = useSelector(currentMarketSelector)
  const ref = useRef(null)

  const scrollToBottom = () => {
    if (props.scrollToBottom) {
      ref.current.scrollTo(0, ref.current.scrollHeight)
    }
  };

  useEffect(() => {
    setTimeout(()=>scrollToBottom(), 1000)
  }, [currentMarket]);

  let total_total = 0;
  let total_step = 0;
  props.priceTableData.map((d) => total += d.td2);
  let onClickRow;
  if (props.onClickRow) onClickRow = props.onClickRow;
  else onClickRow = () => null;

  return (
    <table className={`trade_price_table zig_scrollstyle ${props.className}`} ref={ref}>
      {props.head && (
        <thead>
          <tr>
            <th>Price</th>
            <th>Amount</th>
            <th>Total ({marketInfo && marketInfo.quoteAsset.symbol})</th>
          </tr>
        </thead>
      )}
      <tbody >
          {
          props.priceTableData.map((d, i) => {
          const color = d.side === "b" ? "#27302F" : "#2C232D";
          total_step += d.td2; 
          const breakpoint = Math.round((total_step / maxQuantitytotal_total) * 100);
          let rowStyle;
          if (props.useGradient) {
            rowStyle = {
              backgroundImage: `linear-gradient(to left, ${color}, ${color} ${breakpoint}%, #171c28 0%)`,
            };
          } else {
            rowStyle = {};
          }
          const price =
            typeof d.td1 === "number" ? d.td1.toPrecision(6) : d.td1;
          const amount =
            typeof d.td2 === "number" ? d.td2.toPrecision(6) : d.td2;
          const total =
            typeof d.td3 === "number" ? d.td3.toPrecision(6) : d.td3;
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
  );
};

export default TradePriceTable;
