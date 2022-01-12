import React from "react";
import {useField} from "formik";
import { x } from "@xstyled/styled-components";
import Input from "./Input";

const NumberInput = ({
     name,
     placeholder,
     validate,
     block,
     label
}) => {
    return <Input
      name={name}
      placeholder={placeholder}
      validate={validate}
      label={label}
      type={"number"}
      p={2}
      border={"2px solid"}
      borderColor={{_: "blue-gray-800", hover: "blue-gray-500", focus: "blue-gray-400"}}
      outline={{focus: "none"}}
      background={"none"}
      color={"white"}
      borderRadius={4}
      fontSize={18}
      w={"100%"}
    />
}

export default NumberInput;
