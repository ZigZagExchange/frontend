import {useSelector} from "react-redux";
import {arweaveAllocationSelector} from "../../../lib/store/features/api/apiSlice";
import React, {useEffect, useState} from "react";
import {Modal} from "../../atoms/Modal";
import api from "../../../lib/api";
import Pane from "../../atoms/Pane/Pane";
import {FaEquals, FaTimes, FaMinus} from "react-icons/all";
import {userSelector} from "../../../lib/store/features/auth/authSlice";
import Submit from "../../atoms/Form/Submit";
import Form from "../../atoms/Form/Form";
import {x} from "@xstyled/styled-components";

const AllocationModal = ({onClose, show, onSuccess, bytesToPurchase}) => {
  const user = useSelector(userSelector)
  const arweaveAllocation = Number(useSelector(arweaveAllocationSelector));
  const userHasExistingAllocation = arweaveAllocation !== 0
  const fileSizeKB = bytesToPurchase / 1000
  const arweaveAllocationKB = arweaveAllocation / 1000
  const [KBtoPurchase, setKBToPurchase] = useState(null)

  const pricePerKB = 0.001
  useEffect(() => {
    if (user.address) {
      api.refreshArweaveAllocation(user.address)
      setKBToPurchase(Number(((bytesToPurchase - arweaveAllocation) / 1000) * pricePerKB).toPrecision(2))
    }
  }, [bytesToPurchase, user.address, arweaveAllocation])

  return <Modal title={"Purchase Arweave Allocation"} show={show} onClose={onClose}>
    <x.div fontSize={14}>
      ZigZag enables permissionless pair listings by storing your pair's metadata on Arweave.
      You must purchase space on Arweave first.
    </x.div>
    <Pane size={"xs"} my={8}>
      <x.div display={"flex"} justifyContent={"space-around"} alignItems={"center"}>
        {userHasExistingAllocation ?
            <x.div display={"flex"} alignItems={"center"}>
              <x.div fontSize={28} mr={3}>(</x.div>
              <AllocationItem label={"file size"}>{fileSizeKB} kB</AllocationItem>
              <FaMinus size={18} style={{margin: "0px 10px"}}/>
              <AllocationItem label={"existing"}>
                {arweaveAllocationKB} kB
              </AllocationItem>
              <x.div fontSize={28} ml={3}>)</x.div>
            </x.div>
            : <AllocationItem label={"file size"}>{fileSizeKB} kB</AllocationItem>
        }
        <FaTimes size={18}/>
        <AllocationItem label={"$/kB"}>${pricePerKB}</AllocationItem>
        <FaEquals size={18}/>
        <AllocationItem label={"total price"}>~${KBtoPurchase}</AllocationItem>
      </x.div>
    </Pane>

    <Form onSubmit={async () => {
      const transaction = await api.purchaseArweaveBytes("USDC", bytesToPurchase)
      await transaction.awaitReceipt()
      onSuccess()
    }}>
      <Submit block>PURCHASE</Submit>
    </Form>
  </Modal>
}

const AllocationItem = ({label, children}) => {
  return <x.div display={"flex"} flexDirection={"column"} alignItems={"center"}>
    <x.div fontSize={20}>
      {children}
    </x.div>
    <x.div fontSize={12}>
      {label}
    </x.div>
  </x.div>
}

export default AllocationModal;
