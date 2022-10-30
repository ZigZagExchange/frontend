import React from "react";
import styled from "@xstyled/styled-components";
import OrdersTable from "./OrdersTable/OrdersTable";
import useTheme from "components/hooks/useTheme";

const StyledTradeTables = styled.section`
  display: flex;
  grid-area: tables;
  background-color: ${({ theme, isDark }) =>
    isDark
      ? theme.colors.backgroundMediumEmphasis
      : theme.colors.backgroundHighEmphasis};
  overflow: hidden;

  // @media screen and (max-width: 991px) {
  //   height: 300px;
  // }
`;

export default function TradeTables(props) {
  const { isDark } = useTheme();
  return (
    <StyledTradeTables isDark={isDark}>
      <OrdersTable
        userFills={props.userFills}
        userOrders={props.userOrders}
        user={props.user}
        settings={props.settings}
        network={props.network}
      />
    </StyledTradeTables>
  );
}
