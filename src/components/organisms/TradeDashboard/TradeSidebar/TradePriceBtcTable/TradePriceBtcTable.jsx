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
        category_name = category_name.toUpperCase();

        this.props.rowData.forEach(row => {

            switch (category_name){
                case "STABLES":
                    //look for pairs against stables.
                    var foundPairs = getStables(this.props.rowData);
                    console.log(foundPairs);
                    this.setState({
                        foundPairs: foundPairs
                    });
                    break;
                case "FAVOURITES":
                    console.log("unsupported")
                    //set favourites from localstorage
                    var favourites = fetchFavourites();
                    console.log("favs:" , favourites)
                    this.setState({
                        foundPairs: favourites
                    });

                    break;
                default:
                    //search for custom category
                    this.searchPair(category_name);
            }
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
