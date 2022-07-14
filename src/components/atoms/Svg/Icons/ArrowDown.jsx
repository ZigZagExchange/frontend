import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 7}
      height={size ?? 9}
      viewBox="0 0 7 9"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.2031 7.14546L5.44035 5.90573H5.44575C5.66186 5.68919 6.00222 5.68919 6.21292 5.90573C6.42903 6.11685 6.42903 6.4579 6.21292 6.67444L4.05189 8.83982C3.92781 8.96742 3.75242 9.01791 3.58655 8.99127C3.44196 8.97056 3.31536 8.89193 3.23109 8.77979L1.1242 6.66865C1.02695 6.5658 0.967523 6.42505 0.967523 6.2843L0.96158 6.28971C0.96158 6.14355 1.02101 6.0028 1.11826 5.90536C1.32896 5.68882 1.67472 5.68882 1.88542 5.89994H1.89083L3.12259 7.13418L3.12259 0.87649C3.12259 0.573336 3.3657 0.335144 3.66285 0.335144C3.96539 0.335144 4.2031 0.573336 4.2031 0.87649V7.14546Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
