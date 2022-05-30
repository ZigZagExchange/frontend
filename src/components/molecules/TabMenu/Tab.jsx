import React from "react";
import styled from "styled-components";
import StyledTab from "./StyledTab";
import Text from "../../atoms/Text/Text";

const StyledText = styled(Text)`
  width: fit-content;
  padding-bottom: ${({ row }) => row ? '8px' : '16px'};
  ${({ isActive, theme }) => isActive ?
    `background:
    linear-gradient(93.46deg, ${theme.colors.primaryHighEmphasis} 16.94%, ${theme.colors.secondaryHighEmphasis} 97.24%)
    left 
    bottom
    transparent    
    no-repeat; 
  background-size:100% 4px;` : ''}
  color: ${({ left, isActive, theme }) => isActive && left ? `${theme.colors.foregroundHighEmphasis} !important` : !isActive && left ? `${theme.colors.foregroundMediumEmphasis} !important` : ''};
`

const Tab = ({ isActive = false, row = false, left = false, onClick, children }) => {
  return (
    <StyledTab onClick={onClick}>
      <StyledText isActive={isActive} left={left} row={row} font="primaryExtraSmallSemiBold" color="foregroundHighEmphasis">
        {children}
      </StyledText>
    </StyledTab>
  );
};
export default Tab;
