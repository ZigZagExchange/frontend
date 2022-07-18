import React, { useState } from "react";
import { usePopper } from "react-popper";
import styled from "styled-components";
import Portal from "@reach/portal";

const PopoverContainer = styled.div`
  z-index: 9999;

  visibility: ${(props) => (props.show ? "visible" : "hidden")};
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: visibility 150ms linear, opacity 150ms linear;

  background: ${({ theme }) => theme.colors.backgroundHighEmphasis};
  color: ${({ theme }) => theme.colors.foregroundHighEmphasis};
  border-radius: 8px;
  box-shadow: 0px 8px 16px 0px #0101011a;
`;

const ReferenceElement = styled.div`
  display: inline-block;
`;

const Arrow = styled.div`
  width: 8px;
  height: 8px;
  z-index: 9998;

  ::before {
    position: absolute;
    width: 8px;
    height: 8px;
    z-index: 9998;

    content: "";
    transform: rotate(45deg);
    background: ${({ theme }) => theme.colors.backgroundHighEmphasis};
  }

  &.arrow-top {
    bottom: -5px;
    ::before {
      border-top: none;
      border-left: none;
    }
  }

  &.arrow-bottom {
    top: -5px;
    ::before {
      border-bottom: none;
      border-right: none;
    }
  }

  &.arrow-left {
    right: -5px;

    ::before {
      border-bottom: none;
      border-left: none;
    }
  }

  &.arrow-right {
    left: -5px;
    ::before {
      border-right: none;
      border-top: none;
    }
  }
`;

export default function Popover({
  content,
  show,
  children,
  placement = "auto",
}) {
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement,
    strategy: "fixed",
    modifiers: [
      { name: "offset", options: { offset: [8, 8] } },
      { name: "arrow", options: { element: arrowElement } },
    ],
  });

  return (
    <>
      <ReferenceElement ref={setReferenceElement}>{children}</ReferenceElement>
      <Portal>
        <PopoverContainer
          show={show}
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          {content}
          <Arrow
            className={`arrow-${
              attributes.popper?.["data-popper-placement"] ?? ""
            }`}
            ref={setArrowElement}
            style={styles.arrow}
            {...attributes.arrow}
          />
        </PopoverContainer>
      </Portal>
    </>
  );
}
