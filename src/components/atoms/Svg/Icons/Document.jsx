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
        d="M10.6667 1.33333V10.6667H1.33333V1.33333H10.6667ZM10.6667 0H1.33333C0.6 0 0 0.6 0 1.33333V10.6667C0 11.4 0.6 12 1.33333 12H10.6667C11.4 12 12 11.4 12 10.6667V1.33333C12 0.6 11.4 0 10.6667 0Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
      <path
        d="M7.33333 9.33333H2.66667V8H7.33333V9.33333ZM9.33333 6.66667H2.66667V5.33333H9.33333V6.66667ZM9.33333 4H2.66667V2.66667H9.33333V4Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
