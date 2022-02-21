import React from "react";
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

export default function TradeFooter() {
  return (
    <StyledTradeFooter>
      <div></div>
      <div>Powered By zkSync</div>
    </StyledTradeFooter>
  );
}
