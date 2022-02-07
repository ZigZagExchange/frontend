import React from "react";

import "./TradePriceBtcTable.css";

import CategorizeBox from "../CategorizeBox/CategorizeBox";
import SearchBox from "../SearchBox/SearchBox";


import {getStables} from '../../../../../lib/helpers/categories/index.js'
import {addFavourite, removeFavourite, fetchFavourites} from '../../../../../lib/helpers/storage/favourites'

import { BsStar, BsStarFill } from "react-icons/bs";


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

        this.favouritePair = this.favouritePair.bind(this);

        this.renderPairs = this.renderPairs.bind(this);
    }

    searchPair(value){
        var foundPairs = [];

        this.props.rowData.forEach(row => {
            var pair_name = row.td1;

            //if found query, push it to found pairs
            if(pair_name.includes(value.toUpperCase())){
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
                case "ALL":
                    this.setState({foundPairs: []});
                    break;
                case "STABLES":
                    //look for pairs against stables.
                    var foundPairs = getStables(this.props.rowData);
                    this.setState({
                        foundPairs: foundPairs
                    });
                    break;
                case "FAVOURITES":
                    //set favourites from localstorage
                    var favourites = fetchFavourites();
                    var foundPairs = [];

                    favourites.forEach(value => {
                        this.props.rowData.forEach(row => {
                            var pair_name = row.td1;
                
                            //if found query, push it to found pairs
                            if(pair_name.includes(value.toUpperCase())){
                                foundPairs.push(row);
                            }
                        });
                    })
                  
                    this.setState({
                        foundPairs: foundPairs
                    });

                    break;
                default:
                    //search for custom category
                    this.searchPair(category_name);
            }
        });

 


    }

    favouritePair(pair){
        var isFavourited = fetchFavourites().includes(pair.td1);

        if(!isFavourited){
            addFavourite(pair);
        } else {
            removeFavourite(pair);
        }
    }

    //render given pairs
    renderPairs(pairs){

        const shown_pairs = pairs.map((d, i) => {
            var selected = this.props.currentMarket === d.td1; //if current market selected
            var isFavourited = fetchFavourites().includes(d.td1); //if contains, isFavourited

            return (
                <tr
                    key={i}
                    onClick={(e) => {
                        if(selected) return;
                        this.props.updateMarketChain(d.td1);
                    }}
                    className={ selected ? "selected" : "" }
                >
                    <td>
                        
                            <span onClick={(e) => {
                                this.favouritePair(d);
                            } }>
                                { isFavourited
                                    ? <BsStarFill /> 
                                    : <BsStar />
                                }
                            </span>

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
                <SearchBox 
                    searchPair={this.searchPair}
                />
                <CategorizeBox 
                    categories={["ALL", "ETH", "WBTC", "STABLE", "FAVOURITES"]}
                    categorizePairs={this.categorizePairs}
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
