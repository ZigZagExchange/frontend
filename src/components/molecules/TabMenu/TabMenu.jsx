import React, { cloneElement, Children, useEffect } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: grid;
  grid-auto-flow: ${({row}) => row ? 'row' : 'column'};
  justify-content: ${({row}) => row ? 'start' : 'space-evenly'};
  align-items: center;
  ${({row}) => row ? 'row-gap: 20px' : ''};
`;

const ButtonMenu = ({ activeIndex = 0, onItemClick, row, children, ...props }) => {
  useEffect(() => {
    localStorage.setItem("tab_index", activeIndex)
  }, [])
  return (
    <Wrapper row={row} {...props}>
        {Children.map(children, (child, index) => {
          return cloneElement(child, {
            isActive: activeIndex === index,
            row,
            onClick: onItemClick ? () => onItemClick(index) : undefined,
          });
        })}
    </Wrapper>
  );
};

export default ButtonMenu;
