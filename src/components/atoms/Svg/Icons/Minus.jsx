import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 10}
      height={size ?? 2}
      viewBox="0 0 10 2"
      fill="none"
      {...props}
    >
      <path
        d="M9.33382 1.6668H0.000488281V0.333466H9.33382V1.6668Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
