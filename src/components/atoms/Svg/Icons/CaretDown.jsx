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
        d="M4.00079 6.80835C3.65613 6.80661 3.33054 6.64993 3.11413 6.38168L0.307458 2.98168L0.307458 2.98168C-0.0271557 2.56406 -0.0944311 1.99222 0.134125 1.50835C0.319678 1.08739 0.734117 0.813703 1.19412 0.80835H6.80746V0.80835C7.26747 0.813705 7.68191 1.08739 7.86746 1.50835V1.50835C8.09601 1.99223 8.02874 2.56406 7.69413 2.98168L4.88746 6.38168C4.67105 6.64993 4.34545 6.80661 4.00079 6.80835Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
