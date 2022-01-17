import React, {useState} from "react"
import Form from "./Form";
import NumberInput from "./NumberInput";
import Submit, {Button} from "./Submit";
import {jsonify} from "../../../lib/helpers/strings";
import {min,max,required} from "./validation";
import {x} from "@xstyled/styled-components";
import SelectInput from "./SelectInput";
import {model} from "./helpers";

const FormDemo = () => {
    const [number, setNumber] = useState(1)
    const [select, setSelect] = useState("ETH")

  return <>
    <Form
      initialValues={{
        uncontrolledNumber: "",
        controlled: number,
        select: "ETH",
        controlledSelect: "ETH"
      }}
      onSubmit={async (data, resetForm) => {
        alert(jsonify(data))
        resetForm()
      }}>
      <x.div>
        <NumberInput
          label={"Number Input"}
          name={"uncontrolledNumber"}
          validate={[min(0), required]}
          block
        />
        <x.div row>
          <x.div col>
            <NumberInput
              block
              label={"Controlled Number Input"}
              name={"controlled"}
              validate={[max(2), min(-1)]}
              {...model(number, setNumber)}
            />
          </x.div>
          <x.div col display={"flex"} alignItems={"center"} justifyContent={"center"}>
            <Button variant={"secondary"} onClick={() => setNumber(number + 1)}>
              Change Controlled
            </Button>
          </x.div>
        </x.div>
      </x.div>

      <x.div mt={8}>
        <SelectInput
          label={"Select Input"}
          name={"select"}
          block
          items={[{name: "MANA", id: "MANA"}, {name: "USDT", id: "USDT"}]}
        />
        <x.div row>
          <x.div col>
            <SelectInput
              label={"Controlled Select Input"}
              name={"controlledSelect"}
              items={[{name: "ETH", id: "ETH"}, {name: "USDC", id: "USDC"}]}
              {...model(select, setSelect)}
            />
          </x.div>
          <x.div col display={"flex"} alignItems={"center"} justifyContent={"center"}>
            <Button variant={"secondary"} onClick={() => {
              if (select === "ETH") {
                setSelect("USDC")
              } else {
                setSelect("ETH")
              }
            }}>
              Change Controlled
            </Button>
          </x.div>
        </x.div>
      </x.div>

      <x.div mt={4}>
        <Submit block/>
      </x.div>
    </Form>
  </>
}

export default FormDemo
