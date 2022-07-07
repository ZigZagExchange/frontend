import React from "react";
import { useSelector } from "react-redux";
import styled from "@xstyled/styled-components";
import SpotBox from "./SpotBox/SpotBox";
import Text from "components/atoms/Text/Text";
import { DiscordIcon } from "components/atoms/Svg";
import {
  liquiditySelector,
  marketSummarySelector,
  marketInfoSelector,
} from "lib/store/features/api/apiSlice";
import { Button, ConnectWalletButton } from "components/molecules/Button";

const StyledTradeSidebar = styled.aside`
  // display: grid;
  grid-auto-flow: row;
  grid-area: sidebar;
  position: relative;
  //   height: fit-content;
  // border: 1px solid ${({ theme }) => theme.colors.foreground300};
  background: ${({ theme }) => theme.colors.backgroundMediumEmphasis};
  overflow-y: auto;
  scrollbar-color: ${({ theme }) => theme.colors.foreground400}
    rgba(0, 0, 0, 0.1);
  scrollbar-width: thin !important;

  ::-webkit-scrollbar {
    width: 5px;
    position: relative;
    z-index: 20;
  }

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
  background-color: ${({ theme }) => theme.colors.backgroundMediumEmphasis};
  border-bottom: 1px solid ${({ theme }) => theme.colors.foreground400};
`;

export default function TradeSidebar(props) {
  const marketInfo = useSelector(marketInfoSelector);
  const marketSummary = useSelector(marketSummarySelector);
  const liquidity = useSelector(liquiditySelector);
  const isMobile = window.innerWidth < 992;
  const joinDiscord = () => {
    window.open("https://discord.gg/zigzag", "_blank");
  };
  return (
    <StyledTradeSidebar>
      {isMobile ? (
        <></>
      ) : (
        <InfoWrapper>
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
        lastPrice={marketSummary.price}
        user={props.user}
        activeOrderCount={props.activeOrderCount}
        liquidity={liquidity}
        currentMarket={props.currentMarket}
        marketSummary={marketSummary}
        marketInfo={marketInfo}
      />
    </StyledTradeSidebar>
  );
}
