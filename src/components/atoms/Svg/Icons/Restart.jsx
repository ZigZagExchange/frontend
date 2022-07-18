import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 12}
      height={size ?? 14}
      viewBox="0 0 12 14"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.00033 2.52333C8.94699 2.52333 11.3337 4.90999 11.3337 7.85666C11.3337 10.5767 9.30033 12.8167 6.66699 13.1433V11.7967C8.55366 11.4767 10.0003 9.83666 10.0003 7.85666C10.0003 5.64999 8.20699 3.85666 6.00033 3.85666C5.98442 3.85666 5.96699 3.85818 5.94877 3.85976C5.92881 3.8615 5.9079 3.86333 5.88699 3.86333L6.60699 4.58333L5.66699 5.52333L3.33366 3.18999L5.66699 0.856659L6.60699 1.80333L5.88032 2.52999C5.90032 2.52999 5.92032 2.52833 5.94032 2.52666C5.96033 2.52499 5.98033 2.52333 6.00033 2.52333Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
      <path
        d="M2.00033 7.85666C2.00033 6.75666 2.44699 5.75666 3.17366 5.02999L2.22699 4.08333C1.26699 5.04999 0.666992 6.38333 0.666992 7.85666C0.666992 10.5767 2.70033 12.8167 5.33366 13.1433V11.7967C3.44699 11.4767 2.00033 9.83666 2.00033 7.85666Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
