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
  activeIndex = 0,
  onItemClick,
  row,
  left,
  children,
  ...props
}) => {
  return (
    <Wrapper left={left} row={row} {...props}>
      {Children.map(children, (child, index) => {
        if (!child) return;
        return cloneElement(child, {
          isActive: activeIndex === index,
          row,
          left,
          onClick: onItemClick ? () => onItemClick(index) : undefined,
        });
      })}
    </Wrapper>
  );
};

export default ButtonMenu;
