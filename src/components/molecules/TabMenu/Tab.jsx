import React from "react";
import styled from "styled-components";
import StyledTab from "./StyledTab";
import Text from "../../atoms/Text/Text";

const StyledText = styled(Text)`
  width: fit-content;
  padding-bottom: ${({ row }) => row ? '8px' : '16px'};
  color: ${({ left, isActive, theme }) => isActive ? `${theme.colors.primaryHighEmphasis} !important` : !isActive ? `${theme.colors.foregroundMediumEmphasis} !important` : ''};
  transition: color .25s;

  &:hover {
    color: ${({ isActive, theme }) => !isActive ? `${theme.colors.primaryHighEmphasis} !important` : ""
  }
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
