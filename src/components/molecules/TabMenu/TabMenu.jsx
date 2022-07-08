import React, { cloneElement, Children } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: grid;
  grid-auto-flow: ${({ row }) => (row ? "row" : "column")};
  justify-content: ${({ row, left }) =>
    row || left ? "start" : "space-evenly"};
  align-items: center;
  ${({ row }) => (row ? "row-gap: 20px" : "")};
  ${({ left }) => (left ? "gap: 32px" : "")};
`;

const ButtonMenu = ({
  activeTab = 'TRADE',
  onItemClick,
  row,
  left,
  children,
  ...props
}) => {
  return (
    <Wrapper left={left} row={row} {...props}>
      {Children.map(children, (child) => {
        if (!child) return
        return cloneElement(child, {
          isActive: activeTab === child.props.className,
          row,
          left,
          onClick: onItemClick ? () => onItemClick(child.props.className) : undefined,
        });
      })}
    </Wrapper>
  );
};

export default ButtonMenu;
