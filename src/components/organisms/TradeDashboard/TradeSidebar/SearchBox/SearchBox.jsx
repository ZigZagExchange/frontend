import React from "react";
import "./SearchBox.css";

export default function SearchBox(props) {

  function handleChange(e) {
    props.searchPair(e.target.value);
  }

  return (
    <>
      <div className={props.className}>
        <input
          placeholder="Search..."
          type="text"
          value={props.searchValue}
          onChange={handleChange}
        />
      </div>
    </>
  );
}
