import React from "react";
import styled from "styled-components";
import Text from "../Text/Text";

import { SearchIcon } from "../Svg";

const InputFieldWrapper = styled.div`
  display: flex;
  flex-direction: ${({ inline }) => (inline ? "row" : "column")};
  gap: ${({ inline }) => (inline ? "16px" : "0px")};
  width: 100%;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  align-items: center;
  width: 100%;
`;

const LabelWrapper = styled.div`
  display: flex;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 10.67px;
`;

const Input = styled.input`
  background: ${({ theme }) => theme.colors.foreground100};
  border: 1px solid ${({ theme }) => theme.colors.foreground500};
  border-radius: 8px;
  padding: 8px;
  padding-left: ${({ icon }) => (icon ? "28px" : "8px")};
  display: block;
  font-family: 'WorkSans-Regular';
  font-size: 14px;
  line-height: 15px;
  color: ${({ theme }) => theme.colors.foregroundHighEmphasis};
  height: 31px;
  outline: 0;
  text-align: left;
  width: 100%;
  transition: color .25s;
  &::placeholder {
    color: ${({ theme }) => theme.colors.foregroundLowEmphasis};
  }
  &:focus:not(:disabled) {
    background:
      linear-gradient(${({ theme }) => theme.colors.backgroundLowEmphasis}, ${({
  theme,
}) => theme.colors.backgroundLowEmphasis}) padding-box,
      linear-gradient(93.46deg, ${({ theme }) =>
        theme.colors.primaryHighEmphasis} 16.94%, ${({ theme }) =>
  theme.colors.secondaryHighEmphasis} 97.24%) border-box;
    border: 1px solid transparent;
  }
  &:hover {
    background:
      linear-gradient(${({ theme }) => theme.colors.backgroundLowEmphasis}, ${({
  theme,
}) => theme.colors.backgroundLowEmphasis}) padding-box,
      linear-gradient(93.46deg, ${({ theme }) =>
        theme.colors.primary500} 16.94%, ${({ theme }) =>
  theme.colors.secondary500} 97.24%) border-box;
    border: 1px solid transparent;
    color: ${({ show, theme }) =>
      !show ? `${theme.colors.primaryHighEmphasis} !important` : ""}
`;

const InputField = ({ ...props }) => {
  const { icon, label, inline, fontSize } = props;

  const getIcon = () => {
    switch (icon) {
      case "search":
        return <SearchIcon size={12} />;
      default:
        return <></>;
    }
  };

  return (
    <InputFieldWrapper inline={inline}>
      {label && (
        <LabelWrapper>
          <Text
            font="primaryBody2"
            color="foregroundHighEmphasis"
            fontSize={fontSize}
            mb={inline ? "0px" : "8px"}
            style={{ margin: inline ? "auto" : "" }}
          >
            {label}
          </Text>
        </LabelWrapper>
      )}
      <InputWrapper>
        <IconWrapper>{getIcon()}</IconWrapper>
        <Input {...props} />
      </InputWrapper>
    </InputFieldWrapper>
  );
};

export default InputField;
