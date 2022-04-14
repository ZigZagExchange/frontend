import React, { cloneElement, Children } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  justify-content: space-evenly;
  align-items: center;
`;

const ButtonMenu = ({ activeIndex = 0, onItemClick, children, ...props }) => {
  return (
    <Wrapper {...props}>
        {Children.map(children, (child, index) => {
          return cloneElement(child, {
            isActive: activeIndex === index,
            onClick: onItemClick ? () => onItemClick(index) : undefined,
          });
        })}
    </Wrapper>
  );
};

export default ButtonMenu;
