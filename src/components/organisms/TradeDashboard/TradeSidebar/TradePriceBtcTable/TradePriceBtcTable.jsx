import React from "react";
import "./TradePriceBtcTable.css";
import CategorizeBox from "../CategorizeBox/CategorizeBox";
import SearchBox from "../SearchBox/SearchBox";
import { getStables } from "../../../../../lib/helpers/categories/index.js";
import {
  addFavourite,
  removeFavourite,
  fetchFavourites,
} from "../../../../../lib/helpers/storage/favourites";
import { BsStar, BsStarFill } from "react-icons/bs";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";

class TradePriceBtcTable extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      foundPairs: [],
      pairs: [],

      categorySelected: "ALL",
      favourites: [],

      changeSorted: false,
      changeDirection: false,

      priceSorted: false,
      priceDirection: false,
    };

    this.searchPair = this.searchPair.bind(this);
    this.categorizePairs = this.categorizePairs.bind(this);

    this.favouritePair = this.favouritePair.bind(this);

    this.toggleChangeSorting = this.toggleChangeSorting.bind(this);
    this.togglePriceSorting = this.togglePriceSorting.bind(this);
    this.resetSorting = this.resetSorting.bind(this);

    this.renderPairs = this.renderPairs.bind(this);
  }

  searchPair(value) {
    value = value.toUpperCase()
      .replace("/", "-")
      .replace(" ", "-");
    var foundPairs = [];

    var [base, quote] = value.split("-");
    var reverseValue = quote + "-" + base;
    //
    //search all, if you'd prefer to search the current category just set this to use `state.pairs` instead
    //
    this.props.rowData.forEach((row) => {
      var pair_name = row.td1.toUpperCase();

      //if found query, push it to found pairs
      if (
        pair_name.includes(value) ||
        pair_name.includes(reverseValue)
      ) {
        foundPairs.push(row.td1);
      }
    });

    //update found pairs
    this.setState({
      pairs: foundPairs,

      //reset sorting
      priceSorted: false,
      priceDirection: false,
      changeSorted: false,
      changeDirection: false,
    });
  }

  componentDidUpdate() {
    if (this.state.categorySelected !== 'FAVOURITES' && this.state.pairs.length === 0 && this.props.rowData.length !== 0) {
      this.setState({ pairs: this.props.rowData.map(r => r.td1) });
    }
  }



  categorizePairs(category_name) {
    category_name = category_name.toUpperCase();
    var foundPairs = [];

    this.setState({
      categorySelected: category_name,

      //reset sorting
      priceSorted: false,
      priceDirection: false,
      changeSorted: false,
      changeDirection: false,
    });

    switch (category_name) {
      case "ALL":
        this.setState({ pairs: this.props.rowData.map(row => row.td1) });
        break;
      case "STABLES":
        //look for pairs against stables.
        foundPairs = getStables(this.props.rowData);
        this.setState({
          pairs: foundPairs,
        });
        break;
      case "FAVOURITES":
        //set favourites from localstorage
        let favourites = fetchFavourites();
        foundPairs = [];

        favourites.forEach((value) => {
          this.props.rowData.forEach((row) => {
            let pair_name = row.td1;

            //if found query, push it to found pairs
            if (pair_name.includes(value.toUpperCase())) {
              foundPairs.push(pair_name);
            }
          });
        });

        this.setState({
          pairs: foundPairs,
        });

        break;
      default:
        //search for custom category
        this.searchPair(category_name);

        return this.state.pairs;
    }
  }

  favouritePair(pair) {
    var isFavourited = fetchFavourites().includes(pair.td1);

    var favourites = [];
    if (!isFavourited) {
      favourites = addFavourite(pair.td1);
    } else {
      favourites = removeFavourite(pair.td1);
    }

    this.setState({
      favourites: favourites,
    });
  }

  toggleChangeSorting() {
    var toggled = !this.state.changeDirection;
    var sorted_pairs = [...this.state.pairs];

    sorted_pairs.sort(function compareFn(firstEl, secondEl) {
      if (toggled) {
        return parseInt(firstEl.td3) - parseInt(secondEl.td3);
      } else {
        return parseInt(secondEl.td3) - parseInt(firstEl.td3);
      }
    });

    this.setState({
      pairs: sorted_pairs,

      priceSorted: false,
      priceDirection: false,
      changeSorted: true,
      changeDirection: !this.state.changeDirection,
    });
  }

  togglePriceSorting() {
    var toggled = !this.state.priceDirection;

    var sorted_pairs = this.state.pairs;

    sorted_pairs.sort(function compareFn(firstEl, secondEl) {
      if (toggled) {
        return parseInt(firstEl.td2) - parseInt(secondEl.td2);
      } else {
        return parseInt(secondEl.td2) - parseInt(firstEl.td2);
      }
    });
    this.setState({
      pairs: sorted_pairs,
      priceSorted: true,
      priceDirection: toggled,
      changeSorted: false,
      changeDirection: false,
    });
  }

  resetSorting() {
    var category = this.state.categorySelected;
    this.categorizePairs(category);

    this.setState({
      priceSorted: false,
      priceDirection: false,
      changeSorted: false,
      changeDirection: false,
    });
  }

  //render given pairs
  renderPairs(pairs) {
    var changeSorted = this.state.changeSorted;
    var priceSorted = this.state.priceSorted;

    var changeDirection = this.state.changeDirection;
    var priceDirection = this.state.priceDirection;

    const shown_pairs = pairs
    .map(pair => ([pair, this.props.rowData.find(row => row.td1 === pair)]))
    .sort(([_, d], [__, d2]) => {
      if (changeSorted) {
        return changeDirection ? d.td3 - d2.td3 : d2.td3 - d.td3
      } else if (priceSorted) {
        return priceDirection ? d.td2 - d2.td2 : d2.td2 - d.td2
      } else {
        return 0
      }
    })
    .map(([pair, d], i) => {
      if (!d) return '';
      var selected = this.props.currentMarket === pair; //if current market selected
      var isFavourited = this.state.favourites.includes(pair); //if contains, isFavourited

      return (
        <tr
          key={i}
          onClick={(e) => {
            if (selected) return;
            this.props.updateMarketChain(pair);
          }}
          className={selected ? "selected" : ""}
        >
          <td>
            <span
              className="favourite-icon"
              onClick={(e) => {
                this.favouritePair(d);
              }}
            >
              {isFavourited ? <BsStarFill /> : <BsStar />}
            </span>

            {pair.replace("-", "/")}
            <span>{d.span}</span>
          </td>
          <td className={d.td3 < 0 ? "down_value" : "up_value"}>{d.td2}</td>
          <td className={d.td3 < 0 ? "down_value" : "up_value"}>{d.td3}%</td>
        </tr>
      );
    });

    return (
      <table>
        <thead>
          <tr>
            <th onClick={() => this.resetSorting()}>Pair</th>
            <th onClick={() => this.togglePriceSorting()}>
              {priceSorted ? (
                priceDirection ? (
                  <FaSortDown />
                ) : (
                  <FaSortUp />
                )
              ) : (
                <FaSort />
              )}
              Price
            </th>
            <th style={{ minWidth: 108 }} onClick={() => this.toggleChangeSorting()}>
              {changeSorted ? (
                changeDirection ? (
                  <FaSortDown />
                ) : (
                  <FaSortUp />
                )
              ) : (
                <FaSort />
              )}
              Change
            </th>
          </tr>
        </thead>
        <tbody>{shown_pairs}</tbody>
      </table>
    );
  }

  componentDidMount() {
    var favourites = fetchFavourites();
    this.setState({ favourites: favourites });
  }

  render() {
    return (
      <>
        <SearchBox searchPair={this.searchPair} className="pairs_searchbox" />
        <CategorizeBox
          categories={["ALL", "ETH", "WBTC", "STABLES", "FAVOURITES"]}
          categorizePairs={this.categorizePairs}
          initialValue="ALL"
        />

        <div className="trade_price_btc_table zig_scrollstyle">
          {this.renderPairs(this.state.pairs)}
        </div>
      </>
    );
  }
}

export default TradePriceBtcTable;
