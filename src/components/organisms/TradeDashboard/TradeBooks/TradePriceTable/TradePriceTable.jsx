import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import useTheme from "components/hooks/useTheme";
import { numStringToSymbol, addComma, formatMillonAmount } from "lib/utils";
import Text from "components/atoms/Text/Text";
import _ from "lodash";

const Table = styled.table`
  display: flex;
  flex: auto;
  overflow: auto;
  padding: 0 0 1px 0;
  height: ${({ isLeft }) => (isLeft ? "" : "249px")};
  flex-direction: column;
  scrollbar-color: ${({ theme }) => theme.colors.foreground400}
    rgba(0, 0, 0, 0.1);
  scrollbar-width: thin !important;

  &.trade_tables_all {
    flex: 0 0 calc(50% - 76px);
  }

  &.trade_tables_all.trade_table_asks {
    flex: 0 0 calc(50% - 47px);
  }

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

  .price-item {
    position: relative;

    td {
      position: relative;
      z-index: 1;
    }

    &::after {
      content: " ";
      display: block;
      position: absolute;
      width: 100%;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-image: var(--background-image);
      background-size: cover;
    }
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

const TradePriceTable = (props) => {
  const { theme } = useTheme();
  const ref = useRef(null);
  const [isUpdateScroll, setUpdateScroll] = useState(false);
  const [priceData, setPriceData] = useState([])
  const isMobile = window.innerWidth < 500;

  const ua = navigator.userAgent.toLowerCase();
  let isSafari = false;
  if (ua.indexOf("safari") != -1) {
    if (ua.indexOf("chrome") === -1) {
      isSafari = true;
    }
  }

  useEffect(()=>{
    const tmp = _.cloneDeep(props.priceTableData);
    if(props.priceTableData[0]?.side === "s" && !props.settings?.stackOrderbook) {
      tmp.reverse();
    }
    setPriceData(tmp)
  }, [props.priceTableData])

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

  let total_total = 0,
    total_step = 0;
  props.priceTableData.map((d) => (total_total += d.td2));
  if (props.priceTableData.length > 0 && props.priceTableData[0].side === "s") {
    total_step = total_total;
  }

  let onClickRow;
  if (props.onClickRow) onClickRow = props.onClickRow;
  else onClickRow = () => null;

  return (
    <Table
      ref={ref}
      className={props.adClass}
      isLeft={props.settings?.stackOrderbook}
    >
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
                  Total({props.marketInfo && props.marketInfo.quoteAsset.symbol}
                  )
                </Text>
              </th>
            )}
          </tr>
        </thead>
      )}
      <tbody>
        { priceData.map((d, i) => {
          const color =
            d.side === "b" ? theme.colors.success400 : theme.colors.danger400;

          let rowStyle;
          if (props.useGradient) {
            let dir
            if(!props.settings?.stackOrderbook)
              dir = "to left"
            else dir = "to right"

            if (d.side === "b") {
              total_step += d.td2;
            }
            const breakpoint = Math.round((total_step / total_total) * 100);
            if (d.side === "s") {
              total_step -= d.td2;
            }
            if(!props.settings?.stackOrderbook && d.side === "s"){
              rowStyle = {
                "--background-image": `linear-gradient(${dir}, ${theme.colors.backgroundHighEmphasis}, ${theme.colors.backgroundHighEmphasis} ${breakpoint}%, ${color} 0%)`,
              };
            }
            else{
              rowStyle = {
                "--background-image": `linear-gradient(${dir}, ${color}, ${color} ${breakpoint}%, ${theme.colors.backgroundHighEmphasis} 0%)`,              
              };
            }

            // reduce after, next one needs to be this percentage
            if (props.className === "trade_table_asks") {
              total_step -= d.td2;
            }
          } else {
            rowStyle = "";
          }
          const price =
            typeof d.td1 === "number" ? d.td1.toPrecision(6) : d.td1;
          const amount =
            typeof d.td2 === "number" ? d.td2.toPrecision(6) : d.td2;
          const total =
            typeof d.td3 === "number" ? d.td3.toPrecision(6) : d.td3;

          return isSafari ? (
            <div className="price-item" style={rowStyle}>
              <tr key={i} onClick={() => onClickRow(d)}>
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
                    {formatMillonAmount(amount)}
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
                      {formatMillonAmount(total)}
                    </Text>
                  </td>
                )}
              </tr>
            </div>
          ) : (
            <tr
              key={i}
              onClick={() => onClickRow(d)}
              className="price-item"
              style={rowStyle}
            >
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
                  {formatMillonAmount(amount)}
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
                    {formatMillonAmount(total)}
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
