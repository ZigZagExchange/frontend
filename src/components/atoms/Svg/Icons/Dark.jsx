import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 14}
      height={size ?? 18}
      viewBox="0 0 14 18"
      fill="none"
      {...props}
    >
      <path
        d="M9 1.8C9.306 1.8 9.612 1.818 9.909 1.863C8.19 3.807 7.2 6.345 7.2 9C7.2 11.655 8.19 14.193 9.909 16.137C9.612 16.182 9.306 16.2 9 16.2C5.031 16.2 1.8 12.969 1.8 9C1.8 5.031 5.031 1.8 9 1.8ZM9 0C4.032 0 0 4.032 0 9C0 13.968 4.032 18 9 18C10.638 18 12.177 17.55 13.5 16.785C10.809 15.228 9 12.33 9 9C9 5.67 10.809 2.772 13.5 1.215C12.177 0.45 10.638 0 9 0Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
