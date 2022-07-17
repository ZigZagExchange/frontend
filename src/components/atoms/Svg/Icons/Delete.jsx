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
        d="M8.00033 4V10.6667H2.66699V4H8.00033ZM7.00033 0H3.66699L3.00033 0.666667H0.666992V2H10.0003V0.666667H7.66699L7.00033 0ZM9.33366 2.66667H1.33366V10.6667C1.33366 11.4 1.93366 12 2.66699 12H8.00033C8.73366 12 9.33366 11.4 9.33366 10.6667V2.66667Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
