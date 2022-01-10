import {useSelector} from "react-redux";
import {arweaveAllocationSelector} from "../../../lib/store/features/api/apiSlice";
import React, {useEffect, useState} from "react";
import {Modal} from "../../atoms/Modal";
import {Button} from "../../atoms/Button";
import api from "../../../lib/api";
import Pane from "../../atoms/Pane/Pane";
import {FaEquals, FaTimes, FaMinus} from "react-icons/all";
import {userSelector} from "../../../lib/store/features/auth/authSlice";


const AllocationModal = ({onClose, show, onSuccess, fileSize}) => {
  const user = useSelector(userSelector)
  const arweaveAllocation = Number(useSelector(arweaveAllocationSelector));
  const userHasExistingAllocation = arweaveAllocation !== 0
  const fileSizeKB = fileSize / 1000
  const arweaveAllocationKB = arweaveAllocation / 1000

  const [isLoading, setIsLoading] = useState(false)
  const [KBtoPurchase, setBytesToPurchase] = useState(null)

  const pricePerKB = 0.001
  useEffect(() => {
    if (user.address) {
      api.refreshArweaveAllocation(user.address)
      setBytesToPurchase(Number(((fileSize - arweaveAllocation) / 1000) * pricePerKB).toPrecision(2))
    }
  }, [fileSize, user.address, arweaveAllocation])

  return <Modal title={"Purchase Arweave Allocation"} show={show} onClose={onClose}>
    <div className={"mb-4"} style={{fontSize: "14px"}}>
      To list a new pair you must purchase space on arweave where your metadata will be stored.
    </div>
    <div className={"mb-4"}>
      <Pane variant={"secondary"}>
        <div className={"d-flex justify-content-around align-items-center"}>

          {userHasExistingAllocation ?
              <div className={"d-flex align-items-center"}>
                <div style={{fontSize: "28px", marginRight: "8px"}}>(</div>
                <AllocationItem label={"file size"}>{fileSizeKB} kB</AllocationItem>
                <FaMinus size={18} style={{margin: "0px 10px"}}/>
                <AllocationItem label={"existing"}>
                  {arweaveAllocationKB} kB
                </AllocationItem>
                <div style={{fontSize: "28px", marginLeft: "8px"}}>)</div>
              </div>
              : <AllocationItem label={"file size"}>{fileSizeKB} kB</AllocationItem>
          }
          <FaTimes size={18}/>
          <AllocationItem label={"$/kB"}>${pricePerKB}</AllocationItem>
          <FaEquals size={18}/>
          <AllocationItem label={"total price"}>~${KBtoPurchase}</AllocationItem>
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
      PURCHASE
    </Button>
  </Modal>
}

const AllocationItem = ({label, children}) => {
  return <div className={"d-flex flex-column align-items-center"}>
    <div style={{fontSize: "20px"}}>
      {children}
    </div>
    <div style={{fontSize: "12px"}}>
      {label}
    </div>
  </div>
}

export default AllocationModal;
