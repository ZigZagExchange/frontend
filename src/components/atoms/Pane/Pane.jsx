import React from "react";
import styled, {css} from '@xstyled/styled-components'


const PaneStyled = styled.div`
  border-radius: ${props => props.theme.space[1]};
  
  ${({ size }) => size === "sm" && css`
    padding: ${({theme}) => theme.space[3]};
  `}

  ${({ size }) => size === "md" && css`
    padding: ${({theme}) => theme.space[10]};
  `}
  
  ${({ variant }) => variant === "primary" && css`
    background: ${({theme}) => theme.colors.gray[200]};
  `}

  ${({ variant }) => variant === "secondary" && css`
    background: ${({theme}) => theme.colors.gray[100]};
  `}
`

const Pane = ({size, variant = "secondary", children}) => {
  return <PaneStyled size={size} variant={variant}>
    {children && children}
  </PaneStyled>
}

export default Pane

