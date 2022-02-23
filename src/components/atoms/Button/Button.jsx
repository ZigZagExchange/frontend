import React from "react";
import cx from "classnames";
import Loader from "react-loader-spinner";
import "./Button.css";

export const Button = (props) => {
  const img = props.img && <img src={props.img} alt="..." />;
  const icon = props.icon && <span className="zig_btn_icon">{props.icon}</span>;
  const text = props.text || props.children;
  const loading = props.loading;

  const buttonContent = (
    <>
      {img}
      {icon} {text}
    </>
  );

  const loadingContent = (
    <span className="btn_loader">
      <Loader type="TailSpin" color="#FFF" height={24} width={24} />
    </span>
  );

  return (
    <button
      type="button"
      style={props.style}
      className={cx("zig_btn", props.className, { zig_btn_loading: loading })}
      onClick={loading ? null : props.onClick}
    >
      <span style={{ opacity: loading ? 0 : 1 }}>{buttonContent}</span>
      {loading && loadingContent}
    </button>
  );
};
