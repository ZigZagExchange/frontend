import React from "react";
import { useSelector } from "react-redux";
import styled from "@xstyled/styled-components";
import TradeRecentTable from "./TradeRecentTable/TradeRecentTable";
import { marketFillsSelector } from "lib/store/features/api/apiSlice";
import Text from "components/atoms/Text/Text";
import { settingsSelector } from "lib/store/features/api/apiSlice";

const StyledTradeBooks = styled.section`
  display: flex;
  grid-area: trades;
  flex-direction: row;
  justify-content: space-between;
  padding: ${({ isStack }) => (isStack ? "10px" : "10px 0 10px 0")};
  margin: ${({ isStack }) => (isStack ? "0": "0 10px 0 10px")};
  border-top: 1px solid ${({ theme }) => theme.colors.foreground400};
  border-bottom: 1px solid ${({ isStack, theme }) => (isStack ? theme.colors.foreground400 : "none")};
`;

const TradesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
  padding-top: 10px;
`;

export default function TradesBook(props) {
  const marketFills = useSelector(marketFillsSelector);
  const settings = useSelector(settingsSelector);

  // Only display recent trades
  // There's a bunch of user trades in this list that are too old to display
  const fillData = [];
  const one_day_ago = Date.now() - 86400 * 1000;
  Object.values(marketFills)
    .filter((fill) => Date.parse(fill[12]) > one_day_ago)
    .filter((fill) => fill[6] === "f")
    .sort((a, b) => b[1] - a[1])
    .forEach((fill) => {
      fillData.push({
        td1: fill[12], // timestamp
        td2: Number(fill[4]), // price
        td3: Number(fill[5]), // amount
        side: fill[3],
      });
    });
  let openOrdersLatestTradesData = fillData;

  return (
    <>
      <StyledTradeBooks isStack={settings.stackOrderbook}>
        <TradesWrapper>
          {/* TradePriceTable*/}
          <Text
            style={{ paddingBottom: "5px" }}
            font="primaryTitleDisplay"
            color="foregroundHighEmphasis"
          >
            Market Trades
          </Text>
          <TradeRecentTable
            head
            value="up_value"
            priceTableData={openOrdersLatestTradesData}
            currentMarket={props.currentMarket}
            side={props.side}
          />
        </TradesWrapper>
      </StyledTradeBooks>
    </>
  );
}
