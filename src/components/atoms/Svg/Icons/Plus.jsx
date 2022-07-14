import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 10}
      height={size ?? 10}
      viewBox="0 0 10 10"
      fill="none"
      {...props}
    >
      <path
        d="M9.33382 5.6668H5.33382V9.6668H4.00049V5.6668H0.000488281V4.33347H4.00049V0.333466H5.33382V4.33347H9.33382V5.6668Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
