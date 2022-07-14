import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 12}
      height={size ?? 12}
      viewBox="0 0 12 12"
      fill="none"
      {...props}
    >
      <path
        d="M8.04033 4.01333L8.65366 4.62667L2.61366 10.6667H2.00033V10.0533L8.04033 4.01333ZM10.4403 0C10.2737 0 10.1003 0.0666666 9.97366 0.193333L8.75366 1.41333L11.2537 3.91333L12.4737 2.69333C12.7337 2.43333 12.7337 2.01333 12.4737 1.75333L10.9137 0.193333C10.7803 0.06 10.6137 0 10.4403 0ZM8.04033 2.12667L0.666992 9.5V12H3.16699L10.5403 4.62667L8.04033 2.12667Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
