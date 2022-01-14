import React, { useCallback, useEffect, useState } from 'react'
import { useSelector, useDispatch } from "react-redux";
import { DefaultTemplate, TradeDashboard } from 'components'
import api from "lib/api";
import {
  networkSelector,
  userOrdersSelector,
  userFillsSelector,
  allOrdersSelector,
  marketFillsSelector,
  lastPricesSelector,
  marketSummarySelector,
  liquiditySelector,
  currentMarketSelector,
  setCurrentMarket,
  resetData,
} from "lib/store/features/api/apiSlice";
import { userSelector } from "lib/store/features/auth/authSlice";

export default function TradePage() {
  const [marketDataTab, updateMarketDataTab] = useState("fills");
  const user = useSelector(userSelector);
  const network = useSelector(networkSelector);
  const currentMarket = useSelector(currentMarketSelector);
  const userOrders = useSelector(userOrdersSelector);
  const userFills = useSelector(userFillsSelector);
  const allOrders = useSelector(allOrdersSelector);
  const marketFills = useSelector(marketFillsSelector);
  const lastPrices = useSelector(lastPricesSelector);
  const marketSummary = useSelector(marketSummarySelector);
  const liquidity = useSelector(liquiditySelector);
  const dispatch = useDispatch();
  const lastPriceTableData = [];
  const markets = [];

  useEffect(() => {
    const sub = () => {
      dispatch(resetData());
      api.subscribeToMarket(currentMarket);
    };

    if (api.ws.readyState === 0) {
      api.on("open", sub);
    } else {
      sub();
    }

    return () => {
      if (api.ws.readyState !== 0) {
        api.unsubscribeToMarket(currentMarket);
      } else {
        api.off("open", sub);
      }
    };
  }, [network, currentMarket]);

  const updateMarketChain = useCallback((market) => {
    dispatch(setCurrentMarket(market));
  }, [dispatch]);
  
  return (
    <DefaultTemplate>
      <TradeDashboard />
    </DefaultTemplate>
  )
}