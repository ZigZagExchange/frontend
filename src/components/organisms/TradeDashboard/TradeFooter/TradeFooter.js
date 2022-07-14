import React from "react";
import styled from "@xstyled/styled-components";
import { DiscordIcon, TelegramIcon, TwitterIcon } from "components/atoms/Svg";
import Text from "components/atoms/Text/Text";

const StyledTradeFooter = styled.footer`
  display: ${({ isMobile }) => (isMobile ? "grid" : "flex")};
  align-items: center;
  padding: 0 20px;
  justify-content: ${({ isMobile }) => (isMobile ? "center" : "space-between")};
  grid-area: footer;
  background: ${({ theme }) => theme.colors.backgroundDisabled};
  border-top: 1px solid ${({ theme }) => theme.colors.foreground400};
  font-size: 12px;
  height: 57px;
`;

const SocialWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-items: center;
  width: 120px;
`;

const SocialLink = styled.a`
  svg path {
    transition: fill 0.25s;
    fill: ${({ theme }) => theme.colors.foregroundLowEmphasis};
  }

  &:hover {
    svg path {
      fill: ${({ theme }) => theme.colors.primaryHighEmphasis};
    }
  }
`;

const StyledLinkBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export default function TradeFooter() {
  const isMobile = window.innerWidth < 430;
  return (
    <StyledTradeFooter isMobile={isMobile}>
      <Text
        font="primaryMediumBody"
        color="foregroundLowEmphasis"
        textAlign={isMobile ? "center" : "left"}
      >
        ZigZag Exchange © 2022
      </Text>
      <StyledLinkBox>
        <SocialWrapper>
          <SocialLink
            target="_blank"
            rel="noreferrer"
            href="https://discord.gg/zigzag"
          >
            <DiscordIcon />
          </SocialLink>
          <SocialLink
            target="_blank"
            rel="noreferrer"
            href="https://twitter.com/ZigZagExchange"
          >
            <TwitterIcon />
          </SocialLink>
          <SocialLink
            target="_blank"
            rel="noreferrer"
            href="https://t.me/zigzagexchange"
          >
            <TelegramIcon />
          </SocialLink>
        </SocialWrapper>
        <Text font="primaryMediumBody" color="foregroundLowEmphasis">
          Powered By zkSync
        </Text>
      </StyledLinkBox>
    </StyledTradeFooter>
  );
}
