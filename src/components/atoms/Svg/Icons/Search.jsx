import React from "react";
import { useTheme } from "styled-components";
import Svg from "../Svg";

const Icon = (props) => {
  const theme = useTheme();
  const { size } = props;
  return (
    <Svg
      width={size ?? 16}
      height={size ?? 16}
      viewBox="0 0 16 16"
      fill="none"
      {...props}
    >
      <path
        d="M11.4351 10.0629H10.7124L10.4563 9.8159C11.3528 8.77301 11.8925 7.4191 11.8925 5.94626C11.8925 2.66209 9.23042 0 5.94626 0C2.66209 0 0 2.66209 0 5.94626C0 9.23042 2.66209 11.8925 5.94626 11.8925C7.4191 11.8925 8.77301 11.3528 9.8159 10.4563L10.0629 10.7124V11.4351L14.6369 16L16 14.6369L11.4351 10.0629ZM5.94626 10.0629C3.66838 10.0629 1.82962 8.22413 1.82962 5.94626C1.82962 3.66838 3.66838 1.82962 5.94626 1.82962C8.22413 1.82962 10.0629 3.66838 10.0629 5.94626C10.0629 8.22413 8.22413 10.0629 5.94626 10.0629Z"
        fill={theme.colors.foregroundHighEmphasis}
        fillOpacity="0.48"
      />
    </Svg>
  );
};

export default Icon;
