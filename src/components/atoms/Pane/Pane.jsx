import React from "react";
import {x} from '@xstyled/styled-components'

const sizes = {
  xs: {
    borderRadius: 1,
    padding: 1
  },
  sm: {
    borderRadius: 4,
    padding: 7
  },
  md: {
    borderRadius: 9,
    padding: 10
  }
}

const colors = {
  light: {
    backgroundColor: "blue-500"
  },
  dark: {
    backgroundColor: "blue-600"
  },
}

const Pane = ({
    size = "sm",
    variant = "dark",
    children,
    ...rest
}) => {
  return <x.div {...sizes[size]} {...colors[variant]} {...rest}>
    {children && children}
  </x.div>
}

export default Pane

