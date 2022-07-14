import styled from "styled-components";
import { space, layout, variant } from "styled-system";
import { scaleVariants, styleVariants } from "./theme";

const StyledButton = styled.button`
  align-items: center;
  border: 1px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
	font-family: Inter;
  justify-content: center;
  letter-spacing: 0.01em;
  line-height: 1;
  outline: 0;

  ${variant({
    prop: "scale",
    variants: scaleVariants,
  })}

  ${({ theme }) =>
    variant({
      variants: styleVariants(theme),
    })}

  ${layout}

    transition: color .25s;

  div {
    transition: color .25s;
  }

  svg path {
    transition: fill .25s;
  }

  &:hover {
    svg path {
      fill: ${({ show, theme }) =>
        !show ? `${theme.colors.primaryHighEmphasis} !important` : ""}}

  &:hover {
    div {
      color: ${({ show, theme }) =>
        !show ? `${theme.colors.primaryHighEmphasis} !important` : ""}}

  &:hover {
    color: ${({ variant, theme }) =>
      variant === "outlined"
        ? `${theme.colors.primaryHighEmphasis} !important`
        : ""}
`;

export default StyledButton;
