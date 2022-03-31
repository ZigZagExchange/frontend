import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  html,body{
    background-color: ${({ theme }) => theme.colors.background};
  }
`;