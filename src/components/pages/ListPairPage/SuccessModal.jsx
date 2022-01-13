import React from "react";
import {Modal} from "../../atoms/Modal";
import {x} from "@xstyled/styled-components"

const SuccessModal = ({txid, show, onClose}) => {
  return <Modal show={show} onClose={onClose}>
    <x.div>Success</x.div>
    <x.div>txid: {txid}</x.div>
  </Modal>
}

export default SuccessModal;
