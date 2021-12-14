import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import "./Modal.css";

export const Modal = (props) => {
  const closeOnEscapeKeyDown = e => {
    if ((e.charCode || e.keyCode) === 27) {
      props.onClose()
    }
  }

  useEffect(() => {
    document.body.addEventListener("keydown", closeOnEscapeKeyDown);
    return function cleanup() {
      document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
    }
  }, [])

  return ReactDOM.createPortal(
    <CSSTransition
      in={props.show}
      unmountOnExit
      timeout={{ enter: 0, exit: 300 }}
    >
      <div className="zig_modal" onClick={props.onClose}>
        <div className="zig_modal_content" onClick={e => e.stopPropagation()}>
          <div className="zig_modal_header">
            <h4 className="zig_modal_title">{props.title}</h4>
          </div>
          <div className="zig_modal_body">{props.children}</div>
        </div>
      </div>
    </CSSTransition>,
    document.getElementById("root")
  )
}
