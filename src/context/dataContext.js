import React, {createContext, useContext, useState} from 'react';

const DataContext = createContext({});

const DataContextProvider = ({children}) => {
    const [dataState, setDataState] = useState({
        currency_name: "ETH/USDT",
        currency_name_1: "ETH",
        currency_name_2: "USDT",
        currency_fullName: "Ethereum",
    });
    const updateDataState = (newData) => {
        setDataState(newData);
    }
    return (
        <DataContext.Provider value={{dataState,updateDataState}}>
            {children}
        </DataContext.Provider>
    );
};

export const useDataContext = () => useContext(DataContext);

export default DataContextProvider;