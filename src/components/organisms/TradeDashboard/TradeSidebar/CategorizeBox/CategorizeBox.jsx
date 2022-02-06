import React, { useState} from "react";
import "./CategorizeBox.css";


export default function CategorizeBox(props) {
    const categories = props.categories;

    var [selected, setCategory] = useState('');

    function changeCategory(category_name){
        //console.log("category selected: ", category_name)
        props.categorizePairs(category_name);
        setCategory(category_name);
    }

    return (
        <>
            <div className="tl_head m-2">
                { categories.map((category_name, index) => {
                    return (
                        <div key={index} className="rates_box" 
                        onClick={() => changeCategory(category_name)}>
                            <div>
                                <span className={selected === category_name ? "selected_tab": ""}>
                                    {category_name}
                                </span>
                                                            
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
