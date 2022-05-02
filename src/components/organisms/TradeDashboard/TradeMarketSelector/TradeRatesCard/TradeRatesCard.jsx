import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { formatPrice } from "lib/utils";
import { SettingsIcon } from "components/atoms/Svg";
import Button from "components/molecules/Button/Button";
import Text from "components/atoms/Text/Text";
// css
import api from "lib/api";
import "./TradeRatesCard.css";
import { Dropdown } from "components/molecules/Dropdown";
import { StarIcon } from "components/atoms/Svg";

const TradeRatesCard = ({updateMarketChain, marketSummary, markets, currentMarket, marketInfo}) => {
  const [pairs, setPairs] = useState([])

  useEffect(() => {
    setPairs(markets.map((r) => { 
      return {text: r, url: '#', icon: <StarIcon />}
    }))
  }, [markets])

  const changeMarket = (pair) => {
    if (pair === currentMarket) return;
    updateMarketChain(pair);
  }

  const isMobile = window.innerWidth < 800

  return (
    <Wrapper>
      <LeftWrapper>
        <MarketSelector>
          <StarIcon />
          <Dropdown 
            width ={isMobile ? 83 : 223} 
            transparent 
            item={pairs} 
            leftIcon 
            context={currentMarket} 
            clickFunction={changeMarket}
          />
        </MarketSelector>
        <RatesCardsWrapper>
          <RatesCard>
            <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">Price</Text>
            <Text font="primaryMediumSmallSemiBold" color="foregroundHighEmphasis">{marketSummary.price}</Text>
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
          {
            isMobile ? <></> :
            <>
              <RatesCard>
                <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">24h High</Text>
                <Text font="primaryMediumSmallSemiBold" color="foregroundHighEmphasis">{marketSummary["24hi"] ?? '--'}</Text>
              </RatesCard>
              <RatesCard>
                <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">24h Low</Text>
                <Text font="primaryMediumSmallSemiBold" color="foregroundHighEmphasis">{marketSummary["24lo"] ?? '--'}</Text>
              </RatesCard>
              <RatesCard>
                <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">24h Volume({marketInfo && marketInfo.baseAsset.symbol})</Text>
                <Text font="primaryMediumSmallSemiBold" color="foregroundHighEmphasis">{marketSummary.baseVolume ?? '--'}</Text>
              </RatesCard>
              <RatesCard>
                <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">24h Volume({marketInfo && marketInfo.quoteAsset.symbol})</Text>
                <Text font="primaryMediumSmallSemiBold" color="foregroundHighEmphasis">{marketSummary.quoteVolume ?? '--'}</Text>
              </RatesCard>
            </>
          }
        </RatesCardsWrapper>
      </LeftWrapper>
      <Button endIcon={<SettingsIcon/>} variant="outlined" scale="imd" mr="20px">
          Settings
      </Button>
    </Wrapper>
  )
}

export default TradeRatesCard;

const Wrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`
const LeftWrapper = styled.div`
display: grid;
grid-auto-flow: column;
align-items: center;
`

const RatesCardsWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 40px;
  padding-left: 20px;
`

const MarketSelector = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 10px;
  background-color: ${({ theme }) => theme.colors.backgroundLowEmphasis};
  padding: 0px 24px;
  height: 74px;
`

const RatesCard = styled.div`
  display: grid;
  grid-auto-flow: row;
  align-items: center;
  justify-content: center;
  gap: 2px;
`