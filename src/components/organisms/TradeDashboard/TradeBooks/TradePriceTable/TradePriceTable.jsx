import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import useTheme from "components/hooks/useTheme";
import {
  marketInfoSelector,
  settingsSelector,
} from "lib/store/features/api/apiSlice";
import { numStringToSymbol, addComma } from "lib/utils";
import Text from "components/atoms/Text/Text";

const Table = styled.table`
  display: flex;
  flex: auto;
  overflow: auto;
  padding: 0px;
  // height: ${({ isLeft }) => (isLeft ? "" : "242px")};
  flex-direction: column;
  scrollbar-color: ${({ theme }) => theme.colors.foreground400}
    rgba(0, 0, 0, 0.1);
  scrollbar-width: thin !important;

  &:not(.no-space) {
    justify-content: ${({ isLeft }) => (isLeft ? "space-between" : "start")};
  }

  &:first-type-of {
    height: 205px;
  }

  &:last-type-of {
    height: 181px;
  }

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
    background: ${(p) => p.theme.colors.backgroundHighEmphasis};
  }

  th {
    text-transform: uppercase;
    padding: 6px 0px;
  }

  th:nth-child(1),
  td:nth-child(1) {
    width: 20%;
    text-align: start;
    padding-left: 0px;
  }

  th:nth-child(2),
  td:nth-child(2) {
    width: 40%;
    text-align: center;
  }

  th:nth-child(3),
  td:nth-child(3) {
    width: 40%;
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
    border-radius: 4px;
    background: transparent;
    height: 23px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.foreground400};
  }
`;
const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.foreground400};
  margin-top: 20px;
`;

const TradePriceTable = (props) => {
  const { theme } = useTheme();
  const marketInfo = useSelector(marketInfoSelector);
  const settings = useSelector(settingsSelector);
  const ref = useRef(null);
  const [isUpdateScroll, setUpdateScroll] = useState(false);
  const isMobile = window.innerWidth < 500;

  useEffect(() => {
    if (!ref.current) return;
    if (props.priceTableData.length === 0) {
      setUpdateScroll(false);
      return;
    }
    if (props.scrollToBottom && !isUpdateScroll) {
      setUpdateScroll(true);
      ref.current?.scrollTo(0, ref.current.scrollHeight);
    }
  }, [props.priceTableData.length]);

  let total_total = 0;
  props.priceTableData.map((d) => (total_total += d.td2));
  let total_step = props.className === "trade_table_asks" ? total_total : 0;

  let onClickRow;
  if (props.onClickRow) onClickRow = props.onClickRow;
  else onClickRow = () => null;

  return (
    <Table ref={ref} className={props.adClass} isLeft={settings.stackOrderbook}>
      {props.head && (
        <thead>
          <tr>
            <th>
              <Text font="tableHeader" color="foregroundLowEmphasis">
                Price
              </Text>
            </th>
            <th>
              <Text
                font="tableHeader"
                color="foregroundLowEmphasis"
                textAlign="right"
              >
                Amount
              </Text>
            </th>
            {!isMobile && (
              <th>
                <Text
                  font="tableHeader"
                  color="foregroundLowEmphasis"
                  textAlign="right"
                >
                  Total(
                  {marketInfo && marketInfo.quoteAsset.symbol})
                </Text>
              </th>
            )}
          </tr>
        </thead>
      )}
      <tbody>
        {props.priceTableData.map((d, i) => {
          const color =
            d.side === "b" ? theme.colors.success400 : theme.colors.danger400;
          if (props.className !== "trade_table_asks") {
            total_step += d.td2;
          }

          const breakpoint = Math.round((total_step / total_total) * 100);
          let rowStyle;
          if (props.useGradient) {
            let dir;
            if (
              (d.side === "b" && !settings.stackOrderbook) ||
              (d.side !== "b" && settings.stackOrderbook)
            )
              dir = "to left";
            else dir = "to right";
            rowStyle = {
              background: `linear-gradient(${dir}, ${color}, ${color} ${breakpoint}%, ${theme.colors.backgroundHighEmphasis} 0%)`,
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

          // reduce after, net one needs to be this percentage
          if (props.className === "trade_table_asks") {
            total_step -= d.td2;
          }
          return (
            <tr key={i} style={rowStyle} onClick={() => onClickRow(d)}>
              <td>
                <Text
                  font="tableContent"
                  color={
                    d.side === "b"
                      ? "successHighEmphasis"
                      : "dangerHighEmphasis"
                  }
                >
                  {price}
                </Text>
              </td>
              <td>
                <Text
                  font="tableContent"
                  color="foregroundHighEmphasis"
                  textAlign="right"
                >
                  
                  {
                    addComma(Number(numStringToSymbol(amount, 2)))
                  }
                </Text>
              </td>
              {!isMobile && (
                <td>
                  <Text
                    font="tableContent"
                    color="foregroundHighEmphasis"
                    textAlign="right"
                  >
                    {/* {numStringToSymbol(total, 2)} */}
                    {addComma(total)}
                  </Text>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default TradePriceTable;
