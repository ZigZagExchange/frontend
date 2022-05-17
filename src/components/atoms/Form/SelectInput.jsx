import React from "react";
import Input from "./Input";
import { x } from "@xstyled/styled-components";

const SelectInput = ({
  name,
  validate,
  label,
  onChange,
  hideValidation,
  value,
  items,
  rightOfLabel,
  borderRadius = 3,
  fontSize = 18,
  padding = 8
}) => {
  return (
    <div className="select-wrap">
      <Input
        name={name}
        validate={validate}
        label={label}
        value={value}
        onChange={onChange}
        hideValidation={hideValidation}
        rightOfLabel={rightOfLabel}
        type={"select"}
        borderWidth={2}
        borderRadius={borderRadius}
        borderColor={"blue-gray-800"}
        background={"none"}
        color={"white"}
        fontSize={fontSize}
        className="select-input"
        p={`${padding}px`}
        w={"full"}
        h={"full"}
      >
        {items.map((item) => (
          <x.option color={"black"} value={item.id}>
            {item.name}
          </x.option>
        ))}
      </Input>
    </div>
  );
};

export default SelectInput;
