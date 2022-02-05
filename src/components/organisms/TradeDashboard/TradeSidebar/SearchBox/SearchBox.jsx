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

            <div className="tl_head m-2">
                <input placeholder="Search..."  type="text"
                    value={searchValue} 
                    onChange={handleChange} 
                />
            </div>
        </>
    );
}
