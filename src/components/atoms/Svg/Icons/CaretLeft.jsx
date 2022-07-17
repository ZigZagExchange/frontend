import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 6}
      height={size ?? 9}
      viewBox="0 0 6 9"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.000977039 4.80835C0.00271511 4.46369 0.159392 4.13809 0.427643 3.92168L3.82764 1.11501L3.82764 1.11501C4.24526 0.7804 4.8171 0.713125 5.30098 0.941681C5.72194 1.12723 5.99562 1.54167 6.00098 2.00168V7.61501H6.00098C5.99562 8.07502 5.72194 8.48946 5.30098 8.67501H5.30098C4.8171 8.90357 4.24526 8.8363 3.82764 8.50168L0.427644 5.69501C0.159393 5.4786 0.00271511 5.15301 0.000977039 4.80835Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
