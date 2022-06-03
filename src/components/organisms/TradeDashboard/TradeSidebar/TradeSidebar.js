import React from "react";
import styled from "@xstyled/styled-components";
import SpotBox from "./SpotBox/SpotBox";
import Text from "components/atoms/Text/Text";
import { DiscordIcon } from "components/atoms/Svg";
import { Button, ConnectWalletButton } from "components/molecules/Button"

const StyledTradeSidebar = styled.aside`
  display: grid;
  grid-auto-flow: row;
  grid-area: sidebar;
  position: relative;
  height: fit-content;
  border: 1px solid ${({ theme }) => theme.colors.foreground300};
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
  const isMobile = window.innerWidth < 992
  const joinDiscord = () => {
    window.open('https://discord.gg/zigzag', '_blank')
  }
  return (
    <StyledTradeSidebar>
      {
        isMobile ? <></> :
          <InfoWrapper>
            <Text font="primarySmall" color="foregroundHighEmphasis">
              {props.user.id ? 'Have a question? Need live support?' : 'You have not connected your wallet.'}
            </Text>
            {props.user.id ? (
              <Button width="150px" startIcon={<DiscordIcon />} variant="outlined" scale="imd" mr="8px" onClick={joinDiscord}>
                <Text font="primaryBoldDisplay" color="foregroundHighEmphasis" textAlign="center">JOIN DISCORD</Text>
              </Button>
            ) : (
              <ConnectWalletButton width="fit-content" />
            )}
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
