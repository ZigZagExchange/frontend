import React from "react";
import {useField} from "formik";
import {x} from "@xstyled/styled-components"

const Input = ({
    name,
    validate,
    label,
    type,
    block
}) => {
    const [field, meta, helpers] = useField({name, type, validate})

    // responsibilites
    // 1: label
    // 2: rendering input
    // 3: error message

    return <FieldSet name={name}>
        {label && <Label name={name}>
            label
        </Label>}
    </FieldSet>
}


const FieldSet = ({name, children}) => {
    return <x.fieldset name={name}>
        {children}
    </x.fieldset>
}

const Label = ({name, children}) => {
    return <x.label for={name}>
        {children}
    </x.label>
}

export default Input
