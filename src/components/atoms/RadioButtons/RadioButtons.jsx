import React from "react";
import styled, { x } from "@xstyled/styled-components";

const RadioButtons = ({ value, onChange, horizontal, ...rest }) => {
  const isControlled = value !== undefined;

  return (
    <x.div display={horizontal ? "flex" : "block"} spaceX={horizontal ? 3 : 0}>
      {isControlled && (
        <ControlledRadios value={value} onChange={onChange} {...rest} />
      )}
      {!isControlled && <UncontrolledRadios {...rest} />}
    </x.div>
  );
};

const ControlledRadios = ({ items, value, onChange, name }) => {
  return (
    <>
      {items.map((item) => (
        <x.div
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          key={`controlled-radio-${item.id}`}
        >
          <Label label={item.name} />
          <Radio
            name={name}
            id={item.id}
            value={item.value}
            checked={value === item.id}
            disabled={item.disabled}
            onChange={(e) => {
              if (onChange) {
                onChange(item.id);
              }
            }}
          />
        </x.div>
      ))}
    </>
  );
};

const UncontrolledRadios = ({ items, name }) => {
  return (
    <>
      {items.map((item) => (
        <x.div
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          key={`uncontrolled-radio-${item.id}`}
        >
          <Label label={item.name} />
          <Radio
            name={name}
            id={item.id}
            value={item.value}
            disabled={item.disabled}
          />
        </x.div>
      ))}
    </>
  );
};

const Label = ({ label }) => {
  return (
    <x.div fontSize={12} mb={1}>
      {label}
    </x.div>
  );
};

const StyledRadio = styled.input`
  appearance: none;
  cursor: pointer;
  width: 5;
  height: 5;
  border-width: 2px;
  border-style: solid;
  border-color: blue-gray-400;
  border-radius: full;
  display: flex;
  justify-content: center;
  align-items: center;

  &::before {
    content: "";
    width: 3;
    height: 3;
    border-radius: 50%;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    background: linear-gradient(to right, #09aaf5, #05cfe9, #02f1de);
  }

  &:checked::before {
    transform: scale(1);
  }

  &:disabled {
    border-color: #232528;
    cursor: inherit;
  }
`;

const Radio = ({ name, id, value, disabled, ...rest }) => {
  return (
    <StyledRadio
      value={value}
      id={id}
      name={name}
      disabled={disabled}
      type={"radio"}
      {...rest}
    />
  );
};

export default RadioButtons;
