import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 11}
      height={size ?? 10}
      viewBox="0 0 11 10"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.666992 5C0.666992 2.23857 2.90557 0 5.66699 0C8.42842 0 10.667 2.23857 10.667 5C10.667 7.76143 8.42842 10 5.66699 10C2.90557 10 0.666992 7.76143 0.666992 5ZM1.66699 5C1.66699 7.20914 3.45785 9 5.66699 9C7.87613 9 9.66699 7.20914 9.66699 5C9.66699 2.79086 7.87613 1 5.66699 1C3.45785 1 1.66699 2.79086 1.66699 5ZM6.02054 2.64645C6.2158 2.84171 6.2158 3.15829 6.02054 3.35355C5.82528 3.54881 5.5087 3.54881 5.31344 3.35355C5.11818 3.15829 5.11818 2.84171 5.31344 2.64645C5.5087 2.45118 5.82528 2.45118 6.02054 2.64645ZM5.16699 4.5C5.16699 4.22386 5.39085 4 5.66699 4C5.94314 4 6.16699 4.22386 6.16699 4.5V7C6.16699 7.27614 5.94314 7.5 5.66699 7.5C5.39085 7.5 5.16699 7.27614 5.16699 7V4.5Z"
        fill="url(#paint0_linear_0_1316)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_0_1316"
          x1="0.676106"
          y1="4.69824"
          x2="10.6579"
          y2="5.30176"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.15" stopColor={theme.colors.primaryHighEmphasis} />
          <stop offset="1" stopColor={theme.colors.secondaryHighEmphasis} />
        </linearGradient>
      </defs>
    </Svg>
  );
};

export default Icon;
