import React from "react";
// css
import "./Button.css";
const Button = (props) => {
  return (
    <>
      <button type="button" className={props.className} onClick={props.onClick}>
        <>
          <img src={props.img} alt="..." />
          {props.text}
        </>
      </button>
    </>
  );
};

export default Button;
