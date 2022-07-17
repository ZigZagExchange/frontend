import React, { useEffect, useState } from "react";
import { useField } from "formik";
import { x } from "@xstyled/styled-components";
import { composeValidators, required, requiredError } from "./validation";
import styled from "styled-components";
import { useRef } from "react";

const Wrapper = styled.div`
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
`;

const Input = ({
  name,
  validate,
  label,
  type,
  block,
  value,
  onChange,
  hideValidation,
  styles,
  children,
  rightOfLabel,
  ...rest
}) => {
  const validators = Array.isArray(validate)
    ? composeValidators(...validate)
    : validate;
  const isRequired = Array.isArray(validate)
    ? validate.includes(required)
    : validate === required;

  const [field, meta, helpers] = useField({ name, type, validate: validators });
  const [selectValue, setSelectValue] = useState();
  const isError = meta.error && meta.touched;
  const Component = x.input;

  // controlled input
  useEffect(() => {
    if (value !== undefined && onChange && value !== field.value) {
      // https://github.com/jaredpalmer/formik/issues/2059
      helpers.setValue(value, true).then((res) => helpers.setTouched(true));
    }
  }, [value]);

  return (
    <FieldSet name={name} w={block ? "full" : "inherit"}>
      {label && (
        <Label
          name={name}
          isRequired={isRequired}
          highlightRequired={meta.error === requiredError}
          rightOfLabel={rightOfLabel}
        >
          {label}
        </Label>
      )}
      <Wrapper className={styles}>
        {type === "select" ? (
          <CustomSelect
            value={selectValue}
            {...rest}
            onChange={(id, name) => {
              if (value !== undefined && onChange) {
                onChange(id);
              }
              setSelectValue(name);
            }}
          >
            {children}
          </CustomSelect>
        ) : (
          <Component
            {...field}
            {...rest}
            name={name}
            type={type}
            onChange={(e) => {
              if (value !== undefined && onChange) {
                onChange(e.target.value);
              }
              field.onChange(e);
            }}
            value={field.value}
            children={children}
          />
        )}
      </Wrapper>
      {isError && !hideValidation && <ErrorMessage error={meta.error} />}
    </FieldSet>
  );
};

const ErrorMessage = ({ error }) => {
  return (
    <x.div mt={1} color={"red"} fontSize={12}>
      {error}
    </x.div>
  );
};

const FieldSet = ({ name, children, ...rest }) => {
  return (
    <x.div name={name} height={"fit-content"} {...rest}>
      {children}
    </x.div>
  );
};

const Label = ({
  name,
  isRequired,
  children,
  highlightRequired,
  rightOfLabel,
}) => {
  return (
    <x.label
      for={name}
      mb={1}
      fontSize={{ xs: "xs", md: "14px" }}
      color={"blue-gray-500"}
      display={"flex"}
      justifyContent={rightOfLabel ? "space-between" : "inherit"}
      alignItems={"center"}
      className="custom-form-label"
    >
      <x.div>
        {isRequired && (
          <x.span
            color={highlightRequired ? "red" : "blue-gray-500"}
            display={"inline-block"}
            mr={0.5}
          >
            {/* * */}
          </x.span>
        )}
        {children}
      </x.div>
      {rightOfLabel && <x.div>{rightOfLabel}</x.div>}
    </x.label>
  );
};

const CustomSelect = ({ children, value, onChange, ...props }) => {
  useEffect(() => {
    // onChange(children[0].props.data_id|"no-value", children[0].props.data_name|"no-value")
    onChange(children[0].props.data_id, children[0].props.data_name);
  }, []);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    window.addEventListener("click", (e) => {
      if (!ref.current?.contains(e.target)) {
        setIsOpen(false);
      }
    });
  }, []);
  return (
    <CustomSelectCont onClick={() => setIsOpen(!isOpen)} ref={ref} {...props}>
      <CustomSelectItem>{value}</CustomSelectItem>
      <CustomSelectField isOpen={isOpen}>
        {children.map((each, index) => {
          return (
            <CustomSelectOption
              onClick={() => onChange(each.props.data_id, each.props.data_name)}
            >
              {each.props.data_name}
            </CustomSelectOption>
          );
        })}
      </CustomSelectField>
    </CustomSelectCont>
  );
};
const CustomSelectCont = styled.div`
  border-radius: 8px;
  position: relative;
`;
const CustomSelectItem = styled.div`
  user-select: none;
`;
const CustomSelectOption = styled.div`
  padding: 5px;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.backgroundMediumEmphasis};
  z-index: 1000;
  user-select: none;
  color: ${({ theme }) => theme.colors.foregroundHighEmphasis};
  border-radius: 5px;
`;
const CustomSelectField = styled.div`
  position: absolute;
  top: 100%;
  left: 0%;
  width: 100%;
  display: ${(p) => (p.isOpen ? "flex" : "none")};
  flex-direction: column;
  border-color: ${({ theme }) => theme.colors.background100};
`;

export default Input;
