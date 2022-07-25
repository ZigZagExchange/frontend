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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 0.5C7.44772 0.5 7 0.947715 7 1.5V4.5C7 5.05228 7.44772 5.5 8 5.5C8.55229 5.5 9 5.05228 9 4.5V1.5C9 0.947715 8.55229 0.5 8 0.5Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
      <path
        opacity="0.01"
        d="M13.3035 2.6967C12.913 2.30618 12.2798 2.30618 11.8893 2.6967L9.76799 4.81802C9.37747 5.20855 9.37747 5.84171 9.76799 6.23224C10.1585 6.62276 10.7917 6.62276 11.1822 6.23224L13.3035 4.11092C13.694 3.72039 13.694 3.08723 13.3035 2.6967Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
      <path
        opacity="0.05"
        d="M14.5 7C15.0523 7 15.5 7.44772 15.5 8C15.5 8.55229 15.0523 9 14.5 9H11.5C10.9477 9 10.5 8.55228 10.5 8C10.5 7.44772 10.9477 7 11.5 7H14.5Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
      <path
        opacity="0.1"
        d="M13.3035 13.3033C13.694 12.9128 13.694 12.2796 13.3035 11.8891L11.1822 9.76776C10.7917 9.37724 10.1585 9.37724 9.76799 9.76776C9.37747 10.1583 9.37747 10.7915 9.76799 11.182L11.8893 13.3033C12.2798 13.6938 12.913 13.6938 13.3035 13.3033Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
      <path
        opacity="0.2"
        d="M7 11.5C7 10.9477 7.44772 10.5 8 10.5C8.55229 10.5 9 10.9477 9 11.5V14.5C9 15.0523 8.55229 15.5 8 15.5C7.44772 15.5 7 15.0523 7 14.5V11.5Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
      <path
        opacity="0.4"
        d="M6.23224 9.76778C5.84171 9.37725 5.20855 9.37725 4.81802 9.76778L2.6967 11.8891C2.30618 12.2796 2.30618 12.9128 2.6967 13.3033C3.08723 13.6938 3.72039 13.6938 4.11092 13.3033L6.23224 11.182C6.62276 10.7915 6.62276 10.1583 6.23224 9.76778Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
      <path
        opacity="0.6"
        d="M4.5 7C5.05228 7 5.5 7.44772 5.5 8C5.5 8.55229 5.05228 9 4.5 9H1.5C0.947715 9 0.5 8.55228 0.5 8C0.5 7.44772 0.947715 7 1.5 7H4.5Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
      <path
        opacity="0.8"
        d="M6.23224 6.23222C6.62276 5.8417 6.62276 5.20853 6.23224 4.81801L4.11092 2.69669C3.72039 2.30616 3.08723 2.30616 2.6967 2.69669C2.30618 3.08721 2.30618 3.72038 2.6967 4.1109L4.81802 6.23222C5.20855 6.62274 5.84171 6.62274 6.23224 6.23222Z"
        fill={theme.colors.foregroundHighEmphasis}
      />
    </Svg>
  );
};

export default Icon;
