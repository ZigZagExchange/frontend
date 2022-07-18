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
        d="M7.14723 3.13183L5.9075 1.89458V1.88918C5.69096 1.67307 5.69096 1.33271 5.9075 1.12201C6.11862 0.905904 6.45967 0.905904 6.67621 1.12201L8.84159 3.28305C8.96919 3.40712 9.01968 3.58251 8.99304 3.74838C8.97233 3.89297 8.8937 4.01957 8.78156 4.10384L6.67042 6.21073C6.56757 6.30798 6.42682 6.36741 6.28607 6.36741L6.29148 6.37335C6.14532 6.37335 6.00457 6.31392 5.90713 6.21667C5.69059 6.00597 5.69059 5.66021 5.90171 5.44951V5.4441L7.13595 4.21234H0.87826C0.575106 4.21234 0.336914 3.96923 0.336914 3.67208C0.336914 3.36954 0.575106 3.13183 0.87826 3.13183H7.14723Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
