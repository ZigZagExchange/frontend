import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 12}
      height={size ?? 18}
      viewBox="0 0 12 18"
      fill="none"
      {...props}
    >
      <path
        d="M3.39016 5.75C3.39016 6.7 4.12016 7.31 6.39016 7.9C8.66016 8.49 11.0902 9.46 11.0902 12.3C11.0902 14.35 9.54016 15.48 7.59016 15.85V18H4.59016V15.83C2.67016 15.42 1.03016 14.19 0.910156 12H3.11016C3.22016 13.18 4.03016 14.1 6.09016 14.1C8.30016 14.1 8.79016 13 8.79016 12.31C8.79016 11.38 8.29016 10.5 5.79016 9.9C3.00016 9.23 1.09016 8.08 1.09016 5.77C1.09016 3.84 2.65016 2.58 4.59016 2.16V0H7.59016V2.19C9.68016 2.7 10.7302 4.28 10.8002 6H8.59016C8.53016 4.75 7.87016 3.9 6.09016 3.9C4.40016 3.9 3.39016 4.66 3.39016 5.75Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
