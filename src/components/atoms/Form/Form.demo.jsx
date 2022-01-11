import React from "react"
import Form from "./Form";
import NumberInput from "./NumberInput";

const FormDemo = () => {
    return <Form
        onSubmit={(something) => console.log(something)}
    >
        <NumberInput label={"Base Unit"} name={"baseUnit"}/>
    </Form>
}

export default FormDemo
