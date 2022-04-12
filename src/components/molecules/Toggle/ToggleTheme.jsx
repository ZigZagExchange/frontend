import React from "react";
import styled from 'styled-components'
import { LightIcon, DarkIcon } from "components/atoms/Svg";

const ToggleThemeWrapper = styled.div`
  display: flex;
  cursor: pointer;
  width: 19px;
`

const ToggleTheme = ({ isDark, toggleTheme }) => (
  <ToggleThemeWrapper onClick={() => toggleTheme(!isDark)}>
      { isDark ? <LightIcon /> : <DarkIcon /> }
  </ToggleThemeWrapper>
);

export default React.memo(ToggleTheme, (prev, next) => prev.isDark === next.isDark);
