import React from "react";
// css
import "./Button.css";
const Button = (props) => {
  return (
    <>
      <button className={props.className}>
        <>
          <img src={props.img} alt="..." />
          {props.text}
        </>
      </button>
    </>
  );
};

export default Button;
