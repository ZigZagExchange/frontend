import React from "react"
import Form from "./Form";
import NumberInput from "./NumberInput";
import Submit from "./Submit";
import {jsonify} from "../../../lib/helpers/strings";
import {max, min, required} from "./validation";
import {x} from "@xstyled/styled-components";

const FormDemo = () => {
    return <Form onSubmit={async (data) => alert(jsonify(data))}>
      <x.div spaceY={2}>
        <NumberInput label={"Number Input"} name={"numberInput"} validate={[min(5), max(10)]} block/>
        <NumberInput label={"Another"} name={"another"} validate={[required]} block/>
        <Submit mt={3} w={"full"}/>
      </x.div>
    </Form>
}

export default FormDemo
