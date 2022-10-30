import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 7}
      height={size ?? 9}
      viewBox="0 0 7 9"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.13381 2.18785L1.89656 3.42759H1.89116C1.67506 3.64413 1.33469 3.64413 1.12399 3.42759C0.907888 3.21646 0.907888 2.87541 1.12399 2.65887L3.28503 0.493489C3.40911 0.365889 3.5845 0.315408 3.75037 0.342047C3.89495 0.362754 4.02155 0.44138 4.10582 0.553521L6.21272 2.66466C6.30996 2.76751 6.36939 2.90826 6.36939 3.04901L6.37533 3.0436C6.37533 3.18976 6.3159 3.33051 6.21866 3.42796C6.00796 3.6445 5.66219 3.6445 5.45149 3.43337H5.44609L4.21433 2.19913V8.45682C4.21433 8.75998 3.97121 8.99817 3.67407 8.99817C3.37152 8.99817 3.13381 8.75998 3.13381 8.45682L3.13381 2.18785Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
