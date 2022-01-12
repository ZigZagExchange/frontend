import React, {useState, useEffect, useRef} from "react";
import {useSelector} from 'react-redux';
import {userSelector} from "lib/store/features/auth/authSlice";
import {arweaveAllocationSelector} from "lib/store/features/api/apiSlice";
import api from 'lib/api';
import {Button, DefaultTemplate} from 'components';
import {BsLink45Deg, RiErrorWarningLine} from "react-icons/all";
import 'bootstrap'
import ConnectWalletButton from "../../atoms/ConnectWalletButton/ConnectWalletButton";
import Pane from "../../atoms/Pane/Pane";
import AllocationModal from "./AllocationModal";
import {x} from "@xstyled/styled-components"
import Form from "../../atoms/Form/Form";
import NumberInput from "../../atoms/Form/NumberInput";
import Submit from "../../atoms/Form/Submit";
import {max, min, required} from "../../atoms/Form/validation";
import {jsonify} from "../../../lib/helpers/strings";
import {Dev} from "../../../lib/helpers/env";
import SuccessModal from "./SuccessModal";


export default function ListPairPage() {
  const user = useSelector(userSelector);
  const isUserLoggedIn = user.id !== null && user.id !== undefined

  const arweaveAllocation = useSelector(arweaveAllocationSelector);
  const arweaveAllocationKB = Number(arweaveAllocation) / 1000

  const [txid, setTxId] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null)
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [isAllocationInsufficient, setIsAllocationInsufficient] = useState(false)

  // TODO: Modal for successful upload receipt
  // TODO: Waiting on full validation from

  // test txid for receipt
  // ILvtamrekb_DUWjhx-Pwa2X6xCLpajouQvrq3aURzB0

  const refreshUserArweaveAllocation = () => {
    return api.refreshArweaveAllocation(user.address)
  }

  useEffect(() => {
    if (user.address) {
      refreshUserArweaveAllocation()
    }
  }, []);

  const onFormSubmit = async (formData, resetForm) => {
    return new Promise(async (resolve, reject) => {
      const fileData = new TextEncoder().encode(jsonify(formData))
      const file = new File([fileData], `${formData.baseAssetId}-${formData.quoteAssetId}.json`)

      if (file.size > arweaveAllocation) {
        setFileToUpload(file)
        setIsAllocationInsufficient(true)
        setIsAllocationModalOpen(true)
        reject()
        return
      }

      const timestamp = Date.now();
      const message = `${user.address}:${timestamp}`;
      try {
        const signature = await api.signMessage(message);
        const response = await api.uploadArweaveFile(user.address, timestamp, signature, file);
        setTxId(response.arweave_txid);
        setIsSuccessModalOpen(true);
        resetForm()
      } catch (e) {
        reject(e)
        return
      }
      refreshUserArweaveAllocation();
      resolve()
    })
  }

  return (
    <DefaultTemplate>
      <x.div p={4}
             backgroundColor={"blue-400"}
             w={"full"}
             style={{height: "calc(100vh - 80px)"}}
             color={"white"}
      >
        <x.div h={"full"} display={"flex"} alignItems={"center"}>
          {!isUserLoggedIn && <x.div
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            w={"full"}
            h={"full"}
          >
            <BsLink45Deg size={30}/>
            <h3>Connect wallet</h3>
            <x.div mt={2}>
              Connect your wallet to list new trading pairs
            </x.div>
            <x.div mt={4}>
              <ConnectWalletButton/>
            </x.div>
          </x.div>}

          {isUserLoggedIn && <Pane size={"sm"} variant={"light"} maxWidth={"500px"} margin={"auto"}>
            <x.div fontSize={28} mb={2}>List Pair</x.div>
            <Form initialValues={{
              baseAssetId: "",
              quoteAssetId: "",
              baseFee: "",
              quoteFee: "",
              minSize: "",
              maxSize: "",
              zigzagChainId: "",
              pricePrecisionDecimal: ""
            }} onSubmit={onFormSubmit}>
              <x.div display={"grid"} gridTemplateColumns={2} rowGap={3} columnGap={6} mb={5}>
                <NumberInput block name={"baseAssetId"} label={"Base Asset ID"} validate={required}/>
                <NumberInput block name={"quoteAssetId"} label={"Quote Asset ID"} validate={required}/>
                <NumberInput block name={"baseFee"} label={"Base Fee"} validate={required}/>
                <NumberInput block name={"quoteFee"} label={"Quote Fee"} validate={required}/>
                <NumberInput block name={"minSize"} label={"Min Size"} validate={required}/>
                <NumberInput block name={"maxSize"} label={"Max Size"} validate={required}/>
                <NumberInput block name={"zigzagChainId"} label={"Zig Zag Chain ID"} validate={required}/>
                <NumberInput block name={"pricePrecisionDecimal"} label={"Price Precision Decimals"}
                             validate={required}/>
              </x.div>
              {isAllocationInsufficient && <x.div display={"flex"} alignItems={"center"} justifyContent={"space-between"} mb={4}>
                <x.div display={"flex"} alignItems={"center"}>
                  <RiErrorWarningLine size={18} color={"red"}/>
                  <x.div ml={1} fontSize={12} color={"blue-gray-400"}>Insufficient arweave allocation</x.div>
                </x.div>
                <x.div color={"blue-gray-400"}>
                  {arweaveAllocationKB} kB
                </x.div>
              </x.div>}

              <Dev>
                <x.div fontSize={12} color={"blue-gray-500"} mb={3} textAlign={"right"}>
                  arweave allocation: {arweaveAllocationKB} kB
                </x.div>
              </Dev>

              <Submit block mt={5}>{isAllocationInsufficient ? "PURCHASE ALLOCATION" : "LIST"}</Submit>
            </Form>
          </Pane>}
        </x.div>
      </x.div>
      <AllocationModal
        onClose={() => setIsAllocationModalOpen(false)}
        show={isAllocationModalOpen}
        fileSize={fileToUpload?.size}
        onSuccess={() => {
          // API cache needs a bit of time to update. 1s should do it.
          setTimeout(() => {
            refreshUserArweaveAllocation()
            if (fileToUpload.size > arweaveAllocation) {
              setIsAllocationInsufficient(true)
              setIsAllocationModalOpen(true)
            } else {
              setIsAllocationInsufficient(false)
              setIsAllocationModalOpen(false)
              setFileToUpload(null)
            }
          }, 1 * 1000)
        }}
      />
      <SuccessModal
        txid={txid}
        show={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          setTxId(null);
        }}
      />
    </DefaultTemplate>
  )
}


