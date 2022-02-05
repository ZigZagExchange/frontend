import React, { useState } from "react";
import "./SearchBox.css";

export default function SearchBox(props){
    const [searchValue, setSearch] = useState('');


    function handleChange (e) {
      console.log('handle change called', e.target.value)

      setSearch(e.target.value);
      //do search
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
