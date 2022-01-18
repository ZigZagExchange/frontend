import React from "react";
import {useFormikContext} from "formik";
import {Button} from "../Button";

const Submit = ({children, ...rest}) => {
    const {errors, isSubmitting} = useFormikContext()
    const isDisabled = Object.keys(errors).length !== 0
    return <Button isDisabled={isDisabled} type={"submit"} isLoading={isSubmitting} {...rest}>
        {children ? children : "Submit"}
    </Button>
}

export default Submit;
