import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import styled from 'styled-components';
import "./Modal.css";

const ModalWrapper = styled.div`
  &.currency-modal {
    background: ${({ theme }) => theme.colors.backgroundHighEmphasis};
    border: 1px solid ${({ theme }) => theme.colors.foreground400};
    box-shadow: 0px 8px 16px 0px #0101011A;
    border-radius: 8px;

    .zig_modal_title {
      color: ${({ theme }) => theme.colors.foregroundHighEmphasis};
    }

    .zig_modal_body {
      background: ${({ theme }) => theme.colors.backgroundHighEmphasis};
    }
  }
`

export const Modal = (props) => {
  const closeOnEscapeKeyDown = (e) => {
    if ((e.charCode || e.keyCode) === 27) {
      props.onClose();
    }
  };

  useEffect(() => {
    document.body.addEventListener("keydown", closeOnEscapeKeyDown);
    return function cleanup() {
      document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
    };
  }, []);

  return ReactDOM.createPortal(
    <CSSTransition
      in={props.show}
      unmountOnExit
      timeout={{ enter: 0, exit: 300 }}
    >
      <div className="zig_modal" onClick={props.onClose}>
        <ModalWrapper className={`zig_modal_content  ${props.adClass}`} onClick={(e) => e.stopPropagation()}>
          <div className="zig_modal_header">
            <h4 className="zig_modal_title">{props.title}</h4>
          </div>
          <div className="zig_modal_body zig_scrollstyle">{props.children}</div>
        </ModalWrapper>
      </div>
    </CSSTransition>,
    document.getElementById("root")
  );
};
