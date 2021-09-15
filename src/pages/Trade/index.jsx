import React from "react";
// Components
import TradeChart from "../../components/Chart/TradeChart/TradeChart";
import TradeHead from "../../components/TradeComponents/TradeHead/TradeHead";
import TradePriceHead from "../../components/TradeComponents/TradePriceHead/TradePriceHead";
import TradePriceTable from "../../components/TradeComponents/TradePriceTable/TradePriceTable";

// Layout
import Header from "../../layout/header/Header";
import Footer from "../../layout/Footer/Footer";

// table data
import { priceTableData } from "../../Data/PriceTableData";
import { priceTableData2 } from "../../Data/priceTableData2";

// css
import "./style.css";
import TradePriceBtcTable from "../../components/TradeComponents/TradePriceBtcTable/TradePriceBtcTable";

// import TradePriceBtcHead from "../../components/TradeComponents/TradePriceBtcHead/TradePriceBtcHead";
import TradePriceHeadSecond from "../../components/TradeComponents/TradePriceHeadSecond/TradePriceHeadSecond";
import TradeMarketActivites from "../../components/TradeComponents/TradeMarketActivites/TradeMarketActivites";
import SpotBox from "../../components/TradeComponents/SpotBox/SpotBox";
import TradePriceHeadThird from "../../components/TradeComponents/TradePriceHeadThird/TradePriceHeadThird";

const Trade = () => {
  return (
    <>
      <Header />
      <div className="trade_section">
        <div className="trade_container">
          <div className="col-12 col-sm-12 col-md-12 col-lg-6 d-flex flex-column">
            <div className="trade_left">
              <div>
                {/* Trade Head */}
                <TradeHead />
                {/* Trade Chart */}
                <TradeChart />
              </div>
            </div>
            <SpotBox />
          </div>
          <div className="col-12 col-sm-12 col-md-12 col-lg-6">
            <div className="trade_right">
              <div className="col-12 col-sm-12 col-md-12 col-lg-6">
                <div className="trade_Price">
                  {/* Trade Price Head */}
                  <TradePriceHead />
                  {/* Trade Price Table*/}
                  <TradePriceTable
                    className="tpt_1"
                    priceTableData={priceTableData}
                  />
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-12 col-lg-6">
                <div className="trade_price_btc">
                  {/* <TradePriceBtcHead /> */}
                  <TradePriceBtcTable />
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-12 col-lg-6">
                <div className="trade_Price">
                  {/* Trade Price Second Head */}
                  <TradePriceHeadSecond />
                  {/* Trade Price Table*/}
                  <TradePriceTable
                    className="tpt_2"
                    priceTableData={priceTableData}
                  />
                  <TradeMarketActivites />
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-12 col-lg-6">
                <div className="trade_Price trade_price2">
                  {/* Trade Price Second Head */}
                  <TradePriceHeadThird />
                  {/* Trade Price Table*/}
                  <TradePriceTable
                    className="tpt_3"
                    value="up_value"
                    priceTableData={priceTableData2}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Trade;
