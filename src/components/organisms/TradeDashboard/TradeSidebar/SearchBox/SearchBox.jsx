import React, { useState } from "react";
import "./SearchBox.css";

export default function SearchBox(props){
    const [searchValue, setSearch] = useState('');


    function handleChange (e) {
        //do search
        setSearch(e.target.value);
        props.searchPair(e.target.value);
    }

    return (
        <>

            <div className="pairs_searchbox">
                <input placeholder="Search Pairs..."  type="text"
                    value={searchValue} 
                    onChange={handleChange} 
                />
            </div>
        </>
    );
}
