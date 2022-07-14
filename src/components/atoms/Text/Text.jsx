import styled from "styled-components";
import {
  space,
  typography as baseTypography,
  border,
  color as baseColor,
} from "styled-system";
import typography from "../../../lib/theme/typography";

const Text = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 10px;
  font-family: ${({ font }) => typography[font]?.fontFamily};
  font-size: ${({ font }) => typography[font]?.fontSize};
  line-height: ${({ font }) => typography[font]?.lineHeight};
  color: ${({ color }) => color};
  letter-spacing: ${({ font }) => typography[font]?.letterSpacing || "inherit"};
  text-transform: ${({ font }) => typography[font]?.textTransform || "inherit"};
  text-align: ${({ align }) => align || "left"};
  word-break: ${({ breakWords }) => breakWords && "break-word"};
  white-space: pre-wrap;
  ${space}
  ${baseTypography}
  ${border}
  ${baseColor}
`;

export default Text;
