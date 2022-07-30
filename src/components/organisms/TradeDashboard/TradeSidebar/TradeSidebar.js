import React from "react";
import { useSelector } from "react-redux";
import styled from "@xstyled/styled-components";
import SpotBox from "./SpotBox/SpotBox";
import Text from "components/atoms/Text/Text";
import { DiscordIcon } from "components/atoms/Svg";
import {
  liquiditySelector,
  balancesSelector,
} from "lib/store/features/api/apiSlice";
import { Button } from "components/molecules/Button";
import useTheme from "components/hooks/useTheme";

const StyledTradeSidebar = styled.aside`
  // display: grid;
  grid-auto-flow: row;
  grid-area: sidebar;
  position: relative;
  //   height: fit-content;
  border: 1px solid ${({ theme }) => theme.colors.foreground300};
  background: ${({ theme, isDark }) =>
    isDark
      ? theme.colors.backgroundMediumEmphasis
      : theme.colors.backgroundHighEmphasis};
  // overflow-y: hidden;
  scrollbar-color: ${({ theme }) => theme.colors.foreground400}
    rgba(0, 0, 0, 0.1);

  overflow: auto;
  // scrollbar-width: none !important;

  // ::-webkit-scrollbar {
  //   width: 5px;
  //   position: relative;
  //   z-index: 20;
  // }

  //   ::-webkit-scrollbar-track {
  //     border-radius: 4px;
  //     background: transparent;
  //     height: 23px;
  //   }

  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.foreground400};
  }
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 98px;
  background-color: ${({ theme, isDark }) =>
    isDark
      ? theme.colors.backgroundMediumEmphasis
      : theme.colors.backgroundHighEmphasis};
  border-bottom: 1px solid ${({ theme }) => theme.colors.foreground400};
`;

export default function TradeSidebar(props) {
  const balances = useSelector(balancesSelector);
  const liquidity = useSelector(liquiditySelector);
  const { isDark } = useTheme();
  const isMobile = window.innerWidth < 992;
  const isSmallScreen = window.innerHeight < 875;
  const joinDiscord = () => {
    window.open("https://discord.gg/zigzag", "_blank");
  };
  return (
    <StyledTradeSidebar isDark={isDark}>
      {isMobile || isSmallScreen ? (
        <></>
      ) : (
        <InfoWrapper isDark={isDark}>
          <Text font="primarySmall" color="foregroundHighEmphasis">
            Have a question? Need live support?
          </Text>
          <Button
            width="150px"
            startIcon={<DiscordIcon />}
            variant="outlined"
            scale="imd"
            mr="8px"
            onClick={joinDiscord}
          >
            <Text
              font="primaryBoldDisplay"
              color="foregroundHighEmphasis"
              textAlign="center"
            >
              JOIN DISCORD
            </Text>
          </Button>
        </InfoWrapper>
      )}
      <SpotBox
        lastPrice={props.lastPrice}
        user={props.user}
        activeOrderCount={props.activeOrderCount}
        liquidity={liquidity}
        currentMarket={props.currentMarket}
        marketSummary={props.marketInfo}
        marketInfo={props.marketInfo}
        balances={balances}
        askBins={props.askBins}
        bidBins={props.bidBins}
        userOrders={props.userOrders}
      />
    </StyledTradeSidebar>
  );
}
