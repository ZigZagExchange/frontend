import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import useTheme from "components/hooks/useTheme";

import { useParams, Link } from "react-router-dom";
import { networkSelector } from "lib/store/features/api/apiSlice";
import { DefaultTemplate } from "components";
import { ExternalLinkIcon } from "components/atoms/Svg";
import cx from "classnames";
import api from "lib/api";
import Swap from "../Swap/Swap";
import SwapReceipts from "../SwapReceipts/SwapReceipts";
import SwapIncompatible from "../Swap/SwapIncompatible";
import "../SwapPage.style.css";

import NetworkDropdown from './NetworkDropdown'
import {SwapSection, SwapHeader, SwapContainer, SwapDescription, SwapLearnMore} from './StyledComponents'


export default function SwapPage() {
  const network = useSelector(networkSelector);
  const isSwapCompatible = useMemo(
    () => network && api.isImplemented("depositL2"),
    [network]
  );
  const tab = useParams().tab || "swap";

  const {theme} = useTheme()

  console.log(theme)

  return (
    <DefaultTemplate>
      <SwapSection>
        <SwapContainer>
          <SwapHeader>
            Quick DEX Swap
          </SwapHeader>
          <SwapDescription>
            Swap into more than 200 tokens, using the best quotes from over 8 sources.
          </SwapDescription>
          <Link to="/"><SwapLearnMore>Learn More <ExternalLinkIcon size={12} /></SwapLearnMore></Link>
          <NetworkDropdown />
        </SwapContainer>
      </SwapSection>
    </DefaultTemplate>
  );
}
