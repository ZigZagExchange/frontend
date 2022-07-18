import React, { cloneElement, isValidElement } from "react";
import { LoadingSpinner } from "components/atoms/LoadingSpinner";
import StyledButton from "./StyledButton";
import { scales, variants } from "./types";
import { useSelector } from "react-redux";
import { isBridgeConnectingSelector } from "lib/store/features/api/apiSlice";

const Button = (props) => {
  const {
    startIcon,
    endIcon,
    className,
    isLoading,
    disabled,
    children,
    ...rest
  } = props;
  const isDisabled = isLoading || disabled;
  const classNames = className ? [className] : [];
  const isBridgeConnecting = useSelector(isBridgeConnectingSelector);

  return (
    <StyledButton
      isLoading={isLoading}
      className={classNames.join(" ")}
      disabled={isDisabled}
      {...rest}
    >
      {isLoading && isBridgeConnecting ? (
        <LoadingSpinner size={16} style={{ paddingRight: "8px" }} />
      ) : (
        <>
          {isLoading && (
            <LoadingSpinner size={16} style={{ paddingRight: "8px" }} />
          )}
          {isValidElement(startIcon) &&
            cloneElement(startIcon, {
              style: { marginRight: "8px" },
            })}
          {children}
          {isValidElement(endIcon) &&
            cloneElement(endIcon, {
              style: { marginLeft: "8px" },
            })}
        </>
      )}
    </StyledButton>
  );
};

Button.defaultProps = {
  isLoading: false,
  variant: variants.PRIMARY,
  scale: scales.MD,
  disabled: false,
};

export default Button;
