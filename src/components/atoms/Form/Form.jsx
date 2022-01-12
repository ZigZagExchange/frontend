import React from "react";
import {Formik, Form as FormikForm, useFormikContext} from "formik";
import { x } from "@xstyled/styled-components"
import {jsonify} from "../../../lib/helpers/strings";
import {Dev} from "../../../lib/helpers/env";

// TODO move initial values to inputs

const Form = ({initialValues={}, onSubmit, children}) => {
    return <Formik
        initialValues={initialValues}
        onSubmit={(values, actions) => onSubmit(values)}
    >
        {({
            handleSubmit,
            errors
        }) => <FormikForm onSubmit={handleSubmit}>
            {children && children}
            {errors.name && <x.div>
                {errors.name}
            </x.div>}
            <Dev>
                <Debug/>
            </Dev>
        </FormikForm>}
    </Formik>
}

const Debug = () => {
    const form = useFormikContext()
    return <x.div mt={6} color={"blue-gray-500"} style={{overflowWrap: "anywhere"}}>
        <x.div>values: {jsonify(form.values)}</x.div>
        <x.div>errors: {jsonify(form.errors)}</x.div>
    </x.div>
}

export default Form;
