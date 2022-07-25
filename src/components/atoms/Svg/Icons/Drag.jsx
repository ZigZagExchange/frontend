import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 12}
      height={size ?? 6}
      viewBox="0 0 12 6"
      fill="none"
      {...props}
    >
      <path
        d="M11.6252 0.890686H0.375488V2.2969H11.6252V0.890686ZM0.375488 5.10931H11.6252V3.70311H0.375488V5.10931Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
