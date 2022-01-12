import React from "react"
import Form from "./Form";
import NumberInput from "./NumberInput";
import Submit from "./Submit";
import {jsonify} from "../../../lib/helpers/strings";
import {min} from "./validation";

const FormDemo = () => {
    return <Form onSubmit={(data) => alert(jsonify(data))}>
        <NumberInput label={"Number Input"} name={"numberInput"} validate={min(5)}/>
        <Submit mt={3}/>
    </Form>
}

export default FormDemo
