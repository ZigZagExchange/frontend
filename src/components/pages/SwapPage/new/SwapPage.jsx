import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import useTheme from "components/hooks/useTheme";

import { useParams, Link } from "react-router-dom";
import { networkSelector } from "lib/store/features/api/apiSlice";
import { DefaultTemplate } from "components";
import { ExternalLinkIcon, InfoIcon } from "components/atoms/Svg";
import NetworkSelection from 'components/organisms/NetworkSelection'
import SwapContianer from './SwapContainer'

import classNames from "classnames";
import api from "lib/api";
import "../SwapPage.style.css";

export default function SwapPage() {
  const network = useSelector(networkSelector);
  const isSwapCompatible = useMemo(
    () => network && api.isImplemented("depositL2"),
    [network]
  );
  const tab = useParams().tab || "swap";

  const { isDark, theme } = useTheme();

  console.log(theme);

  return (
    <DefaultTemplate>
      <div className={classNames("flex justify-center", { dark: isDark })}>
        <div>
          <p className=" text-3xl font-semibold mt-8">Quick DEX Swap</p>
          <p className="text-sm text-gray-500 mt-2">
            Swap into more than 200 tokens, using the best quotes from over 8
            sources.
          </p>
          <Link
            to="/"
            className="flex items-center mt-1 dark:hover:text-foreground-700 dark:text-foreground-900 text-background-900 hover:text-background-800"
          >
            <p className="mr-2">Learn More</p>
            <ExternalLinkIcon size={11} />
          </Link>
          <div className="flex justify-between mt-4 items-center">
            <p>Network</p>
            <InfoIcon size={16} />
          </div>
          <div className="mt-2">
          <NetworkSelection />
          </div>
          <SwapContianer />
        </div>
      </div>
    </DefaultTemplate>
  );
}
