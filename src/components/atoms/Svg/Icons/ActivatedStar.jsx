import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 19}
      height={size ?? 18}
      viewBox="0 0 19 18"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.20463 5.43381L0.735309 6.22714L0.637701 6.24677C0.006688 6.41065 -0.22496 7.21763 0.260272 7.68995L4.22333 11.5475L3.28917 16.9958L3.27799 17.0902C3.23563 17.743 3.93275 18.2153 4.53313 17.8996L9.42479 15.3275L14.3055 17.8992L14.3918 17.9391C14.9996 18.1818 15.6649 17.6647 15.5501 16.9958L14.6151 11.5475L18.579 7.68995L18.6465 7.61672C19.0608 7.11337 18.7741 6.32426 18.104 6.22714L12.6338 5.43381L10.1885 0.477913C9.87397 -0.159304 8.96532 -0.159304 8.65084 0.477913L6.20463 5.43381Z"
        fill="url(#paint0_linear_0_1285)"
        fillOpacity="0.6"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.27195 6.90332L2.47206 7.59955L5.95064 10.9855L5.13042 15.7694L9.42558 13.5109L13.7083 15.7676L12.8877 10.9855L16.367 7.59955L11.5664 6.90332L9.41953 2.55244L7.27195 6.90332ZM10.1885 0.477913L12.6338 5.43381L18.104 6.22714C18.7741 6.32426 19.0608 7.11337 18.6465 7.61672L18.579 7.68995L14.6151 11.5475L15.5501 16.9958C15.6649 17.6647 14.9996 18.1818 14.3918 17.9391L14.3055 17.8992L9.42479 15.3275L4.53313 17.8996C3.93275 18.2153 3.23563 17.743 3.27799 17.0902L3.28917 16.9958L4.22333 11.5475L0.260272 7.68995C-0.22496 7.21763 0.006688 6.41065 0.637701 6.24677L0.735309 6.22714L6.20463 5.43381L8.65084 0.477913C8.96532 -0.159304 9.87397 -0.159304 10.1885 0.477913Z"
        fill={theme.colors.primaryHighEmphasis}
      />
      <defs>
        <linearGradient
          id="paint0_linear_0_1285"
          x1="0.0171704"
          y1="8.45683"
          x2="18.8156"
          y2="9.64642"
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
