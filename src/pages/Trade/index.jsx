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

// css
import "./style.css";
import TradePriceBtcTable from "../../components/TradeComponents/TradePriceBtcTable/TradePriceBtcTable";

// import TradePriceBtcHead from "../../components/TradeComponents/TradePriceBtcHead/TradePriceBtcHead";
import TradePriceHeadSecond from "../../components/TradeComponents/TradePriceHeadSecond/TradePriceHeadSecond";
import TradeMarketActivites from "../../components/TradeComponents/TradeMarketActivites/TradeMarketActivites";
import SpotBox from "../../components/TradeComponents/SpotBox/SpotBox";
import TradePriceHeadThird from "../../components/TradeComponents/TradePriceHeadThird/TradePriceHeadThird";
import { zigzagws } from "../../helpers";

class Trade extends React.Component {

    constructor(props) {
        super(props)
        this.state = { marketSummary: {}, lastPrices: {}, openorders: [], currentMarket: "ETH-USDT" }
    }

    componentDidMount() {
        zigzagws.addEventListener('message', async (e) => {
            const msg = JSON.parse(e.data);
            switch (msg.op) {
                case 'openorders':
                    this.setState({
                        ...this.state,
                        openorders: msg.args[0]
                    })
                    break
                case 'marketsummary':
                    this.setState({ 
                        ...this.state,
                        marketSummary: {
                            market: msg.args[0],
                            price: msg.args[1],
                            '24hi': msg.args[2],
                            '24lo': msg.args[3],
                            priceChange: msg.args[4],
                            baseVolume: msg.args[5],
                            quoteVolume: msg.args[6],
                        }
                    })
                    break
                case 'lastprice':
                    const priceUpdates = msg.args[0];
                    const newstate = { ...this.state }
                    priceUpdates.forEach(update => {
                        newstate.lastPrices[update[0]] = { price: update[1], change: update[2] };
                        if (update.market === this.state.currentMarket) {
                            newstate.marketSummary.price = update[1]
                            newstate.marketSummary.priceChange = update[2]
                        }
                    });
                    this.setState(newstate);
                    break
                default:
                    break
            }
        })
        zigzagws.addEventListener('open', function () {
            zigzagws.send(JSON.stringify({op:"subscribemarket", args: ["ETH-USDT"]}))
        })
    }

    render() {
      const lastPriceTableData = [];
      Object.keys(this.state.lastPrices).forEach(market => {
          const price = this.state.lastPrices[market].price;
          const change = this.state.lastPrices[market].change;
          const pctchange = (change / price * 100).toFixed(2);
          lastPriceTableData.push({ td1: market, td2: price, td3: pctchange });
      })
      const openOrdersData = [];
      Object.keys(this.state.openorders).forEach(order => {
          openOrdersData.push({ td1: order[3], td2: order[4], td3: order[3]*order[4], side: order[2] });
      })

      return (
        <>
          <Header />
          <div className="trade_section">
            <div className="trade_container">
              <div className="col-12 col-xl-6 d-flex flex-column">
                <div className="trade_left">
                  <div>
                    {/* Trade Head */}
                    <TradeHead marketSummary={this.state.marketSummary} />
                    {/* Trade Chart */}
                    <TradeChart />
                  </div>
                </div>
                <SpotBox initPrice={this.state.marketSummary.price}/>
              </div>
              <div className="col-12 col-xl-6">
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
                      <TradePriceBtcTable rowData={lastPriceTableData} />
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
                        priceTableData={openOrdersData}
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
    }
};


export default Trade;
