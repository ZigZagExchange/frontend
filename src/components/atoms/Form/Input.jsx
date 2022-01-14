import React, {useEffect} from "react";
import {useField} from "formik";
import {x} from "@xstyled/styled-components"
import {composeValidators, required, requiredError} from "./validation";

const Input = ({
    name,
    validate,
    label,
    type,
    block,
    value,
    onChange,
    hideValidation,
    children,
    ...rest
}) => {
    const validators = Array.isArray(validate) ? composeValidators(...validate) : validate
    const isRequired = Array.isArray(validate) ? validate.includes(required) : validate === required
    const [field, meta, helpers] = useField({name, type, validate: validators})
    const Component = type === "select" ? x.select : x.input
    const isError = meta.error && meta.touched


    // controlled input
    useEffect(() => {
        if (value !== undefined && onChange) {
            helpers.setValue(value)
        }
    }, [value])

    return <FieldSet name={name} w={block ? "full" : "inherit"}>
          {label && <Label name={name} isRequired={isRequired} highlightRequired={meta.error === requiredError}>
            {label}
          </Label>}
        <x.div>
            <Component
              {...field}
              {...rest}
              name={name}
              type={type}
              onChange={(e) => {
                  if (value !== undefined && onChange) {
                      onChange(e.target.value)
                  }
                  field.onChange(e)
              }}
              value={field.value}
              children={children}
            />
        </x.div>
        {isError && !hideValidation && <ErrorMessage error={meta.error}/>}
      </FieldSet>
}

const ErrorMessage = ({error}) => {
  return <x.div mt={1} color={"red"} fontSize={12}>
    {error}
  </x.div>
}

const FieldSet = ({name, children, ...rest}) => {
    return <x.div name={name} height={"fit-content"} {...rest}>
        {children}
    </x.div>
}

const Label = ({name, isRequired, children, highlightRequired}) => {
    return <x.label for={name} mb={1} fontSize={14} color={"blue-gray-500"}>
      {isRequired && <x.span color={highlightRequired ? "red" : "blue-gray-500"} display={"inline-block"} mr={0.5}>*</x.span>}
      {children}
    </x.label>
}

export default Input
