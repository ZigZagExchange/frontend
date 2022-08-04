import React, { useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
// assets
import { SpotForm } from "components";
import { ToggleButton } from "components/molecules/Toggle";
import { TabMenu, Tab } from "components/molecules/TabMenu";
import {
  settingsSelector,
  networkSelector,
} from "lib/store/features/api/apiSlice";
import useTheme from "components/hooks/useTheme";

const SpotBox = ({
  marketInfo,
  lastPrice,
  currentMarket,
  user,
  activeOrderCount,
  liquidity,
  marketSummary,
  askBins,
  bidBins,
  userOrders,
  balances,
}) => {
  const [selectedLayer, setSelectedLayer] = useState(1);
  const [index, setIndex] = useState(1);
  const [orderType, updateOrderType] = useState("market");

  const { isDark } = useTheme();

  const toggleClick = (num) => setSelectedLayer(num);
  const settings = useSelector(settingsSelector);
  const network = useSelector(networkSelector);
  const handleTabClick = (newIndex) => {
    setIndex(newIndex);
    if (newIndex === 0) updateOrderType("limit");
    else updateOrderType("market");
  };

  const BuyForm = (
    <SpotForm
      side="b"
      lastPrice={lastPrice}
      user={user}
      currentMarket={currentMarket}
      orderType={orderType}
      activeOrderCount={activeOrderCount}
      liquidity={liquidity}
      marketInfo={marketInfo}
      marketSummary={marketSummary}
      settings={settings}
      askBins={askBins}
      bidBins={bidBins}
      userOrders={userOrders}
      balances={balances}
      network={network}
    />
  );

  const SellForm = (
    <SpotForm
      side="s"
      lastPrice={lastPrice}
      user={user}
      currentMarket={currentMarket}
      orderType={orderType}
      activeOrderCount={activeOrderCount}
      liquidity={liquidity}
      marketInfo={marketInfo}
      marketSummary={marketSummary}
      settings={settings}
      askBins={askBins}
      bidBins={bidBins}
      userOrders={userOrders}
      balances={balances}
      network={network}
    />
  );

  const renderSpotForm = () => {
    return selectedLayer === 1 ? BuyForm : SellForm;
  };
  const isMobile = window.innerWidth < 992;

  return (
    <Wrapper isMobile={isMobile} isDark={isDark}>
      <ToggleWrapper>
        <StyledToggleButton
          width={window.innerWidth < 600 ? 70 : 126}
          leftLabel="BUY"
          rightLabel="SELL"
          selectedLayer={selectedLayer}
          toggleClick={toggleClick}
        />
      </ToggleWrapper>
      <StyledTabMenu left activeIndex={index} onItemClick={handleTabClick}>
        <Tab>Limit</Tab>
        <Tab>Market</Tab>
      </StyledTabMenu>
      <SpotFormWrapper>{renderSpotForm()}</SpotFormWrapper>
    </Wrapper>
  );
};

export default SpotBox;

const Wrapper = styled.div`
  // display: grid;
  grid-auto-flow: row;
  background-color: ${({ theme, isDark }) =>
    isDark
      ? theme.colors.backgroundMediumEmphasis
      : theme.colors.backgroundHighEmphasis};
  height: ${({ isMobile }) => (isMobile ? "457px" : "460px")};
`;

const ToggleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 0px;
`;

const StyledToggleButton = styled(ToggleButton)`
  border: 1px solid ${({ theme }) => theme.colors.foreground400} !important;
`;

const StyledTabMenu = styled(TabMenu)`
  margin: 0px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.foreground400};
`;

const SpotFormWrapper = styled.div``;
