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
        borderRadius={3}
        borderColor={"blue-gray-800"}
        background={"none"}
        color={"white"}
        fontSize={18}
        className="select-input"
        p={'8px'}
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
