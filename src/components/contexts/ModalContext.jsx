import React, {
  cloneElement,
  createContext,
  isValidElement,
  useState,
} from "react";

export const Context = createContext({
  onShow: () => null,
  onClose: () => null,
});

const ModalContext = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalNode, setModalNode] = useState(null);

  const openHandler = (node) => {
    setModalNode(node);
    setIsOpen(true);
  };

  const closeHandler = () => {
    setModalNode(undefined);
    setIsOpen(false);
  };

  return (
    <Context.Provider
      value={{
        onShow: openHandler,
        onClose: closeHandler,
      }}
    >
      {isOpen &&
        isValidElement(modalNode) &&
        cloneElement(modalNode, {
          onClose: closeHandler,
          isOpened: isOpen,
        })}
      {children}
    </Context.Provider>
  );
};

export default ModalContext;
