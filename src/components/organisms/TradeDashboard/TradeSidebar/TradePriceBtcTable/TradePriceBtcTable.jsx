import React from "react";
import SearchBox from "../SearchBox/SearchBox";

import "./TradePriceBtcTable.css";

class TradePriceBtcTable extends React.Component {

    constructor(props){
        super(props);
        this.props = props;

        this.state = {
            foundPairs: [],
            pairs: props.rowData,
        }

        this.searchPair = this.searchPair.bind(this);
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

    //render given pairs
    renderPairs(pairs){

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
                <SearchBox 
                    searchPair={this.searchPair}
                />
                <div className="trade_price_btc_table">

                    { this.state.foundPairs.length != 0 ? ( 
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
