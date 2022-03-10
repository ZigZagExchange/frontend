import React from "react";
import { HiExternalLink } from "react-icons/hi";
import styled from "@xstyled/styled-components";

const StyledTradeFooter = styled.footer`
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
  grid-area: footer;
  background: #171c28;
  font-size: 12px;
`;

const StyledStatus = styled.a`
  font-size: 12px;
  color: #94a2c9;
  text-decoration: none;
  display: flex;
  width: 5%;
  align-items: left;
  &:hover {
    color: white;
    text-decoration: underline;
  }
`;

const StyledStatus2 = styled.a`
  font-size: 12px;
  color: #94a2c9;
  text-decoration: none;
  display: flex;
  width: 15%;
  align-items: left;
  &:hover {
    color: white;
    text-decoration: underline;
  }
`;

export default function TradeFooter() {
  return (
    <StyledTradeFooter>
      <StyledStatus href="https://status.zigzag.exchange/ " target="_blank">
        Uptime Status
        <HiExternalLink />
      </StyledStatus>
      <StyledStatus2 href="https://docs.zigzag.exchange/zksync/token-info " target="_blank">
        Token Info
        <HiExternalLink />
      </StyledStatus2>
      <div>Powered By zkSync</div>
    </StyledTradeFooter>
  );
}
