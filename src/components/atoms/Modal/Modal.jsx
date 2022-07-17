import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import styled from "styled-components";
import "./Modal.css";
import Text from "components/atoms/Text/Text";
import useTheme from "components/hooks/useTheme";

const ModalWrapper = styled.div`
  &.currency-modal {
    background: ${({ theme }) => theme.colors.backgroundHighEmphasis};
    border: 1px solid ${({ theme }) => theme.colors.foreground400};
    box-shadow: 0px 8px 16px 0px #0101011a;
    border-radius: 8px;

    .zig_modal_title {
      color: ${({ theme }) => theme.colors.foregroundHighEmphasis};
    }

    .zig_modal_body {
      background: ${({ theme }) => theme.colors.backgroundHighEmphasis};
    }

    .zig_modal_body_light {
      background: ${({ theme }) => theme.colors.backgroundHighEmphasis};
    }

    .bridge_searchbox input {
      background: ${({ theme }) => theme.colors.backgroundHighEmphasis};
      color: ${({ theme }) => theme.colors.foregroundHighEmphasis};
      border: 1px solid ${({ theme }) => theme.colors.foreground400};
    }

    .zig_modal_body ul li {
      background: ${({ theme }) => theme.colors.backgroundHighEmphasis};
      border: 1px solid ${({ theme }) => theme.colors.foreground400};
      color: ${({ theme }) => theme.colors.foregroundHighEmphasis};
    }

    .zig_modal_body_light ul li {
      background: ${({ theme }) => theme.colors.backgroundHighEmphasis};
      border: 1px solid ${({ theme }) => theme.colors.foreground400};
      color: ${({ theme }) => theme.colors.foregroundHighEmphasis};
    }
  }
`;
const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.foreground400};
  margin-top: 20px;
`;

export const Modal = (props) => {
  const { isDark } = useTheme();
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
        <ModalWrapper
          className={
            isDark
              ? `zig_modal_content  ${props.adClass}`
              : `zig_modal_content_light  ${props.adClass}`
          }
          onClick={(e) => e.stopPropagation()}
        >
          <div className="zig_modal_header">
            <Text font="primaryHeading6" color="foregroundHighEmphasis">
              {props.title}
            </Text>

            <Divider />
          </div>
          <div
            className={
              isDark
                ? "zig_modal_body zig_scrollstyle"
                : "zig_modal_body_light zig_scrollstyle"
            }
          >
            {props.children}
          </div>
        </ModalWrapper>
      </div>
    </CSSTransition>,
    document.getElementById("root")
  );
};
