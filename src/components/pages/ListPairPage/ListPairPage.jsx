import React, {useState, useEffect, useRef, useCallback, useMemo} from "react";
import {useSelector} from 'react-redux';
import {userSelector} from "lib/store/features/auth/authSlice";
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
import {forceValidation, gte, max, min, required} from "../../atoms/Form/validation";
import {jsonify} from "../../../lib/helpers/strings";
import {Dev} from "../../../lib/helpers/env";
import SuccessModal from "./SuccessModal";
import {arweaveAllocationSelector} from "lib/store/features/api/apiSlice";
import SelectInput from "../../atoms/Form/SelectInput";
import {model} from "../../atoms/Form/helpers";
import {debounce} from "lodash"


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

  const [baseAssetId, setBaseAssetId] = useState("")
  const [quoteAssetId, setQuoteAssetId] = useState("")
  const [baseAssetIdSymbolPreview, setBaseAssetIdSymbolPreview] = useState(null)
  const [quoteAssetIdSymbolPreview, setQuoteAssetIdSymbolPreview] = useState(null)

  const [isBaseAssetIdInvalid, setIsBaseAssetIdInvalid] = useState(false)
  const [isQuoteAssetIdInvalid, setIsQuoteAssetIdInvalid] = useState(false)

  // we purchase 500k bytes at once so the user does not have to
  // repeatedly repurchase space if wanting to list more than 1 market
  const bytesToPurchase = 500000

  const refreshUserArweaveAllocation = () => {
    return api.refreshArweaveAllocation(user.address)
  }

  useEffect(() => {
    if (user.address) {
      refreshUserArweaveAllocation()
    }
  }, []);


  function getBaseInfo(baseAssetId) {
    if (baseAssetId && baseAssetId !== "") {
      api.tokenInfo(baseAssetId).then(res => {
        setBaseAssetIdSymbolPreview(res.symbol)
        setIsBaseAssetIdInvalid(false)
      }).catch(e => {
        setBaseAssetIdSymbolPreview(null)
        setIsBaseAssetIdInvalid(true)
      })
    } else {
      setBaseAssetIdSymbolPreview(null)
    }
  }

  function getQuoteInfo(quoteAssetId) {
    if (quoteAssetId && quoteAssetId !== "") {
      api.tokenInfo(quoteAssetId).then(res => {
        setQuoteAssetIdSymbolPreview(res.symbol)
        setIsQuoteAssetIdInvalid(false)
      }).catch(e => {
        setQuoteAssetIdSymbolPreview(null)
        setIsQuoteAssetIdInvalid(true)
      })
    } else {
      setQuoteAssetIdSymbolPreview(null)
    }
  }

  const queryBaseTokenInfo = useCallback(debounce(getBaseInfo, 500), [])
  useEffect(() => {
    queryBaseTokenInfo(baseAssetId)
  }, [baseAssetId])


  const queryQuoteTokenInfo = useCallback(debounce(getQuoteInfo, 500), [])
  useEffect(() => {
    queryQuoteTokenInfo(quoteAssetId)
  }, [quoteAssetId])



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
             h={"full"}
             style={{minHeight: "calc(100vh - 80px)"}}
             color={"white"}
             display={"flex"}
             alignItems={"center"}
             justifyContent={"center"}
      >
        {!isUserLoggedIn && <Pane
          size={"md"}
          variant={"light"}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <BsLink45Deg size={30}/>
          <h3>Connect wallet</h3>
          <x.div mt={2}>
            Connect your wallet to list new markets
          </x.div>
          <x.div mt={4}>
            <ConnectWalletButton/>
          </x.div>
        </Pane>}

        {isUserLoggedIn && <Pane size={"sm"} variant={"light"} maxWidth={"500px"} margin={"auto"}>
          <x.div fontSize={28} mb={2}>List New Market</x.div>
          {(baseAssetId || quoteAssetId) &&
          <x.div display={"flex"} fontSize={35} justifyContent={"center"} my={4}>
            <x.span color={baseAssetIdSymbolPreview ? "blue-gray-400" : "blue-gray-600"}>
              {baseAssetIdSymbolPreview ? baseAssetIdSymbolPreview : "XXX"}
            </x.span>
            <x.span color={baseAssetIdSymbolPreview && quoteAssetIdSymbolPreview ? "blue-gray-400" : "blue-gray-600"}>-</x.span>
            <x.span color={quoteAssetIdSymbolPreview ? "blue-gray-400" : "blue-gray-600"}>
              {quoteAssetIdSymbolPreview ? quoteAssetIdSymbolPreview : "XXX"}
            </x.span>
          </x.div>}
          <Form initialValues={{
            baseAssetId: baseAssetId,
            quoteAssetId: quoteAssetId,
            baseFee: "",
            quoteFee: "",
            minSize: "",
            maxSize: "",
            zigzagChainId: 1,
            pricePrecisionDecimal: "",
          }} onSubmit={onFormSubmit}>
            <x.div display={"grid"} gridTemplateColumns={2} rowGap={3} columnGap={6} mb={5}>
              <NumberInput
                block
                {...model(baseAssetId, setBaseAssetId)}
                name={"baseAssetId"}
                label={"Base Asset ID"}
                validate={[required, min(0), forceValidation(isBaseAssetIdInvalid, "invalid asset on zksync")]}
              />
              <NumberInput
                block
                {...model(quoteAssetId, setQuoteAssetId)}
                name={"quoteAssetId"}
                label={"Quote Asset ID"}
                validate={[required, min(0), forceValidation(isQuoteAssetIdInvalid, "invalid asset on zksync")]}
              />
              <NumberInput block name={"baseFee"} label={"Base Fee"} validate={[required, min(0)]}/>
              <NumberInput block name={"quoteFee"} label={"Quote Fee"} validate={[required, min(0)]}/>
              <NumberInput block name={"minSize"} label={"Min Size"} validate={[required, min(0)]}/>
              <NumberInput block name={"maxSize"} label={"Max Size"} validate={[required, min(0)]}/>
              <SelectInput name={"zigzagChainId"} label={"Ethereum Network"}
                           items={[{name: "Mainnet", id: 1}, {name: "Rinkeby", id: 1000}]} validate={required}/>
              <NumberInput block name={"pricePrecisionDecimal"} label={"Price Precision Decimals"}
                           validate={[required, max(18)]}/>
            </x.div>
            {isAllocationInsufficient &&
            <x.div display={"flex"} alignItems={"center"} justifyContent={"space-between"} mb={4}>
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
      <AllocationModal
        onClose={() => setIsAllocationModalOpen(false)}
        show={isAllocationModalOpen}
        fileSizeBytes={bytesToPurchase}
        onSuccess={() => {
          // API cache needs a bit of time to update. Arweave bridge runs on a 5 second loop
          // we timeout here so we make sure we get fresh data
          setTimeout(() => {
            refreshUserArweaveAllocation()
            if (fileToUpload.size > arweaveAllocation) {
              setIsAllocationInsufficient(true)
            } else {
              setIsAllocationInsufficient(false)
              setFileToUpload(null)
            }
          }, 1 * 5000)
          setIsAllocationModalOpen(false)
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


