import React, { useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import "./SpotBox.css";
// assets
import { SpotForm } from "components";
import { ToggleButton } from "components/molecules/Toggle";
import { IconButton as baseIcon } from "components/molecules/IconButton";
import { CalculatorIcon } from "components/atoms/Svg";
import { TabMenu, Tab } from "components/molecules/TabMenu";
import { settingsSelector } from "lib/store/features/api/apiSlice";

const SpotBox = ({
  marketInfo,
  lastPrice,
  currentMarket,
  user,
  activeOrderCount,
  liquidity,
  marketSummary,
  allOrders,
  userOrders,
  balances
}) => {
  const [selectedLayer, setSelectedLayer] = useState(1);
  const [index, setIndex] = useState(1);
  const [orderType, updateOrderType] = useState("market");

  const toggleClick = (num) => setSelectedLayer(num);
  const settings = useSelector(settingsSelector);
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
      allOrders={allOrders}
      userOrders={userOrders}
      balances={balances}
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
      allOrders={allOrders}
      balances={balances}
    />
  );

  const renderSpotForm = () => {
    return selectedLayer === 1 ? BuyForm : SellForm;
  };
  const isMobile = window.innerWidth < 992;

  return (
    <Wrapper isMobile={isMobile}>
      <ToggleWrapper>
        <StyledToggleButton
          width={window.innerWidth < 600 ? 70 : 126}
          leftLabel="BUY"
          rightLabel="SELL"
          selectedLayer={selectedLayer}
          toggleClick={toggleClick}
        />
        {/* <IconButton variant="secondary" startIcon={<CalculatorIcon />}></IconButton> */}
      </ToggleWrapper>
      <StyledTabMenu left activeIndex={index} onItemClick={handleTabClick}>
        <Tab>Limit</Tab>
        <Tab>Market</Tab>
      </StyledTabMenu>
      <SpotFormWrapper>{lastPrice ? renderSpotForm() : ""}</SpotFormWrapper>
    </Wrapper>
  );
};

export default SpotBox;

const Wrapper = styled.div`
  // display: grid;
  grid-auto-flow: row;
  background-color: ${({ theme }) => theme.colors.backgroundMediumEmphasis};
  height: ${({ isMobile }) => (isMobile ? "457px" : "428px")};
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

const IconButton = styled(baseIcon)`
  width: 32px;
  height: 32px;
  background-color: ${({ theme }) => theme.colors.foreground300};
  border-radius: 8px;
  padding: 0px !important;
  svg {
    margin-right: 0px !important;
    margin-left: 0px !important;
  }
`;

const StyledTabMenu = styled(TabMenu)`
  margin: 0px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.foreground400};
`;

const SpotFormWrapper = styled.div``;
