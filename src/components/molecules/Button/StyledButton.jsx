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

  ${({theme})=> variant({
    variants: styleVariants(theme),
  })}

  ${layout}
  ${space}
`;

export default StyledButton;
