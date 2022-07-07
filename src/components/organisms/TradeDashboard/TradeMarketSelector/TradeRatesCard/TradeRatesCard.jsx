import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { formatPrice, addComma } from "lib/utils";
import { SettingsIcon } from "components/atoms/Svg";
import Button from "components/molecules/Button/Button";
import Text from "components/atoms/Text/Text";
// css
import "./TradeRatesCard.css";
import SettingsModal from "./SettingsModal";
import { TokenPairDropdown } from "components/molecules/Dropdown";
import useModal from "components/hooks/useModal";
import useTheme from "components/hooks/useTheme";
import { settingsSelector } from "lib/store/features/api/apiSlice";
import {
  fetchFavourites,
} from "lib/helpers/storage/favourites";
import { ActivatedStarIcon } from "components/atoms/Svg";
import { Box } from "@material-ui/core";
import _ from "lodash";
import { darkColors, lightColors } from "lib/theme/colors";

const TradeRatesCard = ({
  updateMarketChain,
  marketSummary,
  rowData,
  currentMarket,
  marketInfo,
}) => {
  const { isDark } = useTheme()

  const [lastPrice, setLastPrice] = useState(0);
  const [isIncrease, setIncrease] = useState(true);
  const [favourites, setFavourites] = useState(fetchFavourites())
  const [isOpen, setOpen] = useState(false);

  const settings = useSelector(settingsSelector);

  useEffect(() => {
    if (marketSummary.price > lastPrice)
      setIncrease(true)
    else if (marketSummary.price < lastPrice)
      setIncrease(false)
    setLastPrice(marketSummary.price)
  }, [marketSummary.price])

  const handleOnModalClose = () => {
    onSettingsModalClose();
  };

  const [onSettingsModal, onSettingsModalClose] = useModal(
    <SettingsModal onDismiss={() => handleOnModalClose()} />
  );

  const handleSettings = () => {
    onSettingsModal();
  };

  const isMobile = window.innerWidth < 800;
  const percentChange = (
    (marketSummary.priceChange / marketSummary.price) *
    100
  ).toFixed(2);

  return (
    <Wrapper>
      <LeftWrapper>
        <MarketSelector>
          <TokenPairDropdown
            width={isMobile ? 83 : 223}
            transparent
            rowData={rowData}
            updateMarketChain={updateMarketChain}
            currentMarket={currentMarket}
            marketInfo={marketInfo}
            onFavourited={(items) => { setFavourites(items);}}
          />
        </MarketSelector>
        <RatesCardsWrapper>
          {_.indexOf(favourites, currentMarket) !== -1 &&
            <Box style={{ cursor: 'pointer' }} position="relative" onMouseEnter={() => { setOpen(true) }} onMouseLeave={() => { setOpen(false) }}>
              <ActivatedStarIcon />
              {isOpen && <Box position='absolute' left="-50px" top="calc(100% + 1px)" width="140px" borderRadius={'5px'} overflow="hidden" display='flex' flexDirection="column" zIndex={1000}>
                <Box
                  px="15px"
                  py="7px"
                  boxSizing="boder-box"
                  fontSize={16}
                  fontWeight="bold"
                  borderBottom={`1px solid ${isDark ? darkColors.foreground400 : lightColors.foreground400}`}
                  bgcolor={isDark ? darkColors.backgroundLowEmphasis : lightColors.backgroundLowEmphasis}
                  color={isDark ? darkColors.foregroundHighEmphasis : lightColors.foregroundHighEmphasis}
                >Favorites</Box>
                {_.map(favourites, (item, index) => {
                  return <Box
                    px="15px"
                    py="7px"
                    key={index}
                    boxSizing="boder-box"
                    fontSize={14}
                    borderBottom={index !== favourites.length - 1 ? `1px solid ${isDark ? darkColors.foreground400 : lightColors.foreground400}` : ''}
                    bgcolor={isDark ? darkColors.backgroundLowEmphasis : lightColors.backgroundLowEmphasis}
                    color={isDark ? darkColors.foregroundHighEmphasis : lightColors.foregroundHighEmphasis}
                    onClick={() => {
                      updateMarketChain(item);
                      setOpen(false)
                    }}
                  >{item}</Box>
                })}
              </Box>}
            </Box>
          }
          <RatesCard>
            <Text
              font="primaryHeading6"
              color={
                percentChange === "NaN"
                  ? "black"
                  : isIncrease
                    ? "successHighEmphasis"
                    : "dangerHighEmphasis"
              }
            >
              {marketSummary.price ? addComma(marketSummary.price) : "--"}
            </Text>
            <Text
              font="primaryTiny"
              color="foregroundHighEmphasis"
            >
              $ {
                (marketInfo?.baseAsset?.usdPrice)
                  ? addComma(marketInfo.baseAsset.usdPrice)
                  : "--"
              }
            </Text>
          </RatesCard>
          {isMobile ? (
            <></>
          ) : (
            <>
              <Divider />
              <RatesCard>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  <>
                    {settings.showNightPriceChange
                      ? "UTC Change"
                      : "24h Change"
                    }
                  </>
                </Text>
                <Text
                  font="primaryMediumSmallSemiBold"
                  color={
                    percentChange === "NaN"
                      ? "black"
                      : parseFloat(marketSummary["priceChange"]) >= 0
                        ? "successHighEmphasis"
                        : "dangerHighEmphasis"
                  }
                >
                  {marketSummary.priceChange &&
                    formatPrice(marketSummary.priceChange / 1)}{" | "}
                  {percentChange !== "NaN" ? `${percentChange}%` : "--"}
                </Text>
              </RatesCard>
              <Divider />
              <RatesCard>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  <>
                    {settings.showNightPriceChange
                      ? "UTC High"
                      : "24h High"
                    }
                  </>
                </Text>
                <Text
                  font="primaryMediumSmallSemiBold"
                  color="foregroundHighEmphasis"
                >
                  {marketSummary && marketSummary["24hi"] ? addComma(marketSummary["24hi"]): "--"}
                </Text>
              </RatesCard>
              <Divider />
              <RatesCard>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  <>
                    {settings.showNightPriceChange
                      ? "UTC Low"
                      : "24h Low"
                    }
                  </>
                </Text>
                <Text
                  font="primaryMediumSmallSemiBold"
                  color="foregroundHighEmphasis"
                >
                  {marketSummary && marketSummary["24lo"] ? addComma(marketSummary["24lo"]): "--"}
                </Text>
              </RatesCard>
              <Divider />
              <RatesCard>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  <>
                    {settings.showNightPriceChange
                      ? `UTC Volume(${marketInfo && marketInfo.baseAsset.symbol})`
                      : `24h Volume(${marketInfo && marketInfo.baseAsset.symbol})`
                    }
                  </>
                </Text>
                <Text
                  font="primaryMediumSmallSemiBold"
                  color="foregroundHighEmphasis"
                >
                  {marketSummary && marketSummary.baseVolume ? addComma(marketSummary.baseVolume): "--"}
                </Text>
              </RatesCard>
              <Divider />
              <RatesCard>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  <>
                    {settings.showNightPriceChange
                      ? `UTC Volume(${marketInfo && marketInfo.quoteAsset.symbol})`
                      : `24h Volume(${marketInfo && marketInfo.quoteAsset.symbol})`
                    }
                  </>
                </Text>
                <Text
                  font="primaryMediumSmallSemiBold"
                  color="foregroundHighEmphasis"
                >
                  {marketSummary && marketSummary.quoteVolume ? addComma(marketSummary.quoteVolume): "--"}
                </Text>
              </RatesCard>
            </>
          )}
        </RatesCardsWrapper>
      </LeftWrapper>
      {isMobile ? (
        <SettingsIcon
          style={{ marginRight: "20px" }}
          onClick={handleSettings}
        />
      ) : (
        <Button
          endIcon={<SettingsIcon />}
          variant="outlined"
          scale="imd"
          mr="20px"
          onClick={handleSettings}
        >
          Settings
        </Button>
      )}
    </Wrapper>
  );
};

export default TradeRatesCard;

const Wrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;
const LeftWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
`;

const RatesCardsWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 20px;
  padding-left: 20px;
`;

const MarketSelector = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 10px;
  background-color: ${({ theme }) => theme.colors.backgroundLowEmphasis};
  padding: 0px 24px;
  height: 56px;
`;

const RatesCard = styled.div`
  display: grid;
  grid-auto-flow: row;
  align-items: center;
  justify-content: center;
  gap: 2px;
`;

const Divider = styled.div`
  width: 1px;
  height: 32px;
  background-color: ${({ theme, isDark }) => isDark === "false" ? theme.colors.backgroundMediumEmphasis : theme.colors.foreground400};
`;
