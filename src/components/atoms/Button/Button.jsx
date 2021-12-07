import React from "react";
import cx from "classnames";
import "./Button.css";

export const Button = (props) => {
  return (
    <button
      type="button"
      className={cx("zig_btn", props.className)}
      onClick={props.onClick}
    >
      {props.img && <img src={props.img} alt="..." />}
      {props.icon && <span className="zig_btn_icon">{props.icon}</span>}
      {props.text || props.children}
    </button>
  );
};
