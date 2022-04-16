import React from "react";
import styled from "styled-components";
import StyledTab from "./StyledTab";
import Text from "../../atoms/Text/Text";

const Divider = styled.div`
    height: 4px;
    width: 100%;
    background: linear-gradient(93.46deg, ${({ theme }) => theme.colors.primaryHighEmphasis} 16.94%, ${({ theme }) => theme.colors.secondaryHighEmphasis} 97.24%);
`

const Wrapper = styled.div`
    width: 100%;
    height: 4px;
`

const Tab = ({ isActive = false, onClick, children }) => {
  return (
    <StyledTab onClick={onClick}>
      <Text font="primaryExtraSmallSemiBold" color="foregroundHighEmphasis">
        {children}
      </Text>
      {
        isActive ?
        <Divider /> :
        <Wrapper />
      }
    </StyledTab>
  );
};
export default Tab;
