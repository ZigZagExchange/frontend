import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { ToastContainer, toast } from "react-toastify";
import { DefaultTemplate, Footer, TradeChart } from "components";
import "react-toastify/dist/ReactToastify.css";
import TradeHead from "components/TradeComponents/TradeHead/TradeHead";
import TradePriceTable from "components/TradeComponents/TradePriceTable/TradePriceTable";
import TradePriceBtcTable from "components/TradeComponents/TradePriceBtcTable/TradePriceBtcTable";
import TradePriceHeadSecond from "components/TradeComponents/TradePriceHeadSecond/TradePriceHeadSecond";
import SpotBox from "components/TradeComponents/SpotBox/SpotBox";
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
} from "lib/store/features/api/apiSlice";
import { userSelector } from "lib/store/features/auth/authSlice";
import "./style.css";

// import { broadcastfill } from "helpers";
import api from "lib/api";

const TradePage = () => {
  const [marketDataTab, updateMarketDataTab] = useState('fills')
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
      api.subscribeToMarket(currentMarket)
    }
    if (api.ws.readyState === 0) {
      api.on('open', sub)
    } else {
      sub()
    }

    return () => {
      api.unsubscribeToMarket(currentMarket)
      api.off('open', sub)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, currentMarket])

  const updateMarketChain = (market) => {
    dispatch(setCurrentMarket(market));
  }

  Object.keys(lastPrices).forEach((market) => {
    markets.push(market);
    const price = lastPrices[market].price;
    const change = lastPrices[market].change;
    const pctchange = ((change / price) * 100).toFixed(2);
    lastPriceTableData.push({ td1: market, td2: price, td3: pctchange });
  });

  const openOrdersData = [];
  const orderbookBids = [];
  const orderbookAsks = [];

  for (let orderid in allOrders) {
    const order = allOrders[orderid];
    const market = order[2];
    const side = order[3];
    const price = order[4];
    const remaining = isNaN(Number(order[11])) ? order[5] : order[11];
    const remainingQuote = remaining * price;
    const orderStatus = order[9];

    let spotPrice;
    try {
      spotPrice = lastPrices[market].price;
    } catch (e) {
      spotPrice = null;
    }
    const orderWithoutFee = api.getOrderDetailsWithoutFee(order);
    let orderRow;
    if (api.isZksyncChain(network))
      orderRow = {
        td1: orderWithoutFee.price,
        td2: orderWithoutFee.baseQuantity,
        td3: orderWithoutFee.quoteQuantity,
        side,
        order: order,
      };
    else {
      orderRow = {
        td1: price,
        td2: remaining,
        td3: remainingQuote,
        side,
        order: order,
      };
    }

    // Only display Market Making orders within 2% of spot
    // No one is going to fill outside that range
    if (spotPrice && price > spotPrice * 0.98 && price < spotPrice * 1.02) {
      openOrdersData.push(orderRow);
    }
    if (side === "b" && ["o", "pm", "pf"].includes(orderStatus)) {
      orderbookBids.push(orderRow);
    } else if (side === "s" && ["o", "pm", "pf"].includes(orderStatus)) {
      orderbookAsks.push(orderRow);
    }
  }

    // Only display recent trades
    // There's a bunch of user trades in this list that are too old to display
    const fillData = [];
    const maxFillId = Math.max(...Object.values(marketFills).map(f => f[1]));
    Object.values(marketFills)
        .filter(fill => fill[1] > maxFillId - 500)
        .sort((a,b) => b[1] - a[1])
        .forEach((fill) => {
            if (api.isZksyncChain(network)) {
                const fillWithoutFee = api.getFillDetailsWithoutFee(fill);
                fillData.push({
                    td1: fillWithoutFee.price,
                    td2: fillWithoutFee.baseQuantity,
                    td3: fillWithoutFee.quoteQuantity,
                    side: fill[3],
                });
            } else {
                fillData.push({
                    td1: fill[4],
                    td2: fill[5],
                    td3: fill[4] * fill[5],
                    side: fill[3],
                });
            }
        });

  if (api.isZksyncChain(network)) {
    liquidity.forEach((liq) => {
      const quantity = liq[0];
      const spread = liq[1];
      const side = liq[2];
      if (side === "d" || side === "b") {
        const bidPrice = marketSummary.price * (1 - spread);
        orderbookBids.push({
          td1: bidPrice,
          td2: quantity,
          td3: bidPrice * quantity,
          side: "b",
        });
      }
      if (side === "d" || side === "s") {
        const askPrice = marketSummary.price * (1 + spread);
        orderbookAsks.push({
          td1: askPrice,
          td2: quantity,
          td3: askPrice * quantity,
          side: "s",
        });
      }
    });
  }
  
  orderbookAsks.sort((a, b) => b.td1 - a.td1);
  orderbookBids.sort((a, b) => b.td1 - a.td1);
  
  const askBins = [];
  for (let i in orderbookAsks) {
    const lastAskIndex = askBins.length - 1;
    if (i === "0") {
      askBins.push(orderbookAsks[i]);
    } else if (orderbookAsks[i].td1 === askBins[lastAskIndex].td1) {
      askBins[lastAskIndex].td2 += orderbookAsks[i].td2;
      askBins[lastAskIndex].td3 += orderbookAsks[i].td3;
    } else {
      askBins.push(orderbookAsks[i]);
    }
  }

  const bidBins = [];
  for (let i in orderbookBids) {
    const lastBidIndex = bidBins.length - 1;
    if (i === "0") {
      bidBins.push(orderbookBids[i]);
    } else if (orderbookBids[i].td1 === bidBins[lastBidIndex].td1) {
      bidBins[lastBidIndex].td2 += orderbookBids[i].td2;
      bidBins[lastBidIndex].td3 += orderbookBids[i].td3;
    } else {
      bidBins.push(orderbookBids[i]);
    }
  }

  let openOrdersLatestTradesData;
  if (marketDataTab === "orders") {
    openOrdersLatestTradesData = openOrdersData;
  } else if (marketDataTab === "fills") {
    openOrdersLatestTradesData = fillData;
  }

  const activeOrderStatuses = ["o", "m", "b"];
  const activeUserOrders = Object.values(userOrders).filter(
    (order) => activeOrderStatuses.includes(order[9])
  ).length;

  return (
    <DefaultTemplate>
      <div className="trade_section">
        <div className="trade_container">
          <div className="col-12 col-xl-6 d-flex flex-column">
            <div className="trade_left">
              <div>
                {/* Trade Head */}
                <TradeHead
                  updateMarketChain={updateMarketChain}
                  marketSummary={marketSummary}
                  markets={markets}
                  currentMarket={currentMarket}
                />
                {/* Trade Chart */}
                <TradeChart currentMarket={currentMarket} />
              </div>
            </div>
            <SpotBox
              lastPrice={marketSummary.price}
              signInHandler={() => api.signIn()}
              user={user}
              chainId={network}
              currentMarket={currentMarket}
              activeOrderCount={activeUserOrders}
            />
          </div>
          <div className="col-12 col-xl-6">
            <div className="trade_right">
              <div className="col-12 col-sm-12 col-md-12 col-lg-6">
                <div className="trade_Price">
                  {/* Trade Price Head */}
                  {/* Trade Price Table*/}
                  <TradePriceTable
                    className="trade_table_pad_top"
                    useGradient="true"
                    priceTableData={askBins}
                    currentMarket={currentMarket}
                    scrollToBottom="true"
                  />
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-12 col-lg-6">
                <div className="trade_price_btc">
                  {/* <TradePriceBtcHead /> */}
                  <TradePriceBtcTable
                    rowData={lastPriceTableData}
                    updateMarketChain={updateMarketChain}
                    currentMarket={currentMarket}
                  />
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-12 col-lg-6">
                <div className="trade_Price">
                  {/* Trade Price Second Head */}
                  <TradePriceHeadSecond
                    lastPrice={marketSummary.price}
                  />
                  {/* Trade Price Table*/}
                  <TradePriceTable
                    className=""
                    useGradient="true"
                    currentMarket={currentMarket}
                    priceTableData={bidBins}
                  />
                  {/* <TradeMarketActivites /> */}
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-12 col-lg-6">
                <div className="trade_Price trade_price2">
                  {/* Trade Price Third Head */}
                  <div className="trade_price_head_third">
                    <strong
                      className={
                        marketDataTab === "orders"
                          ? "trade_price_active_tab"
                          : ""
                      }
                      onClick={() => updateMarketDataTab("orders")}
                    >
                      Open Orders
                    </strong>
                    <strong
                      className={
                        marketDataTab === "fills"
                          ? "trade_price_active_tab"
                          : ""
                      }
                      onClick={() => updateMarketDataTab("fills")}
                    >
                      Latest Trades
                    </strong>
                  </div>
                  {/* Trade Price Table*/}
                  <TradePriceTable
                    className=""
                    value="up_value"
                    priceTableData={openOrdersLatestTradesData}
                    currentMarket={currentMarket}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer
          userFills={userFills}
          userOrders={userOrders}
          user={user}
          chainId={network}
        />
      </div>
    </DefaultTemplate>
  );
};
export default TradePage;
