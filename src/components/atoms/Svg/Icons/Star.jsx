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
        d="M7.27195 6.90335L2.47206 7.59958L5.95064 10.9855L5.13042 15.7694L9.42558 13.5109L13.7083 15.7676L12.8877 10.9855L16.367 7.59958L11.5664 6.90335L9.41953 2.55247L7.27195 6.90335ZM10.1885 0.477944L12.6338 5.43384L18.104 6.22717C18.7741 6.32429 19.0608 7.1134 18.6465 7.61675L18.579 7.68998L14.6151 11.5475L15.5501 16.9958C15.6649 17.6647 14.9996 18.1818 14.3918 17.9392L14.3055 17.8993L9.42479 15.3275L4.53313 17.8996C3.93275 18.2153 3.23563 17.743 3.27799 17.0902L3.28917 16.9958L4.22333 11.5475L0.260272 7.68998C-0.22496 7.21766 0.006688 6.41068 0.637701 6.2468L0.735309 6.22717L6.20463 5.43384L8.65084 0.477944C8.96532 -0.159274 9.87397 -0.159274 10.1885 0.477944Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
