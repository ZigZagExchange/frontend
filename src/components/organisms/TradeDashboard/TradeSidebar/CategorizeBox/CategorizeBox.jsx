import React, { useState } from "react";
import "./CategorizeBox.css";

export default function CategorizeBox(props) {
  const categories = props.categories;
  const [selected, setCategory] = useState(props.initialValue || "");

  function changeCategory(category_name) {
    //console.log("category selected: ", category_name)
    props.categorizePairs(category_name);
    setCategory(category_name);
  }

  return (
    <>
      <div className="categorize_tabs">
        {categories.map((category_name, index) => {
          return (
            <div
              key={index}
              className="categorize_tab"
              onClick={() => changeCategory(category_name)}
            >
              <span
                className={
                  selected === category_name ? "categorize_selected_tab" : ""
                }
              >
                {category_name}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
