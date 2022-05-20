import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import styled from "@xstyled/styled-components";
import { networkSelector } from "lib/store/features/api/apiSlice";
import { BridgeTemplate } from "components";
import api from "lib/api";
import Bridge from "./Bridge/Bridge";
import BridgeReceipts from "./BridgeReceipts/BridgeReceipts";
import BridgeIncompatible from "./Bridge/BridgeIncompatible";
import "./BridgePage.style.css";
import Text from "components/atoms/Text/Text";
import { TabMenu, Tab } from "components/molecules/TabMenu";
import TradeFooter from "components/organisms/TradeDashboard/TradeFooter/TradeFooter";
import ConnectNotification from "./ConnectNotification/ConnectNotification";
import NewBridgeModal from "./NewBridgeModal/NewBridgeModal";

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

const BridgeSection = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 113px);
  padding: 2rem 0;
  background-color: ${(p) => p.theme.colors.bridgeBackground};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  flex-direction: column;
  justify-content: center;

  a:hover {
    color: #09aaf5;
  }

  h3 {
    color: ${(p) => p.theme.colors.foregroundHighEmphasis}
  }
`;

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
    if (newIndex === 0)
      history.push('/bridge')
    else
      history.push('/bridge/receipts')
  }

  return (
    <BridgeTemplate>
      <BridgeSection>
        <BridgeContainer>
          <ConnectNotification />

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

        <NewBridgeModal />
      </BridgeSection>
      <TradeFooter />
    </BridgeTemplate>
  );
}
