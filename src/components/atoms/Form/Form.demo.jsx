import React, {useState} from "react"
import Form from "./Form";
import NumberInput from "./NumberInput";
import Submit, {Button} from "./Submit";
import {jsonify} from "../../../lib/helpers/strings";
import {max, min, required} from "./validation";
import {x} from "@xstyled/styled-components";

const FormDemo = () => {
    const [numberInput, setNumberInput] = useState(1)

    return <Form
      initialValues={{numberInput: "", another: "", controlled: numberInput}}
      onSubmit={async (data, resetForm) => {
      alert(jsonify(data))
      resetForm()
    }}>
      <x.div spaceY={2}>
        <NumberInput label={"Number Input"} name={"numberInput"} validate={required} block/>
        <NumberInput label={"Another"} name={"another"} validate={[required]} block/>
          <x.div row>
            <x.div col>
              <NumberInput
                  block
                  label={"Controlled Number Input"}
                  name={"controlled"}
                  validate={[required]}
                  onChange={(value) => {
                      setNumberInput(value)
                  }}
                  value={numberInput}
              />
              <x.div>{numberInput}</x.div>
            </x.div>
            <x.div col display={"flex"} justifyContent={"center"} alignItems={"center"} w={"full"}>
              <Button variant={"secondary"} onClick={() => {
                setNumberInput(numberInput + 1)
              }}>
                Change controlled
              </Button>
            </x.div>
          </x.div>

          <Submit block/>
      </x.div>
    </Form>
}

export default FormDemo
