import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  html,body{
    font-family: 'WorkSans-Regular', sans-serif;
    background-color: ${({ theme }) => theme.colors.backgroundHighEmphasis};
    color: ${({ theme }) => theme.colors.foregroundHighEmphasis};
  }
`;
