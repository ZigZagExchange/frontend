import React from "react";
import styled from "styled-components";

const PaneWrapper = styled.div`
  ${(p) =>
    p.size === "xs"
      ? "border-radius: 1px; padding: 2px;"
      : p.size === "sm"
      ? "border-radius: 4px; padding: 7px;"
      : "border-radius: 6px; padding: 8px;"};
  background-color: ${(p) => p.theme.colors.backgroundLowEmphasis};
`;

const Pane = ({ size = "sm", variant = "dark", children, ...rest }) => {
  return (
    <PaneWrapper size={size} {...rest}>
      {children && children}
    </PaneWrapper>
  );
};

export default Pane;
