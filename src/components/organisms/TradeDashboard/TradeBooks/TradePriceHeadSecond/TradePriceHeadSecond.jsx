import React, { useEffect, useState } from "react";
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
      fill: ${({ theme, isIncrease }) => (isIncrease ? theme.colors.successHighEmphasis : theme.colors.dangerHighEmphasis)};
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
  const [lastPrice, setLastPrice] = useState(0);
  const [isIncrease, setIncrease] = useState(true);

  useEffect(()=>{
    if(props.lastPrice > lastPrice)
      setIncrease(true)
    else if(props.lastPrice < lastPrice)
      setIncrease(false)
    setLastPrice(props.lastPrice)
  },[props.lastPrice])
  return (
    <Wrapper isIncrease={isIncrease}>
      <div>
        <Text font="primaryTitleDisplay" color={isIncrease ? "successHighEmphasis" : "dangerHighEmphasis"}>{parseFloat(formatPrice(lastPrice))}</Text>
        {isIncrease ? <ArrowUpIcon /> : <ArrowDownIcon />} 
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
