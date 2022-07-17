import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Text from "../Text/Text";

const getSize = ({ Size }) => {
  switch (Size) {
    case "Small":
      return 14;
    case "Medium":
      return 16;
    case "Large":
      return 20;
    default:
      return 14;
  }
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: fit-content;
  margin: 3px;
`;
const Container = styled.div`
  display: flex;
  border: 1px solid ${({ theme }) => theme.colors.foregroundHighEmphasis};
  border-radius: 4px;
  width: ${getSize}px;
  height: ${getSize}px;
  cursor: pointer;
`;
const CheckBoxIcon = styled.div`
  margin: auto;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: linear-gradient(
    93.46deg,
    ${({ theme }) => theme.colors.primaryHighEmphasis} 16.94%,
    ${({ theme }) => theme.colors.secondaryHighEmphasis} 97.24%
  );
`;
const ChildWrapper = styled.div`
  line-height: ${getSize}px;
`;
const CheckBox = ({ ...props }) => {
  const { isChecked, Size, State, children, onChange, labelRight, labelLeft } =
    props;

  const [_isChecked, setCheck] = useState(isChecked);
  const [_state] = useState(State ?? "Default");
  // setState ^^^

  const handleClick = () => {
    setCheck(!_isChecked);
    return !_isChecked;
  };

  const getCheckIcon = () => {
    if (_isChecked) {
      return <CheckBoxIcon />;
    }
    return <></>;
  };

  useEffect(() => {
    if (onChange) {
      onChange(_isChecked);
    }
  }, [onChange, _isChecked]);

  useEffect(() => {
    if (_state === "PreChecked") {
      setCheck(true);
    }
  }, [_state]);

  return (
    <Wrapper {...props}>
      {labelLeft && (
        <ChildWrapper Size={Size} labelRight={labelRight}>
          <Text font="primarySmall" color="foregroundHighEmphasis" mr="11px">
            {children}
          </Text>
        </ChildWrapper>
      )}
      <Container State={_state} Size={Size} onClick={handleClick}>
        {getCheckIcon()}
      </Container>
      {(labelRight || (!labelLeft && !labelRight)) && (
        <ChildWrapper Size={Size} labelRight={labelRight}>
          <Text font="primarySmall" color="foregroundHighEmphasis" ml="11px">
            {children}
          </Text>
        </ChildWrapper>
      )}
    </Wrapper>
  );
};

export default CheckBox;
