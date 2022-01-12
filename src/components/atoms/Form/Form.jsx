import React from "react";
import {Formik, Form as FormikForm, useFormikContext} from "formik";
import { x } from "@xstyled/styled-components"
import {jsonify} from "../../../lib/helpers/strings";
import {Dev} from "../../../lib/helpers/env";

// TODO move initial values to inputs

const Form = ({initialValues={}, onSubmit, children}) => {
    return <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={(values, actions) => onSubmit(values, actions.resetForm)}
    >
        {({
            handleSubmit,
            errors
        }) => <FormikForm onSubmit={handleSubmit}>
            {children && children}

            {/*TODO: what errors are here*/}
            {errors.name && <x.div>
                {errors.name}
            </x.div>}
            <Debug/>
        </FormikForm>}
    </Formik>
}

const Debug = () => {
    const form = useFormikContext()
    return <Dev>
      <x.div mt={6} color={"blue-gray-500"} w={"full"} style={{overflowWrap: "anywhere"}} maxWidth={"fit-content"}>
        <x.div>values: {jsonify(form.values)}</x.div>
        <x.div>errors: {jsonify(form.errors)}</x.div>
      </x.div>
    </Dev>
}

export default Form;
