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
        d="M3.50059 5C3.2421 4.9987 2.9979 4.88119 2.83559 4.68L0.730594 2.13L0.730594 2.13C0.479633 1.81678 0.429177 1.38791 0.600594 1.025C0.739758 0.709281 1.05059 0.504015 1.39559 0.5H5.60559V0.5C5.9506 0.504016 6.26143 0.709281 6.40059 1.025V1.025C6.57201 1.38791 6.52155 1.81678 6.27059 2.13L4.16559 4.68C4.00328 4.88119 3.75909 4.9987 3.50059 5ZM1.54492 1.5L3.49992 3.91L5.49992 1.5H1.54492Z"
        fill={theme.colors.foregroundHighEmphasis}
        fillOpacity="0.48"
      />
    </Svg>
  );
};

export default Icon;
