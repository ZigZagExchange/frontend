import React from "react";
import styled from "@xstyled/styled-components";
import OrdersTable from "./OrdersTable/OrdersTable";

const StyledTradeTables = styled.section`
  display: flex;
  grid-area: tables;
  background-color: ${({ theme }) => theme.colors.backgroundMediumEmphasis};
  overflow: hidden;

  @media screen and (max-width: 991px) {
    height: 300px;
  }
`;

export default function TradeTables(props) {
  return (
    <StyledTradeTables>
      <OrdersTable
        userFills={props.userFills}
        userOrders={props.userOrders}
        user={props.user}
        wallet={props.wallet}
      />
    </StyledTradeTables>
  );
}
