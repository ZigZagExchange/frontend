import React from "react";
import styled from "styled-components";
import { formatPrice } from "lib/utils";
import { SettingsIcon } from "components/atoms/Svg";
import Button from "components/molecules/Button/Button";
import Text from "components/atoms/Text/Text";
// css
import api from "lib/api";
import "./TradeRatesCard.css";

class TradeRatesCard extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      marketInfo: null,
    };
  }

  componentDidUpdate() {
    if (
      this.props.marketInfo &&
      this.props.marketInfo !== this.state.marketInfo
    ) {
      var marketInfo = this.props.marketInfo;

      //add ticker name
      var state = {
        marketInfo: marketInfo,
      };

      this.setState(state);
    }
  }

  componentDidMount() {
    //get token name
  }

  render() {
    var marketInfo = this.state.marketInfo;

    let marketDisplay = "--/--";
    if (this.state.marketInfo) {
      marketInfo = this.state.marketInfo;
      marketDisplay = <div>{marketInfo.baseAsset.symbol}/{marketInfo.quoteAsset.symbol}</div>;
    }
    const percentChange = (
      (this.props.marketSummary.priceChange / this.props.marketSummary.price) *
      100
    ).toFixed(2);

    if (!this.state.marketInfo) {
      return null
    }

    return (
      <Wrapper>
        <RatesCardsWrapper>
          <RatesCard>
            <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">Price</Text>
            <Text font="primaryMediumSmallSemiBold" color="foregroundHighEmphasis">{this.props.marketSummary.price}</Text>
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
          <RatesCard>
            <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">24h High</Text>
            <Text font="primaryMediumSmallSemiBold" color="foregroundHighEmphasis">{this.props.marketSummary["24hi"]}</Text>
          </RatesCard>
          <RatesCard>
            <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">24h Low</Text>
            <Text font="primaryMediumSmallSemiBold" color="foregroundHighEmphasis">{this.props.marketSummary["24lo"]}</Text>
          </RatesCard>
          <RatesCard>
            <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">24h Volume({marketInfo && marketInfo.baseAsset.symbol})</Text>
            <Text font="primaryMediumSmallSemiBold" color="foregroundHighEmphasis">{this.props.marketSummary.baseVolume}</Text>
          </RatesCard>
          <RatesCard>
            <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">24h Volume({marketInfo && marketInfo.quoteAsset.symbol})</Text>
            <Text font="primaryMediumSmallSemiBold" color="foregroundHighEmphasis">{this.props.marketSummary.quoteVolume}</Text>
          </RatesCard>
        </RatesCardsWrapper>
        <Button endIcon={<SettingsIcon/>} variant="outlined" scale="imd" mr="8px">
            Settings
        </Button>
      </Wrapper>
    );
  }
}

export default TradeRatesCard;

const Wrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const RatesCardsWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 40px;
`

const RatesCard = styled.div`
  display: grid;
  grid-auto-flow: row;
  align-items: center;
  justify-content: center;
  gap: 2px;
`