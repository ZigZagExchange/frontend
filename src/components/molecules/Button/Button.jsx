import React, { cloneElement, isValidElement } from "react";
import Loader from "react-loader-spinner";
import StyledButton from "./StyledButton";
import { scales, variants } from "./types";

const Button = (props) => {
  const {  startIcon, endIcon, className, isLoading, disabled, children, ...rest } = props;
  const isDisabled = isLoading || disabled;
  const classNames = className ? [className] : [];

  return (
    <StyledButton
      isLoading={isLoading}
      className={classNames.join(" ")}
      disabled={isDisabled}
      {...rest}
    >
      {isLoading && <Loader type="TailSpin" color="#FFF" height={16} width={16} />}
			<>
			{isValidElement(startIcon) &&
          cloneElement(startIcon, {
            mr: "0.5rem",
          })}
      {children}
			{isValidElement(endIcon) &&
          cloneElement(endIcon, {
            ml: "0.5rem",
          })}
			</>
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
