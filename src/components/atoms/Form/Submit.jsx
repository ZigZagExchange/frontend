import React from "react";
import { x } from "@xstyled/styled-components";
import {useFormikContext} from "formik";
import Loader from "react-loader-spinner";

const Submit = ({children, ...rest}) => {
    const state = useFormikContext()
    console.log("debug:: state", state)
    return <Button type={"submit"} isLoading={state.isSubmitting} {...rest}>
        {children ? children : "Submit"}
    </Button>
}


// TODO: discuss w frontend bois if they are ok w variant & sizing API rather than passing specific CSS classes
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
        backgroundImage: 'gradient-to-r',
        gradientFrom: 'blue-100',
        gradientVia: 'blue-200',
        gradientTo: 'teal-100',
        border: 'none',
        color: 'white',
        fontWeight: 'bold'
    },
    secondary: {
        backgroundColor: "blue-400",
        border: "none"
    }
}

const Button = ({variant = "primary", size = "sm", children, isLoading, ...rest}) => {
    return <x.button position={"relative"} {...variants[variant]} {...sizes[size]} {...rest}>
        {children && children}
        {isLoading && <x.div
            left={0}
            top={0}
            w={"full"}
            h={"full"}
            position={"absolute"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            background={"rgba(0,0,0,0.6)"}
        >
            <Loader
                type="TailSpin"
                color="white"
                height={24}
                width={24}
            />
        </x.div>}
    </x.button>
}

export default Submit;
