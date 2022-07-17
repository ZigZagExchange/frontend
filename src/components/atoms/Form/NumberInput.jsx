import React from "react";
import styled from "styled-components";
import Input from "./Input";

const InputField = styled(Input)`
  padding: 4px 2px;
  border: 1px solid;
  border-color: ${({ theme }) => theme.colors.foreground300};
  &:focus {
    outline: none;
  }
  background: none;
  color: ${({ theme }) => theme.colors.foregroundHighEmphasis};
`;

const NumberInput = ({
  name,
  placeholder,
  validate,
  block,
  label,
  value,
  onChange,
  hideValidation,
  rightOfLabel,
  borderRadius = 4,
  fontSize = 18,
  className,
}) => {
  return (
    <InputField
      styles={className}
      name={name}
      placeholder={placeholder}
      validate={validate}
      label={label}
      value={value}
      onChange={onChange}
      hideValidation={hideValidation}
      rightOfLabel={rightOfLabel}
      type={"number"}
      w={block ? "100%" : "inherit"}
      fontSize={fontSize}
      borderRadius={borderRadius}
    />
  );
};

export default NumberInput;
