import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 12}
      height={size ?? 12}
      viewBox="0 0 12 12"
      fill="none"
      {...props}
    >
      <path
        d="M3.46699 5.60001L4.03099 5.03601L2.19899 3.20001L8.66699 3.20001V2.40001L2.19899 2.40001L4.03499 0.564007L3.46699 6.67572e-06L0.666992 2.80001L3.46699 5.60001Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
      <path
        d="M9.20049 4.66666L8.63649 5.23066L10.4685 7.06666L4.00049 7.06666L4.00049 7.86666L10.4685 7.86666L8.63249 9.70266L9.20049 10.2667L12.0005 7.46666L9.20049 4.66666Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
