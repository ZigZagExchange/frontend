import React from "react";
// css
import "./TradeSelect.css";
import { useDataContext } from "../../../context/dataContext"
import {subscribeMarket} from "../../../helpers"


const TradeSelect = () => {
  const { dataState, updateDataState } = useDataContext();
  // currencies
  let currencies = [

    {
      fullName: "ETH/USDT",
      first_name: "ETH",
      second_name: "USDT",
      currency_fullName: "Ethereum",
    },
    {
      fullName: "BTC/USDT",
      first_name: "BTC",
      second_name: "USDT",
      currency_fullName: "Bitcoin",
    },
    {
      fullName: "ETH/BTC",
      first_name: "ETH",
      second_name: "BTC",
      currency_fullName: "Ethereum",
    },

  ];
  // Change currency 
  const handleCurrencyChange = (e) => {
    let selectedCR = currencies[e.target.value];
    updateDataState(
      {...dataState, 
        currency_name: selectedCR.fullName,
        currency_name_1: selectedCR.first_name,
        currency_name_2: selectedCR.second_name,
        currency_fullName: selectedCR.currency_fullName,
    }
    );
    let newVal = selectedCR?.fullName.toUpperCase().replace('/',"-") || "BTC-USDT";
    subscribeMarket(newVal).then((data)=> {
      console.log(data)
    }).catch((err)=>{console.log(err)})
  }

  
  return (
    <>
      <div className="tl_select">
        <div>
          <select onChange={handleCurrencyChange}>
            <option value={0}>ETH/USDT</option>
            <option value={1}>BTC/USDT</option>
            <option value={2}>ETH/BTC</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default TradeSelect;
