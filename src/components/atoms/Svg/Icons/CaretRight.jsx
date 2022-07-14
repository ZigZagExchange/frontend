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
        d="M6.00098 4.80835C5.99924 5.15301 5.84256 5.4786 5.57431 5.69502L2.17431 8.50168L2.17431 8.50168C1.75669 8.8363 1.18485 8.90357 0.700976 8.67502C0.280018 8.48947 0.0063299 8.07503 0.000976563 7.61502L0.000976563 2.00168H0.000976563C0.00633164 1.54168 0.280018 1.12724 0.700976 0.941685H0.700977C1.18485 0.713128 1.75669 0.780404 2.17431 1.11502L5.57431 3.92168C5.84256 4.1381 5.99924 4.46369 6.00098 4.80835Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
