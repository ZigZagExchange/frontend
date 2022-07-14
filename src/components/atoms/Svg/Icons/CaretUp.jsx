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
        d="M4.00067 0.80835C4.34533 0.810088 4.67093 0.966765 4.88734 1.23502L7.69401 4.63502L7.69401 4.63502C8.02862 5.05264 8.0959 5.62448 7.86734 6.10835C7.68179 6.52931 7.26735 6.803 6.80734 6.80835L1.19401 6.80835V6.80835C0.733998 6.80299 0.31956 6.52931 0.134007 6.10835V6.10835C-0.0945501 5.62447 -0.0272741 5.05264 0.30734 4.63502L3.11401 1.23502C3.33042 0.966766 3.65601 0.810088 4.00067 0.80835Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
