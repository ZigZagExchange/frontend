import React from "react";
import "./CategorizeBox.css";


export default function CategorizeBox(props) {
    const categories = props.categories;

    function changeCategory(category_name){
        console.log("category selected: ", category_name)
        props.categorizePairs(category_name);
    }

    return (
        <>
            <div className="tl_head m-2">
                { categories.map((category_name, index) => {
                    return (
                        <div key={index} className="rates_box" 
                        onClick={() => changeCategory(category_name)}>
                            <div>
                                {category_name}
                            
                                { (index + 1 ) !== (categories.length) ? (
                                    <> /</>
                                ) : (<></>)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
