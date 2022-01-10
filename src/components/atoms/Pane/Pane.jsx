import React from "react";
import styled, {css} from '@xstyled/styled-components'


const PaneStyled = styled.div`
  ${({ size }) => size === "xs" && css`
    border-radius: ${({ theme }) => theme.space[1]};
    padding: ${({theme}) => theme.space[3]};
  `}
  
  ${({ size }) => size === "sm" && css`
    border-radius: ${({ theme }) => theme.space[4]};
    padding: ${({theme}) => theme.space[7]};
  `}

  ${({ size }) => size === "md" && css`
    border-radius: ${({ theme }) => theme.space[9]};
    padding: ${({theme}) => theme.space[10]};
  `}
  
  ${({ variant }) => variant === "primary" && css`
    background: ${({theme}) => theme.colors.blue[600]};
  `}

  ${({ variant }) => variant === "secondary" && css`
    background: ${({theme}) => theme.colors.blue[500]};
  `}
`

const Pane = ({size = "sm", variant = "primary", style, children}) => {
  return <PaneStyled size={size} variant={variant} style={style}>
    {children && children}
  </PaneStyled>
}

export default Pane

