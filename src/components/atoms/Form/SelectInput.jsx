import React from "react";
import styled from "styled-components";
import Input from "./Input";
import { x } from "@xstyled/styled-components";

const InputField = styled(Input)`
  cursor: pointer;
  padding: 5px;
  border: 1px solid;
  border-color: ${({ theme }) => theme.colors.foreground300};
  &:focus {
    outline: none;
  }
  &::before {
    border: solid ${({ theme }) => theme.colors.foregroundHighEmphasis};
  }
  background: none;
  color: ${({ theme }) => theme.colors.foregroundHighEmphasis};
`;

const SelectWrapper = styled.div`
  position: relative;
  height: 100%;
  &::before {
    content: "";
    font-size: 1rem;
    top: 38px;
    right: 14px;
    position: absolute;
    border: solid ${({ theme }) => theme.colors.foregroundHighEmphasis};
    border-width: 0 2px 2px 0;
    display: inline-block;
    padding: 2px;
    transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
  }
`;

const SelectInput = ({
  name,
  validate,
  label,
  onChange,
  hideValidation,
  value,
  items,
  rightOfLabel,
  fontSize = 18,
  borderRadius = 3,
  className,
}) => {
  return (
    <SelectWrapper>
      <InputField
        styles={className}
        name={name}
        validate={validate}
        label={label}
        value={value}
        onChange={onChange}
        hideValidation={hideValidation}
        rightOfLabel={rightOfLabel}
        fontSize={fontSize}
        borderRadius={borderRadius}
        type={"select"}
        className="select-input"
        w={"full"}
        h={"full"}
      >
        {items.map((item) => (
          <div data_id={item.id} data_name={item.name} />
          // <x.option color={"black"} maxWidth={"100px"} value={item.id}>
          //   {item.name}
          // </x.option>
        ))}
      </InputField>
    </SelectWrapper>
  );
};

export default SelectInput;
