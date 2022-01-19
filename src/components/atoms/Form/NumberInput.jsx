import React from "react";
import Input from "./Input";

const NumberInput = ({
     name,
     placeholder,
     validate,
     block,
     label,
     value,
     onChange,
     hideValidation,
    rightOfLabel
}) => {
    return <Input
      name={name}
      placeholder={placeholder}
      validate={validate}
      label={label}
      value={value}
      onChange={onChange}
      hideValidation={hideValidation}
      rightOfLabel={rightOfLabel}
      type={"number"}
      p={2}
      border={"2px solid"}
      borderColor={{_: "blue-gray-800", hover: "blue-gray-500", focus: "blue-gray-400"}}
      outline={{focus: "none"}}
      background={"none"}
      color={"white"}
      borderRadius={4}
      fontSize={18}
      w={block ? "100%" : "inherit"}
    />
}

export default NumberInput;
