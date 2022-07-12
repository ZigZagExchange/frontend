import { useContext, useCallback } from "react";
import { Context } from "../contexts/ModalContext";

const useModal = (modal) => {
  const { onShow, onClose } = useContext(Context);

  const onShowHandler = useCallback(() => {
    onShow(modal);
  }, [modal, onShow]);

  return [onShowHandler, onClose];
};

export default useModal;
