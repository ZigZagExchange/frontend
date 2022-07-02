import React from "react";
import styled from "styled-components";
import { formatPrice } from "lib/utils";
import { SettingsIcon } from "components/atoms/Svg";
import Button from "components/molecules/Button/Button";
import Text from "components/atoms/Text/Text";
// css
import api from "lib/api";
import "./TradeRatesCard.css";
import SettingsModal from "./SettingsModal";
import { TokenPairDropdown } from "components/molecules/Dropdown";
import useModal from "components/hooks/useModal";

const TradeRatesCard = ({
  updateMarketChain,
  marketSummary,
  rowData,
  currentMarket,
  marketInfo,
}) => {
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
          />
        </MarketSelector>
        <RatesCardsWrapper>
          <RatesCard>
            <Text
              font="primaryHeading6"
              color={
                percentChange === "NaN"
                  ? "black"
                  : parseFloat(marketSummary["priceChange"]) >= 0
                  ? "successHighEmphasis"
                  : "dangerHighEmphasis"
              }
            >
              {marketSummary.price ? marketSummary.price : "--"}
            </Text>
            <Text
              font="primaryTiny"
              color="foregroundHighEmphasis"
            >
              $ {
                (marketInfo?.baseAsset?.usdPrice)
                  ? marketInfo.baseAsset.usdPrice
                  : "--"
              }
            </Text>
          </RatesCard>
          {/* <RatesCard>
            <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">24h Change</Text>
            <Text font="primaryMediumSmallSemiBold" color="foregroundHighEmphasis">
              {this.props.marketSummary.priceChange &&
                formatPrice(this.props.marketSummary.priceChange / 1)
              }{" "}
              {percentChange !== 'NaN' && `${percentChange}%`}
            </Text>
          </RatesCard> */}
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
                  24h Change
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
                    formatPrice(marketSummary.priceChange / 1)}{" "}
                  {percentChange !== "NaN" ? `(${percentChange}%)` : "--"}
                </Text>
              </RatesCard>
              <Divider />
              <RatesCard>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  24h High
                </Text>
                <Text
                  font="primaryMediumSmallSemiBold"
                  color="foregroundHighEmphasis"
                >
                  {marketSummary["24hi"] ?? "--"}
                </Text>
              </RatesCard>
              <Divider />
              <RatesCard>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  24h Low
                </Text>
                <Text
                  font="primaryMediumSmallSemiBold"
                  color="foregroundHighEmphasis"
                >
                  {marketSummary["24lo"] ?? "--"}
                </Text>
              </RatesCard>
              <Divider />
              <RatesCard>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  24h Volume({marketInfo && marketInfo.baseAsset.symbol})
                </Text>
                <Text
                  font="primaryMediumSmallSemiBold"
                  color="foregroundHighEmphasis"
                >
                  {marketSummary.baseVolume ?? "--"}
                </Text>
              </RatesCard>
              <Divider />
              <RatesCard>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  24h Volume({marketInfo && marketInfo.quoteAsset.symbol})
                </Text>
                <Text
                  font="primaryMediumSmallSemiBold"
                  color="foregroundHighEmphasis"
                >
                  {marketSummary.quoteVolume ?? "--"}
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
  background-color: ${({ theme }) => theme.colors.backgroundLowEmphasis};
`;
