import React from "react";

import "./TradePriceBtcTable.css";

import CategorizeBox from "../CategorizeBox/CategorizeBox";
import SearchBox from "../SearchBox/SearchBox";

import {fetchFavourites} from '../../../../../lib/helpers/storage/favourites'
import {getStables} from '../../../../../lib/helpers/categories/index.js'
class TradePriceBtcTable extends React.Component {

    constructor(props){
        super(props);
        this.props = props;

        this.state = {
            foundPairs: [],
            pairs: props.rowData,
        }

        this.searchPair = this.searchPair.bind(this);
        this.categorizePairs = this.categorizePairs.bind(this);
        this.renderPairs = this.renderPairs.bind(this);
    }

    searchPair(value){
        var foundPairs = [];

        this.props.rowData.forEach(row => {
            var pair_name = row.td1;

            //if found query, push it to found pairs
            if(pair_name.includes(value.toUpperCase())){
                //console.log(row);
                foundPairs.push(row);
            }
        });

        //update found pairs
        this.setState({
            foundPairs: foundPairs
        });

    }

    categorizePairs(category_name){

        this.props.rowData.forEach(row => {
            var pair_category = row.td1;
            console.log("category:",  pair_category)


            //search for eth
            if(category_name == "ETH"){
                this.searchPair("ETH");
            }
            if(category_name == "WBTC"){
                this.searchPair("BTC");
            }
            if(category_name == "STABLE"){
                console.log("unsupported")
                var foundPairs = getStables(this.props.rowData);
                console.log(foundPairs);
                this.setState({
                    foundPairs: foundPairs
                });
            }
            if(category_name == "FAVOURITES"){
                console.log("unsupported")

            }
            /*
            //if found query, push it to found pairs
            if(pair_name.includes(value.toUpperCase())){
                //console.log(row);
                foundPairs.push(row);
            }*/
        });

 


    }

    //render given pairs
    renderPairs(pairs){
        //console.log(pairs);
        //console.log("favourites:", fetchFavourites());

        const shown_pairs = pairs.map((d, i) => {
            return (
                <tr
                    key={i}
                    onClick={(e) =>
                        this.props.updateMarketChain(d.td1)
                    }
                    className={
                        this.props.currentMarket === d.td1
                            ? "selected"
                            : ""
                    }
                >
                    <td>
                        {d.td1.replace("-", "/")}
                        <span>{d.span}</span>
                    </td>
                    <td
                        className={
                            d.td3 < 0
                                ? "down_value"
                                : "up_value"
                        }
                    >
                        {d.td2}
                    </td>
                    <td
                        className={
                            d.td3 < 0
                                ? "down_value"
                                : "up_value"
                        }
                    >
                        {d.td3}%
                    </td>
                </tr>
            );
        });
            
        return (
                <table>
                    <thead>
                        <tr>
                            <th>
                                Pair
                            </th>
                            <th>
                                Price
                            </th>
                            <th>
                                Change
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {shown_pairs}
                    </tbody>
                </table>
        );
    }

    render() {
        
        return (
            <>
                <CategorizeBox 
                    categories={["ETH", "WBTC", "STABLE", "FAVOURITES"]}
                    categorizePairs={this.categorizePairs}
                    />

                <SearchBox 
                    searchPair={this.searchPair}
                />
                <div className="trade_price_btc_table">

                    { this.state.foundPairs.length !== 0 ? ( 
                            this.renderPairs(this.state.foundPairs)
                    ) : ( 
                            this.renderPairs(this.props.rowData)
                    )}

                </div>
            </>
        );
    }
}

export default TradePriceBtcTable;
