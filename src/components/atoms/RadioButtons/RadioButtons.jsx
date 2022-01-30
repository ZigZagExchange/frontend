import React from "react";
import {x} from "@xstyled/styled-components"

const RadioButtons = ({
  value,
  onChange,
  horizontal,
  ...rest
}) => {
  const isControlled = value !== undefined

  return <x.div display={horizontal ? "flex" : "block"} spaceX={horizontal ? 3 : 0}>
    {isControlled && <ControlledRadios value={value} onChange={onChange} {...rest}/>}
    {!isControlled && <UncontrolledRadios {...rest}/>}
  </x.div>
}

const ControlledRadios = ({items, value, onChange, name, horizontal}) => {
  return <>
    {items.map(item => <x.div>
      <x.div mb={1}>{item.name}</x.div>
      <Radio
        name={name}
        id={item.id}
        value={item.value}
        checked={value === item.id}
        onChange={(e) => {
          if (onChange) {
            onChange(item.id)
          }
        }}
      />
    </x.div>)}
  </>
}

const UncontrolledRadios = ({items, name, horizontal}) => {
  return <>
    {items.map(item => <x.div>
      <x.div mb={0.5}>{item.name}</x.div>
      <Radio name={name} id={item.id} value={item.value}/>
    </x.div>)}
  </>
}

const Radio = ({name, id, value, ...rest}) => {
  return <x.input
    value={value}
    id={id}
    name={name}
    type={"radio"}
    appearance={"none"}
    cursor={"pointer"}
    w={4}
    h={4}
    borderWidth={"2px"}
    borderStyle={"solid"}
    borderColor={"blue-300"}
    borderRadius={"full"}
    bg={{_: "inherit", checked: "white"}}
    {...rest}
  />
}

export default RadioButtons
