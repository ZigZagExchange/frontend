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
        d="M5.10559 4.45867H0.895594H0.895594C0.556374 4.45916 0.247074 4.26463 0.100594 3.95867H0.100594C-0.0708233 3.59576 -0.0203668 3.16688 0.230594 2.85367L2.33559 0.303668V0.303668C2.6539 -0.0636019 3.20967 -0.103293 3.57694 0.215014C3.60856 0.242419 3.63819 0.272046 3.66559 0.303667L5.77059 2.85367C6.02155 3.16688 6.07201 3.59576 5.90059 3.95867V3.95867C5.75411 4.26463 5.44481 4.45916 5.10559 4.45867L5.10559 4.45867Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
