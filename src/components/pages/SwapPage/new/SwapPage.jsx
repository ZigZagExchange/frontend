import React, { useEffect, useMemo, useState } from "react";
import useTheme from "components/hooks/useTheme";

import { Link } from "react-router-dom";
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
  // const isSwapCompatible = useMemo(
  //   () => network && api.isImplemented("depositL2"),
  //   [network]
  // );
  // const tab = useParams().tab || "swap";

  const { isDark } = useTheme();
  const [pairs, setGetPairs] = useState([]);
  const [fromTokenList, setFromTokenList] = useState([]);
  const [fromToken, setFromToken] = useState();
  const [toToken, setToToken] = useState();

  useEffect(() => {
    const timer = setInterval(() => {
      setFromTokenList(api.getCurrencies());
      setGetPairs(api.getPairs());
    }, 500);
    if (fromTokenList.length > 0) {
      clearInterval(timer);
    }
    return () => {
      clearInterval(timer);
    };
  }, [fromTokenList]);

  const fromTokenOptions = useMemo(() => {
    if (fromTokenList.length > 0) {
      const p = fromTokenList.map((item, index) => {
        return { id: index, name: item };
      });
      setFromToken(p[0]);
      return p;
    } else {
      return [];
    }
  }, [fromTokenList]);

  const toTokenOptions = useMemo(() => {
    const p = pairs.map((item) => {
      const a = item.split("-")[0];
      const b = item.split("-")[1];
      if (a === fromToken.name) {
        return b;
      } else if (b === fromToken.name) {
        return a;
      } else {
        return null;
      }
    });
    var filtered = p
      .filter(function (el) {
        return el != null;
      })
      .map((item, index) => {
        return { id: index, name: item };
      });
    setToToken(filtered[0]);
    return filtered;
  }, [fromToken, pairs]);

  const onChangeFromToken = (option) => {
    setFromToken(option);
  };

  const onChangeToToken = (option) => {
    setToToken(option);
  };

  const onSwitchTokenBtn = () => {
    const p = fromTokenOptions.find((item) => item.name === toToken.name);
    setFromToken(p);
  };

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
          <SwapContianer
            fromTokenOptions={fromTokenOptions}
            onSelectedFromToken={onChangeFromToken}
            selectedFromToken={fromToken}
            toTokenOptions={toTokenOptions}
            onSelectedToToken={onChangeToToken}
            selectedToToken={toToken}
            onSwitchTokenBtn={onSwitchTokenBtn}
          />
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
