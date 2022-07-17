import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 20}
      height={size ?? 21}
      viewBox="0 0 20 21"
      fill="none"
      {...props}
    >
      <path
        d="M10 0.5C4.48 0.5 0 4.98 0 10.5C0 16.02 4.48 20.5 10 20.5C15.52 20.5 20 16.02 20 10.5C20 4.98 15.52 0.5 10 0.5ZM10 18.5C5.59 18.5 2 14.91 2 10.5C2 6.09 5.59 2.5 10 2.5C14.41 2.5 18 6.09 18 10.5C18 14.91 14.41 18.5 10 18.5ZM14.59 6.08L8 12.67L5.41 10.09L4 11.5L8 15.5L16 7.5L14.59 6.08Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
