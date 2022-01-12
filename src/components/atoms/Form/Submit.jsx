import React from "react";
import { x } from "@xstyled/styled-components";
import {useFormikContext} from "formik";
import Loader from "react-loader-spinner";

const Submit = ({children, ...rest}) => {
    const {errors, isSubmitting} = useFormikContext()
    const isDisabled = Object.keys(errors).length !== 0
    return <Button isDisabled={isDisabled} type={"submit"} isLoading={isSubmitting} {...rest}>
        {children ? children : "Submit"}
    </Button>
}

const sizes = {
    sm: {
        p: 2,
        borderRadius: 2,
        fontSize: 16
    },
    md: {
        p: 4,
        borderRadius: 4
    }
}

const variants = {
    primary: {
        backgroundImage: {_: 'gradient-to-r', disabled: "none"},
        backgroundColor: {disabled: "blue-400"},
        gradientFrom: {_: 'blue-100', disabled: "none"},
        gradientVia: 'blue-200',
        gradientTo: 'teal-100',
        border: 'none',
        color: {_: "white", disabled: "blue-300"},
        fontWeight: 'bold'
    },
    secondary: {
        backgroundColor: "blue-400",
        border: "none"
    }
}

const Button = ({variant = "primary", size = "sm", children, isLoading, type="button", isDisabled}) => {
    return <x.div position={"relative"}>
      {isLoading &&
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
          <Loader
            type="TailSpin"
            color="white"
            height={24}
            width={24}
          />
        </x.div>}
      <x.button type={type} disabled={isDisabled} position={"relative"} {...variants[variant]} {...sizes[size]} w={"full"}>
        {children && children}
      </x.button>
    </x.div>
}

export default Submit;
