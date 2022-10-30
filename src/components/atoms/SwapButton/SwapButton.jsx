import React from "react";
import styled from "@xstyled/styled-components";

const StyledSwapButton = styled.button`
  border: 0;
  width: 60px;
  height: 60px;
  border-radius: 60px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.foreground400};

  > svg {
    transition: all 0.2s ease-in-out;
    width: 20px;
    height: 20px;
    fill: ${(p) => p.theme.colors.foregroundHighEmphasis};
  }

  &:hover > svg {
    transform: rotate(180deg);
  }
`;

export const SwapButton = (props) => {
  return (
    <StyledSwapButton type="button" className="swap_button" {...props}>
      <svg width="54" height="66" viewBox="0 0 54 66" fill="none">
        <path d="M39 65.24L53.12 51.12C53.6818 50.5575 53.9974 49.795 53.9974 49C53.9974 48.205 53.6818 47.4425 53.12 46.88L39 32.76L34.76 37L43.76 46H8V52H43.76L34.76 61L39 65.24Z" />
        <path d="M15 0.760002L0.879999 14.88C0.318197 15.4425 0.00263977 16.205 0.00263977 17C0.00263977 17.795 0.318197 18.5575 0.879999 19.12L15 33.24L19.24 29L10.24 20H46V14H10.24L19.24 5L15 0.760002Z" />
      </svg>
    </StyledSwapButton>
  );
};
