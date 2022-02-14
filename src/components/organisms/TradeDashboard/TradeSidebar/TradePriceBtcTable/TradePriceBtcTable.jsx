import React from "react";
import "./TradePriceBtcTable.css";
import CategorizeBox from "../CategorizeBox/CategorizeBox";
import SearchBox from "../SearchBox/SearchBox";
import {getStables} from '../../../../../lib/helpers/categories/index.js'
import {addFavourite, removeFavourite, fetchFavourites} from '../../../../../lib/helpers/storage/favourites'
import { BsStar, BsStarFill } from "react-icons/bs";

import arrowsImg from "../../../../../assets/icons/up-down-arrow.png"

class TradePriceBtcTable extends React.Component {

    constructor(props){
        super(props);
        this.props = props;

        this.state = {
            foundPairs: [],
            pairs: [],
            favourites: [],

            changeSorted: false,
            priceSorted: false
        }

        this.searchPair = this.searchPair.bind(this);
        this.categorizePairs = this.categorizePairs.bind(this);

        this.favouritePair = this.favouritePair.bind(this);

        this.toggleChangeSorting = this.toggleChangeSorting.bind(this);
        this.togglePriceSorting = this.togglePriceSorting.bind(this);

        this.renderPairs = this.renderPairs.bind(this);
    }


    componentDidUpdate(){
        if(this.state.pairs.length === 0 && this.props.rowData.length !== 0){
            this.setState({pairs: this.props.rowData});
        }
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
        var foundPairs = [];

        switch (category_name){
            case "ALL":
                this.setState({foundPairs: [], pairs: this.props.rowData});
                break;
            case "STABLES":
                //look for pairs against stables.
                foundPairs = getStables(this.props.rowData);
                this.setState({
                    foundPairs: foundPairs
                });
                break;
            case "FAVOURITES":
                //set favourites from localstorage
                var favourites = fetchFavourites();
                foundPairs = [];

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


 


    }

    favouritePair(pair){
        var isFavourited = fetchFavourites().includes(pair.td1);

        var favourites = [];
        if(!isFavourited){
            favourites = addFavourite(pair.td1);
        } else {
            favourites = removeFavourite(pair.td1);
        }

        this.setState({
            favourites: favourites
        })
    }


    toggleChangeSorting(){
        
        var toggled = !this.state.changeSorted;
        var rowData = this.props.rowData;
        
        rowData.sort(function compareFn(firstEl, secondEl){
            if(toggled){
                return parseInt(firstEl.td2) - parseInt(secondEl.td2);
            } else {
                return parseInt(firstEl.td2) + parseInt(secondEl.td2);
            }
            
        });
        this.setState({pairs: rowData, changeSorted: toggled, priceSorted: false});
    }

    togglePriceSorting(){
        
        var toggled = !this.state.priceSorted;
        var rowData = this.props.rowData;

        rowData.sort(function compareFn(firstEl, secondEl){
            if(toggled){
                return parseInt(firstEl.td3) - parseInt(secondEl.td3);
            } else {
                return parseInt(firstEl.td3) + parseInt(secondEl.td3);
            }
            
        });
        this.setState({pairs: rowData, priceSorted: toggled, changeSorted: false});
    }



    //render given pairs
    renderPairs(pairs){

        const shown_pairs = pairs.map((d, i) => {
            var selected = this.props.currentMarket === d.td1; //if current market selected
            var isFavourited = this.state.favourites.includes(d.td1); //if contains, isFavourited

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
                            <th onClick={() => this.togglePriceSorting()}>

                                <img src={arrowsImg}
                                   alt="toggle-price"
                                />
                                Price

                            </th>
                            <th onClick={() => this.toggleChangeSorting()}>
                                <img src={arrowsImg} 
                                    alt="toggle-change"
                                />

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

    componentDidMount(){
        var favourites = fetchFavourites();
        this.setState({favourites: favourites});
    }

    render() {
        
        return (
            <>
                <SearchBox 
                    searchPair={this.searchPair}
                    className="pairs_searchbox"
                />
                <CategorizeBox 
                    categories={["ALL", "ETH", "WBTC", "STABLES", "FAVOURITES"]}
                    categorizePairs={this.categorizePairs}
                />
                <div className="trade_price_btc_table">

                    { this.state.foundPairs.length !== 0 ? ( 
                            this.renderPairs(this.state.foundPairs)
                    ) : ( 
                            this.renderPairs(this.state.pairs)
                    )}

                </div>
            </>
        );
    }
}

export default TradePriceBtcTable;
