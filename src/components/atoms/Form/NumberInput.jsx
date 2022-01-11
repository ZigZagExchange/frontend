import React from "react";
import {useField} from "formik";
import { x } from "@xstyled/styled-components";

const NumberInput = ({
     name,
     placeholder,
     validate,
     block,
     label
}) => {
    const type = "number"
    const [field, meta, helpers] = useField({name, type})
    console.log("field", field)
    console.log("meta", meta)
    console.log("helpers", helpers)

    return <x.div
        w={block ? "100%" : "200px"}
        display={block ? "block" : "inline-block"}
    >
        {label && <x.label for={name} mb={2}>{label}</x.label>}
        <x.input
            {...field}
            name={name}
            type={type}
            placeholder={placeholder}
            padding={1.5}
            border={"2px solid"}
            borderColor={"blue-gray-800"}
            background={"none"}
            color={"white"}
            borderRadius={4}
            fontSize={22}
            w={"100%"}
        />
        {meta.error && meta.touched && <x.div>{meta.error}</x.div>}
    </x.div>
}

export default NumberInput;
