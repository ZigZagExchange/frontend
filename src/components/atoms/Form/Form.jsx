import React, { useState } from "react";
import { Formik, Form as FormikForm, useFormikContext } from "formik";
import { x } from "@xstyled/styled-components";
import { jsonify } from "../../../lib/helpers/strings";
import { Dev } from "../../../lib/helpers/env";
import { Button } from "./Submit";

const Form = ({ initialValues = {}, onSubmit, children }) => {
  return (
    <Formik
      // NOTE: this must stay false for controlled distinct input functionality
      enableReinitialize={false}
      initialValues={initialValues}
      onSubmit={(values, actions) => onSubmit(values, actions.resetForm)}
    >
      {({ handleSubmit }) => (
        <FormikForm onSubmit={handleSubmit}>
          {children && children}
          <Debug />
        </FormikForm>
      )}
    </Formik>
  );
};

const Debug = () => {
  const form = useFormikContext();
  const [showDebug, setShowDebug] = useState(false);

  return (
    <Dev>
      <x.div
        mt={6}
        display={"flex"}
        justifyContent={showDebug ? "space-between" : "flex-end"}
        alignItems={"center"}
      >
        {showDebug && (
          <x.div
            color={"blue-gray-500"}
            w={"full"}
            style={{ overflowWrap: "anywhere" }}
            maxWidth={"fit-content"}
          >
            <x.div>
              <x.div fontWeight={"bold"}>values</x.div>
              <x.div>{jsonify(form.values, true)}</x.div>
            </x.div>
            <x.div mt={4}>
              <x.div fontWeight={"bold"}>errors</x.div>
              <x.div>{jsonify(form.errors, true)}</x.div>
            </x.div>
          </x.div>
        )}
        {/* <Button
          size={"xs"}
          variant={"secondary"}
          onClick={() => setShowDebug(!showDebug)}
        >
          {showDebug ? "hide debug" : "show debug"}
        </Button> */}
      </x.div>
    </Dev>
  );
};

export default Form;
