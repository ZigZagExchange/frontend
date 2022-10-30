import styled from "styled-components";

const StyledTab = styled.div`
  display: ${({ display }) => (display ? "grid" : "none")};
  grid-auto-flow: row;
  align-items: center;
  cursor: pointer;
  gap: 16px;
`;

export default StyledTab;
