import { useSelector } from "react-redux";
import {
  arweaveAllocationSelector,
  balancesSelector,
} from "../../../lib/store/features/api/apiSlice";
import React, { useEffect, useState } from "react";
import { Modal } from "../../atoms/Modal";
import api from "../../../lib/api";
import Pane from "../../atoms/Pane/Pane";
import { FaEquals, FaTimes, FaMinus } from "react-icons/all";
import { userSelector } from "../../../lib/store/features/auth/authSlice";
import Submit from "../../atoms/Form/Submit";
import Form from "../../atoms/Form/Form";
import { x } from "@xstyled/styled-components";
import { toast } from "react-toastify";
import { jsonify } from "../../../lib/helpers/strings";

const AllocationModal = ({ onClose, show, onSuccess, bytesToPurchase }) => {
  const user = useSelector(userSelector);
  const arweaveAllocation = Number(useSelector(arweaveAllocationSelector));
  const balanceData = useSelector(balancesSelector);

  const arweaveAllocationKB = arweaveAllocation / 1000;
  const userHasExistingAllocation = arweaveAllocation !== 0;
  const fileSizeKB = bytesToPurchase / 1000;
  const pricePerKB = 0.001;

  const [totalPrice, setTotalPrice] = useState(fileSizeKB * pricePerKB);
  const [isUSDCBalanceSufficient, setIsUSDCBalanceSufficient] = useState(false);

  useEffect(() => api.getBalances(), []);

  useEffect(() => {
    if (user.address) {
      api.refreshArweaveAllocation(user.address);
      const kbToPurchase = Number((bytesToPurchase - arweaveAllocation) / 1000);
      setTotalPrice(kbToPurchase * pricePerKB);
      if (totalPrice) {
        let usdcBalance = 0;
        const feeCurrency = "USDC";
        const mainnetNetwork = api.networks.zksync[0];
        if (
          mainnetNetwork in balanceData &&
          feeCurrency in balanceData[mainnetNetwork]
        ) {
          usdcBalance = Number(
            balanceData[mainnetNetwork][feeCurrency].valueReadable
          );
        }

        if (totalPrice > usdcBalance) {
          setIsUSDCBalanceSufficient(false);
        } else {
          setIsUSDCBalanceSufficient(true);
        }
      }
    }

    //@TODO: remove jsonify here, add better dep
  }, [bytesToPurchase, user.address, arweaveAllocation, jsonify(balanceData)]);

  return (
    <Modal title={"Purchase Arweave Allocation"} show={show} onClose={onClose}>
      <x.div fontSize={14}>
        ZigZag enables permissionless pair listings by storing your pair's
        metadata on Arweave. You must purchase space on Arweave first.
      </x.div>
      <Pane size={"xs"} my={8}>
        <x.div
          display={"flex"}
          justifyContent={"space-around"}
          alignItems={"center"}
        >
          {userHasExistingAllocation ? (
            <x.div display={"flex"} alignItems={"center"}>
              <x.div fontSize={28} mr={3}>
                (
              </x.div>
              <AllocationItem label={"file size"}>
                {fileSizeKB} kB
              </AllocationItem>
              <FaMinus size={18} style={{ margin: "0px 10px" }} />
              <AllocationItem label={"existing"}>
                {arweaveAllocationKB} kB
              </AllocationItem>
              <x.div fontSize={28} ml={3}>
                )
              </x.div>
            </x.div>
          ) : (
            <AllocationItem label={"file size"}>{fileSizeKB} kB</AllocationItem>
          )}
          <FaTimes size={18} />
          <AllocationItem label={"$/kB"}>${pricePerKB}</AllocationItem>
          <FaEquals size={18} />
          <AllocationItem label={"total price"}>
            ~${totalPrice.toPrecision(2)}
          </AllocationItem>
        </x.div>
      </Pane>

      <Form
        onSubmit={async () => {
          try {
            const transaction = await api.purchaseArweaveBytes(bytesToPurchase);
            await transaction.awaitReceipt();
            await onSuccess();
          } catch (e) {
            console.error("Error purchasing arweave bytes", e);
            toast.error("Transaction was rejected");
          }
        }}
      >
        <Submit block isDisabled={!isUSDCBalanceSufficient}>
          {isUSDCBalanceSufficient
            ? "PURCHASE"
            : `INSUFFICIENT USDC WALLET BALANCE`}
        </Submit>
      </Form>
    </Modal>
  );
};

const AllocationItem = ({ label, children }) => {
  return (
    <x.div display={"flex"} flexDirection={"column"} alignItems={"center"}>
      <x.div fontSize={20}>{children}</x.div>
      <x.div fontSize={12}>{label}</x.div>
    </x.div>
  );
};

export default AllocationModal;
