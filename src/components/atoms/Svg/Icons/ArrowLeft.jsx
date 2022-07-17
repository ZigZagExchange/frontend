import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 9}
      height={size ?? 7}
      viewBox="0 0 9 7"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.18968 4.20149L3.42942 5.43873V5.44414C3.64596 5.66024 3.64596 6.0006 3.42942 6.2113C3.21829 6.42741 2.87724 6.42741 2.66071 6.2113L0.49532 4.05027C0.36772 3.92619 0.317239 3.7508 0.343878 3.58493C0.364585 3.44035 0.443211 3.31375 0.555352 3.22948L2.66649 1.12258C2.76935 1.02533 2.9101 0.965906 3.05085 0.965906L3.04543 0.959963C3.1916 0.959963 3.33235 1.01939 3.42979 1.11664C3.64633 1.32734 3.64633 1.67311 3.4352 1.88381V1.88921L2.20096 3.12097L8.45865 3.12097C8.76181 3.12097 9 3.36409 9 3.66123C9 3.96377 8.76181 4.20149 8.45865 4.20149L2.18968 4.20149Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
