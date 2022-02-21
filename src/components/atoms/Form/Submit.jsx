import React from "react";
import { x } from "@xstyled/styled-components";
import { useFormikContext } from "formik";
import Loader from "react-loader-spinner";

const Submit = ({ children, isDisabled, ...rest }) => {
  const { errors, isSubmitting } = useFormikContext();
  const hasErrors = Object.keys(errors).length !== 0;
  return (
    <Button
      isDisabled={isDisabled || hasErrors}
      type={"submit"}
      isLoading={isSubmitting}
      {...rest}
    >
      {children ? children : "Submit"}
    </Button>
  );
};

const sizes = {
  xs: {
    px: 1,
    py: 0.5,
    borderRadius: 2,
    fontSize: 12,
  },
  sm: {
    p: 2,
    borderRadius: 3,
    fontSize: 16,
  },
  md: {
    p: 4,
    borderRadius: 4,
    fontSize: 22,
  },
};

const variants = {
  primary: {
    backgroundImage: { _: "gradient-to-r", disabled: "none" },
    backgroundColor: { disabled: "blue-400" },
    gradientFrom: { _: "blue-100", disabled: "none" },
    gradientVia: "blue-200",
    gradientTo: "teal-100",
    border: "none",
    color: { _: "white", disabled: "blue-300" },
    fontWeight: "bold",
  },
  secondary: {
    backgroundColor: { _: "blue-600", hover: "black" },
    color: { _: "teal-200", hover: "blue-100" },
    border: "none",
  },
};

export const Button = ({
  variant = "primary",
  size = "sm",
  children,
  isLoading,
  type = "button",
  isDisabled,
  block,
  onClick,
}) => {
  return (
    <x.div position={"relative"} w={block ? "full" : "fit-content"}>
      {isLoading && (
        <x.div
          left={0}
          top={0}
          w={"full"}
          h={"full"}
          position={"absolute"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          background={"rgba(0,0,0,0.6)"}
          zIndex={2}
        >
          <Loader type="TailSpin" color="white" height={24} width={24} />
        </x.div>
      )}
      <x.button
        onClick={onClick}
        type={type}
        disabled={isDisabled}
        position={"relative"}
        {...variants[variant]}
        {...sizes[size]}
        w={"full"}
      >
        {children && children}
      </x.button>
    </x.div>
  );
};

export default Submit;
