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
      <Label label={item.name}/>
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
      <Label label={item.name}/>
      <Radio name={name} id={item.id} value={item.value}/>
    </x.div>)}
  </>
}

const Label = ({label}) => {
  return <x.div fontSize={12} mb={1}>{label}</x.div>
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
    // TODO: decide on styling here
    borderColor={{_: "blue-300", checked: "blue-300"}}
    borderRadius={"full"}
    gradientFrom={{checked: 'blue-100'}}
    gradientVia={{checked: 'blue-200'}}
    gradientTo={{checked: 'teal-100'}}
    backgroundImage={{checked: 'gradient-to-r', disabled: "none"}}
    {...rest}
  />
}

export default RadioButtons
