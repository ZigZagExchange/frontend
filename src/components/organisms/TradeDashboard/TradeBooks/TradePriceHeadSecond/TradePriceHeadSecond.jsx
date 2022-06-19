import React from "react";
import styled from "styled-components";
import { formatPrice } from "lib/utils";
import Text from "components/atoms/Text/Text";
import { ArrowUpIcon } from "components/atoms/Svg";

const Wrapper = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  // padding: 8px 0px;
  align-items: start;

  div {
    display: flex;
    align-items: center;

    svg path {
      fill: ${({ theme }) => theme.colors.successHighEmphasis};
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
  return (
    <Wrapper>
      <div>
        <Text font="primaryTitleDisplay" color="successHighEmphasis">{parseFloat(formatPrice(props.lastPrice)).toFixed(props.fixedPoint)}</Text>
        <ArrowUpIcon />
      </div>
      {/* <span>$ {
        formatPrice(
          (props.marketInfo?.baseAsset?.usdPrice)
            ? props.marketInfo.baseAsset.usdPrice
            : "--"
        )
      }</span> */}
    </Wrapper>
  );
};

export default TradePriceHeadSecond;
