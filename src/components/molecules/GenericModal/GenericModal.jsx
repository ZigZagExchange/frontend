import React from "react";
import styled from "styled-components";
import { CloseIcon } from "../../atoms/Svg";

const ModalOverlay = styled.div`
  position: fixed;
  display: grid;
  justify-content: center;
  align-content: center;
  width: 100%;
  height: 100%;
  background: #2527277d;
  backdrop-filter: blur(0.8px);
  z-index: 999;
`;

const Modal = styled.div`
  max-width: ${({ width }) => `${width}px`};
  width: 100%;
  background: ${({ theme }) => theme.colors.backgroundHighEmphasis};
  border: 1px solid ${({ theme }) => theme.colors.foreground400};
  box-shadow: 0px 8px 16px 0px #0101011a;
  padding: 20px;
  border-radius: 8px;
`;

const CloseWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 100%;
  display: grid;
  justify-content: flex-end;
`;

const CloseButton = styled.button`
  //   margin: 25px 25px 25px 0;
  border: none;
  background: transparent;
  cursor: pointer;
`;

const GenericModal = ({
  width = 528,
  isOpened = false,
  onClose,
  children,
  ...props
}) => {
  return isOpened ? (
    <>
      <ModalOverlay onClick={onClose}>
        <Modal width={width} {...props} onClick={(e) => e.stopPropagation()}>
          {onClose && (
            <CloseWrapper>
              <CloseButton onClick={onClose}>
                <CloseIcon />
              </CloseButton>
            </CloseWrapper>
          )}
          {children}
        </Modal>
      </ModalOverlay>
    </>
  ) : (
    <></>
  );
};

export default GenericModal;
