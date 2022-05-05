import React, { useEffect } from "react";
import styled from "styled-components";
// css
import "./TradeRecentTable.css";
import useTheme from "components/hooks/useTheme";
import { numStringToSymbol } from "lib/utils";
import Text from "components/atoms/Text/Text";

const Table = styled.table`
  display: flex;
  flex: auto;
  overflow: auto;
  height: 200px;
  padding: 0px;
  flex-direction: column;

  tbody {
    width: 100%;
    display: table;
    background-position: top right;
    background-size: 70% 100%;
    background-repeat: no-repeat;
    margin-top: 0;
  }
  
  thead {
    position: sticky;
    top: 0;
    display: table;
    width: 100%;
    background-color: ${({theme}) => theme.colors.backgroundHighEmphasis};
  }

  th {
    text-transform: uppercase;
    padding: 6px 0px;
  }

  th:nth-child(1), td:nth-child(1) {
    width: 30%;
    text-align: start;
    padding-left: 0px;
  }

  th:nth-child(2), td:nth-child(2) {
    width: 40%;
    text-align: center;
  }
  
  th:nth-child(3), td:nth-child(3) {
    width: 30%;
    text-align: right;
    white-space: nowrap;
    padding-right: 0px;
  }
  
  @media screen and (min-width: 1800px) {
    width: 100%;
  }
  
  @media screen and (max-width: 991px) {
    width: 100%;
  }
  
  ::-webkit-scrollbar {
    width: 5px;
    position: relative;
    z-index: 20;
  }
  
  ::-webkit-scrollbar-track {
    border-radius: 0px;
    background: ${({theme}) => theme.colors.backgroundHighEmphasis};
    height: 23px;
  }
  
  ::-webkit-scrollbar-thumb {
    border-radius: 0px;
    background: ${({theme}) => theme.colors.foreground400};
  }
  
  ::-webkit-scrollbar-thumb:window-inactive {
    background: #fff;
  }
`

const TradeRecentTable = (props) => {
  const { theme } = useTheme()
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
      <Table>
        {props.head && (
          <thead>
            <tr>
              <th><Text font="tableHeader" color="foregroundLowEmphasis">Price</Text></th>
              <th><Text font="tableHeader" color="foregroundLowEmphasis" textAlign="right">Amount</Text></th>
              <th><Text font="tableHeader" color="foregroundLowEmphasis" textAlign="right">Time</Text></th>
            </tr>
          </thead>
        )}
        <tbody>
          {props.priceTableData.map((d, i) => {
            const color = d.side === "b" ? theme.colors.success400 : theme.colors.danger400;
            const breakpoint = Math.round((d.td2 / maxQuantity) * 100);
            let rowStyle;
            if (props.useGradient) {
              rowStyle = {
                backgroundImage: `linear-gradient(to left, ${color}, ${color} ${breakpoint}%, ${theme.colors.backgroundHighEmphasis} 0%)`,
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
                <td>
                  <Text font="tableContent" color={d.side === "b" ? "successHighEmphasis" : "dangerHighEmphasis"}>{numStringToSymbol(price, 2)}</Text>
                </td>
                <td>
                  <Text font="tableContent" color="foregroundHighEmphasis" textAlign="right">{numStringToSymbol(amount, 2)}</Text>
                </td>
                <td> 
                  <Text font="tableContent" color="foregroundHighEmphasis" textAlign="right">{time}</Text>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
};

export default TradeRecentTable;
