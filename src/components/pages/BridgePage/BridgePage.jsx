import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, Link, useHistory } from "react-router-dom";
import { Box } from "@material-ui/core";
import styled from "@xstyled/styled-components";
import { networkSelector } from "lib/store/features/api/apiSlice";
import { DefaultTemplate } from "components";
import api from "lib/api";
import Bridge from "./Bridge/Bridge";
import BridgeReceipts from "./BridgeReceipts/BridgeReceipts";
import BridgeIncompatible from "./Bridge/BridgeIncompatible";
import "./BridgePage.style.css";
import Text from "components/atoms/Text/Text";
import { TabMenu, Tab } from "components/molecules/TabMenu";

const BridgeSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: calc(100vh - 48px);
  height: 100%;
  background-color: ${({ theme }) => theme.colors.backgroundHighEmphasis};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  padding: 2rem 0;

  a:hover {
    color: ${({ theme }) => theme.colors.primaryHighEmphasis};
  }
`

const BridgeContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  @media screen and (max-width: 480px) {
    padding: 0 10px;
  }
`

const StyledTabMenu = styled(TabMenu)`
  margin: 16px 0px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.foreground400};
`

export default function BridgePage() {
  const [index, setIndex] = useState(0);
  const history = useHistory();
  const network = useSelector(networkSelector);
  const isBridgeCompatible = useMemo(
    () => network && api.isImplemented("depositL2"),
    [network]
  );
  const tab = useParams().tab || "bridge";
  const handleTabClick = (newIndex) => {
    setIndex(newIndex);
    if(newIndex === 0)
      history.push('/bridge')
    else
      history.push('/bridge/receipts')
  }

  return (
    <DefaultTemplate>
      <BridgeSection>
        <BridgeContainer>
          <Text font="primaryHeading4" color="foregroundHighEmphasis">ZigZag Bridge</Text>
          <StyledTabMenu left activeIndex={index} onItemClick={handleTabClick}>
            <Tab>BRIDGE</Tab>
            <Tab>TRANSFER HISTORY</Tab>
          </StyledTabMenu>
        </BridgeContainer>
        <BridgeContainer style={{ flex: "1 1 auto" }}>
          {isBridgeCompatible ? (
            index === 0 || tab === "bridge" ? (
              <Bridge />
            ) : (
              <BridgeReceipts />
            )
          ) : (
            <BridgeIncompatible />
          )}
        </BridgeContainer>
      </BridgeSection>
    </DefaultTemplate>
  );
}
