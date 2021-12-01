import React from "react";
// css
import "./HomeFields.css";
// assets
import searchIcon from "../../../assets/icons/search-icon.png";
const HomeFields = () => {
    return (
        <>
            <div className="h_fields">
                <div className="search_input">
                    <img src={searchIcon} alt="..." />
                    <input type="text" placeholder="Search asset symbol" />
                </div>
                <div className="hide_checkbox">
                    <input id="hide" type="checkbox" />
                    <label htmlFor="hide">Hide zero-balance assets</label>
                </div>
            </div>
        </>
    );
};

export default HomeFields;
