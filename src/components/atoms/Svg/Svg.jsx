import styled, { css, keyframes } from "styled-components";
import { space } from "styled-system";
import { getThemeValue } from "lib/utils";

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const spinStyle = css`
  animation: ${rotate} 2s linear infinite;
`;

const Svg = styled.svg`
  fill: ${({ theme, color }) => getThemeValue(`colors.${color}`, color)(theme)};
  flex-shrink: 0;

  ${({ spin }) => spin && spinStyle}// ${space}
`;

export default Svg;
