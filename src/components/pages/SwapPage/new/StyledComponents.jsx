import styled from "styled-components";

export const SwapSection = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  min-height: calc(100vh - 56px);
  height: 100%;
  background-color: ${(p) => p.theme.colors.backgroundHighEmphasis};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  padding-bottom: ${(p) => p.theme.sizes['8']};
  padding-top: ${(p) => p.theme.sizes['10']};
`

export const SwapContainer = styled.div`
  width: 530px;
`

export const SwapHeader = styled.div`
  font-size: ${(p) => p.theme.fontSizes['3xl']};
  font-weight: ${(p) => p.theme.fontWeights['black']};
`

export const SwapDescription = styled.div`
  font-size: ${(p) => p.theme.fontSizes['sm']};
  font-weight: ${(p) => p.theme.fontWeights['normal']};
  color: ${(p) => p.theme.colors['foregroundMediumEmphasis']};
`

export const SwapLearnMore = styled.div`
  display:flex;
  align-items:center;
  font-size: ${(p) => p.theme.fontSizes['sm']};
  font-weight: ${(p) => p.theme.fontWeights['normal']};
  color: ${(p) => p.theme.colors['foregroundHighEmphasis']};
  text-decoration-color: ${(p) => p.theme.colors['foregroundHighEmphasis']};
  &:hover {
    opacity: 0.8;
  }
  svg {
    margin-left: ${(p) => p.theme.sizes['1s']};
  }
`

export const NetworkDropDownLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${(p) => p.theme.sizes['5']};
`

