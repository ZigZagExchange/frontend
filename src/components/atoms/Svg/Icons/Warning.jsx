import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 19}
      height={size ?? 17}
      viewBox="0 0 19 17"
      fill="none"
      {...props}
    >
      <path
        d="M9.5 3.57L16.0032 15.2105H2.99682L9.5 3.57ZM9.5 0L0 17H19L9.5 0ZM10.3636 12.5263H8.63636V14.3158H10.3636V12.5263ZM10.3636 7.15789H8.63636V10.7368H10.3636V7.15789Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
