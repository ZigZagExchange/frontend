import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 6}
      height={size ?? 5}
      viewBox="0 0 6 5"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.895383 0.541332L5.10538 0.541332H5.10538C5.4446 0.540841 5.7539 0.735369 5.90038 1.04133H5.90038C6.0718 1.40424 6.02134 1.83312 5.77038 2.14633L3.66538 4.69633V4.69633C3.34708 5.0636 2.79131 5.10329 2.42404 4.78499C2.39242 4.75758 2.36279 4.72795 2.33538 4.69633L0.230384 2.14633C-0.020577 1.83312 -0.0710335 1.40424 0.100384 1.04133V1.04133C0.246865 0.73537 0.556164 0.540843 0.895384 0.541333L0.895383 0.541332Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
