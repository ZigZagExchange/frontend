import React from "react";
import styled from "styled-components";
import { formatPrice } from "lib/utils";
import Text from "components/atoms/Text/Text";
import { ArrowUpIcon, ArrowDownIcon } from "components/atoms/Svg";

const Wrapper = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  // padding: 8px 0px;
  align-items: center;
  justify-content: space-between;

  div {
    display: flex;
    align-items: center;

    svg path {
      fill: ${({ theme, isUp }) => isUp ? theme.colors.successHighEmphasis : theme.colors.dangerHighEmphasis};
    }
  }

  @media screen and (min-width: 1800px) {
    width: 100%;
  }

  @media screen and (max-width: 991px) {
    width: 100%;
  }
`

const TradePriceHeadSecond = (props) => {
  const percentChange = (
    (props.marketSummary.priceChange / props.marketSummary.price) *
    100
  ).toFixed(2);
  return (
    <Wrapper isUp={parseFloat(props.marketSummary.priceChange) >= 0}>
      <div>
        <Text 
         font="primaryTitleDisplay" 
         color={
           percentChange === "NaN"
             ? "black"
             : parseFloat(props.marketSummary["priceChange"]) >= 0
             ? "successHighEmphasis"
             : "dangerHighEmphasis"
         }
        >
          {parseFloat(formatPrice(props.lastPrice)).toFixed(props.fixedPoint)}
        </Text>
        {
           percentChange === "NaN"
             ? <></>
             : parseFloat(props.marketSummary["priceChange"]) >= 0
             ? <ArrowUpIcon />
             : <ArrowDownIcon />
         }
      </div>
      <Text font="primaryMediumSmallSemiBold" color="foregroundMediumEmphasis">
        $ {
          formatPrice(
            (props.marketInfo?.baseAsset?.usdPrice)
              ? props.marketInfo.baseAsset.usdPrice
              : "--"
          )
        }
      </Text>
    </Wrapper>
  );
};

export default TradePriceHeadSecond;
