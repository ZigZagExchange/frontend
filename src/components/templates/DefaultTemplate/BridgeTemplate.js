import { HeaderBridge } from "components";
import styled from "@xstyled/styled-components";

const FixedHeaderTemplate = styled.div`
  padding-top: 56px;
  min-height: 100vh;
`;

export const BridgeTemplate = ({ children }) => {
  return (
    <>
      <HeaderBridge />
      <FixedHeaderTemplate>{children}</FixedHeaderTemplate>
    </>
  );
};
