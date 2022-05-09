import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import useTheme from "components/hooks/useTheme";

import { useParams, Link } from "react-router-dom";
import { networkSelector } from "lib/store/features/api/apiSlice";
import { DefaultTemplate } from "components";
import { ExternalLinkIcon, InfoIcon } from "components/atoms/Svg";
import NetworkSelection from "components/organisms/NetworkSelection";
import SwapContianer from "./SwapContainer";

import classNames from "classnames";
import api from "lib/api";
import "../SwapPage.style.css";
import TransactionSettings from "./TransationSettings";
import { Button } from "components/molecules/Button";

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
          <p className="mt-8 text-3xl font-semibold ">Quick DEX Swap</p>
          <p className="mt-2 text-sm text-gray-500">
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
          <div className="flex items-center justify-between mt-4">
            <p>Network</p>
            <InfoIcon size={16} />
          </div>
          <NetworkSelection className="mt-2" />
          <SwapContianer />
          <TransactionSettings />
          <Button
            isLoading={false}
            className="w-full py-3 mt-3 uppercase"
            scale="imd"
          >
            Exchange
          </Button>
        </div>
      </div>
    </DefaultTemplate>
  );
}
