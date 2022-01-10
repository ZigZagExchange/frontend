import {useSelector} from "react-redux";
import {arweaveAllocationSelector} from "../../../lib/store/features/api/apiSlice";
import React, {useState} from "react";
import {Modal} from "../../atoms/Modal";
import {Button} from "../../atoms/Button";
import api from "../../../lib/api";
import Pane from "../../atoms/Pane/Pane";
import {FaEquals, FaTimes, FaMinus} from "react-icons/all";

const AllocationModal = ({onClose, show, onSuccess, fileSize}) => {
  const arweaveAllocation = useSelector(arweaveAllocationSelector);
  const [isLoading, setIsLoading] = useState(false)
  const fileSizeKB = fileSize / 1000

  return <Modal title={"Update Arweave Allocation"} show={show} onClose={onClose}>
    <div className={"mb-4"} style={{fontSize: "14px"}}>
      To list a new pair you must purchase space on arweave where your metadata will be stored.
    </div>
    <div className={"mb-4"}>
      <Pane variant={"secondary"}>
        <div className={"d-flex justify-content-around align-items-center"}>
          <AllocationItem label={"file size"}>{fileSizeKB} kB</AllocationItem>
          <FaTimes size={18}/>
          <AllocationItem label={"file size"}>$1</AllocationItem>
          <FaEquals size={18}/>
          <AllocationItem label={"file size"}>$1</AllocationItem>
        </div>
      </Pane>
    </div>

    <Button loading={isLoading} className="bg_btn" onClick={() => {
      setIsLoading(true)
      api.purchaseArweaveBytes("USDC", fileSize)
        .then((transaction) => {
          transaction.awaitReceipt().then(() => onSuccess())
        })
        .finally(() => setIsLoading(false))
    }}>
      Purchase {fileSizeKB} KB
    </Button>
  </Modal>
}

const AllocationItem = ({label, children}) => {
  return <div className={"d-flex flex-column align-items-center"}>
    <div style={{fontSize: "22px"}}>
      {children}
    </div>
    <div>
      {label}
    </div>
  </div>
}

export default AllocationModal;
