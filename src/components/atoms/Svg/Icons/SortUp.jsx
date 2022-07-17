import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 7}
      height={size ?? 5}
      viewBox="0 0 7 5"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.50038 0C3.75888 0.00130367 4.00307 0.118812 4.16538 0.32L6.27038 2.87L6.27038 2.87C6.52134 3.18322 6.5718 3.61209 6.40038 3.975C6.26122 4.29072 5.95039 4.49598 5.60538 4.5L1.39538 4.5V4.5C1.05038 4.49598 0.739548 4.29072 0.600383 3.975V3.975C0.428966 3.61209 0.479423 3.18322 0.730383 2.87L2.83538 0.32C2.99769 0.118812 3.24189 0.00130367 3.50038 0ZM5.45605 3.5L3.50105 1.09L1.50105 3.5L5.45605 3.5Z"
        fill={theme.colors.foregroundHighEmphasis}
        fillOpacity="0.48"
      />
    </Svg>
  );
};

export default Icon;
