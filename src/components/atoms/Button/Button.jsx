import React from "react";
import cx from "classnames";
import "./Button.css";

export const Button = (props) => {
  return (
    <>
      <button type="button" className={cx('zig_btn', props.className)} onClick={props.onClick}>
        <>
          <img src={props.img} alt="..." />
          {props.text}
        </>
      </button>
    </>
  );
};
