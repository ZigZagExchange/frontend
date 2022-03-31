import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  html,body{
    font-family: 'Work Sans', sans-serif;
    background-color: ${({ theme }) => theme.colors.backgroundHighEmphasis};
    color: ${({ theme }) => theme.colors.foregroundHighEmphasis};
  }
`;