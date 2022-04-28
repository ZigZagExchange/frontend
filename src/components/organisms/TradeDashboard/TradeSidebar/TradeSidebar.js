import React from "react";
import styled from "@xstyled/styled-components";
import SpotBox from "./SpotBox/SpotBox";
import Text from "components/atoms/Text/Text";
import { DiscordIcon } from "components/atoms/Svg";
import Button from "components/molecules/Button/Button";

const StyledTradeSidebar = styled.aside`
  display: grid;
  grid-auto-flow: row;
  grid-area: sidebar;
  position: relative;
  height: fit-content;
  border: 1px solid ${({theme}) => theme.colors.foreground300};
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
`

export default function TradeSidebar(props) {
  const isMobile = window.innerWidth < 800
  return (
    <StyledTradeSidebar>
      {
        isMobile ? <></> : 
        <InfoWrapper>
          <Text font="primarySmall" color="foregroundHighEmphasis">Have a question? Need live support?</Text>
          <Button width="150px" startIcon={<DiscordIcon />} variant="outlined" scale="imd" mr="8px">
            <Text font="primaryBoldDisplay" color="foregroundHighEmphasis" textAlign="center">JOIN DISCORD</Text>
          </Button>
        </InfoWrapper>
      }
      <SpotBox
        lastPrice={props.lastPrice}
        user={props.user}
        activeOrderCount={props.activeOrderCount}
        liquidity={props.liquidity}
        currentMarket={props.currentMarket}
        marketSummary={props.marketSummary}
        marketInfo={props.marketInfo}
      />
    </StyledTradeSidebar>
  );
}
