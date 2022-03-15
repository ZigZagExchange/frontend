import React from "react";
import { x } from "@xstyled/styled-components";

const sizes = {
  xs: {
    borderRadius: 1,
    p: 2,
  },
  sm: {
    borderRadius: 4,
    p: 7,
  },
  md: {
    borderRadius: "3xl",
    p: 8,
  },
};

const colors = {
  light: {
    backgroundColor: "blue-500",
  },
  dark: {
    backgroundColor: "blue-600",
  },
};

const Pane = ({ size = "sm", variant = "dark", children, ...rest }) => {
  return (
    <x.div {...sizes[size]} {...colors[variant]} {...rest}>
      {children && children}
    </x.div>
  );
};

export default Pane;
