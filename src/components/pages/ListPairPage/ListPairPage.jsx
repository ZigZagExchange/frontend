import React, {useState, useEffect, useCallback} from "react";
import {useSelector} from 'react-redux';
import {userSelector} from "lib/store/features/auth/authSlice";
import api from 'lib/api';
import {DefaultTemplate} from 'components';
import {AiOutlineQuestionCircle, RiErrorWarningLine} from "react-icons/all";
import 'bootstrap'
import ConnectWalletButton from "../../atoms/ConnectWalletButton/ConnectWalletButton";
import Pane from "../../atoms/Pane/Pane";
import AllocationModal from "./AllocationModal";
import {x} from "@xstyled/styled-components"
import Form from "../../atoms/Form/Form";
import NumberInput from "../../atoms/Form/NumberInput";
import Submit, {Button} from "../../atoms/Form/Submit";
import {forceValidation, max, min, required} from "../../atoms/Form/validation";
import {jsonify} from "../../../lib/helpers/strings";
import {Dev} from "../../../lib/helpers/env";
import SuccessModal from "./SuccessModal";
import {arweaveAllocationSelector, networkSelector} from "lib/store/features/api/apiSlice";
import SelectInput from "../../atoms/Form/SelectInput";
import {model} from "../../atoms/Form/helpers";
import {debounce} from "lodash"
import Tooltip from "../../atoms/Tooltip/Tooltip";

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
  const [baseFee, setBaseFee] = useState("")
  const [quoteFee, setQuoteFee] = useState("")
  const [zigZagChainId, setZigZagChainId] = useState(1)

  const [baseSymbol, setBaseSymbol] = useState(null)
  const [quoteSymbol, setQuoteSymbol] = useState(null)

  const [isBaseAssetIdInvalid, setIsBaseAssetIdInvalid] = useState(false)
  const [isQuoteAssetIdInvalid, setIsQuoteAssetIdInvalid] = useState(false)

  const [basePrice, setBasePrice] = useState(null)
  const [quotePrice, setQuotePrice] = useState(null)

  const network = useSelector(networkSelector);
  const isUserConnectedToMainnet = network === 1

  // we purchase 500k bytes at once so the user does not have to
  // repeatedly repurchase space if wanting to list more than 1 market
  const bytesToPurchase = 500000

  const refreshUserArweaveAllocation = () => {
    return api.refreshArweaveAllocation(user.address)
  }


  const getAmountForTargetNotional = (price) => {
    const targetUSDFeeAmount = 1
    return (targetUSDFeeAmount / price).toFixed(6)
  }

  const renderFeeHint = (assetPrice, assetFee, symbol, feeSetter) => {
    if (assetPrice) {
      const notional = (Number(assetPrice) * Number(assetFee)).toFixed(2)
      if (notional > 0) {
        return <x.div pl={2} fontSize={12} color={"blue-gray-500"} mt={1} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
          <x.div style={{wordBreak: "break-all"}}>
            {assetFee} {symbol} = ${notional}
          </x.div>
          {notional > 1 && <x.div>
            <Button
              ml={1}
              variant={"secondary"}
              size={"xs"}
              onClick={() => feeSetter(getAmountForTargetNotional(assetPrice))}>
            set to $1
            </Button>
            <x.div/>
        </x.div>}
      </x.div>}
    }
    return null
  }

  useEffect(() => {
    if (user.address) {
      refreshUserArweaveAllocation()
    }
  }, []);

  async function getBaseInfo(baseAssetId, chainId) {
    if (baseAssetId && baseAssetId !== "") {
      try {
        const {symbol} = await api.getTokenInfo(baseAssetId, chainId)
        if (symbol) {
          try {
            const {price: apiPrice} = await api.getTokenPrice(baseAssetId, chainId)
            const price = Number(apiPrice)
            if (price === 0) {
              throw Error(`${symbol} price came back as 0`)
            }
            setBasePrice(price)
            setBaseFee(getAmountForTargetNotional(price))
          } catch (e) {
            setBaseFee("")
            setBasePrice(null)
            console.error("error getting base price", e)
          }
          setBaseSymbol(symbol)
          setIsBaseAssetIdInvalid(false)
        }
      } catch (e) {
        setBaseSymbol(null)
        setIsBaseAssetIdInvalid(true)
        setBaseFee("")
        setBasePrice(null)
      }
    } else {
      setBaseSymbol(null)
      setBasePrice(null)
    }
  }

  async function getQuoteInfo(quoteAssetId, chainId) {
    if (quoteAssetId && quoteAssetId !== "") {
      try {
        const {symbol} = await api.getTokenInfo(quoteAssetId, chainId)
        if (symbol) {
          try {
            const {price: apiPrice} = await api.getTokenPrice(quoteAssetId, chainId)
            const price = Number(apiPrice)
            if (price === 0) {
              throw Error(`${symbol} price came back as 0`)
            }
            setQuotePrice(price)
            setQuoteFee(getAmountForTargetNotional(price))
          } catch (e) {
            setQuoteFee("")
            setQuotePrice(null)
            console.error("error setting quote fee", e)
          }
          setQuoteSymbol(symbol)
          setIsQuoteAssetIdInvalid(false)
        }
      } catch (e) {
        setQuoteSymbol(null)
        setIsQuoteAssetIdInvalid(true)
        setQuoteFee("")
        setQuotePrice(null)
      }
    } else {
      setQuoteSymbol(null)
      setQuotePrice(null)
    }
  }

  const queryBaseTokenInfo = useCallback(debounce(getBaseInfo, 500), [])
  useEffect(() => {
    queryBaseTokenInfo(baseAssetId, zigZagChainId)
  }, [baseAssetId, zigZagChainId])


  const queryQuoteTokenInfo = useCallback(debounce(getQuoteInfo, 500), [])
  useEffect(() => {
    queryQuoteTokenInfo(quoteAssetId, zigZagChainId)
  }, [quoteAssetId, zigZagChainId])


  const onFormSubmit = async (formData, resetForm) => {
    return new Promise(async (resolve, reject) => {
      const toFile = {}
      for (const [key] of Object.entries(formData)) {
        toFile[key] = Number(formData[key])
      }
      const fileData = new TextEncoder().encode(jsonify(toFile))
      const file = new File([fileData], `${toFile.baseAssetId}-${toFile.quoteAssetId}.json`)

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
        <Pane size={"sm"} variant={"light"} maxWidth={"500px"} margin={"auto"}>
          <x.div fontSize={28} mb={2}>List New Market</x.div>
          {(baseAssetId || quoteAssetId) &&
          <x.div display={"flex"} fontSize={35} justifyContent={"center"} my={4}>
            <x.span color={baseSymbol ? "blue-gray-400" : "blue-gray-800"}>
              {baseSymbol ? baseSymbol : "XXX"}
            </x.span>
            <x.span color={baseSymbol && quoteSymbol ? "blue-gray-400" : "blue-gray-800"}>/</x.span>
            <x.span color={quoteSymbol ? "blue-gray-400" : "blue-gray-800"}>
              {quoteSymbol ? quoteSymbol : "XXX"}
            </x.span>
          </x.div>}
          <Form
            initialValues={{
              baseAssetId: baseAssetId,
              quoteAssetId: quoteAssetId,
              baseFee: baseFee,
              quoteFee: quoteFee,
              zigzagChainId: zigZagChainId,
              pricePrecisionDecimals: "",
            }}
            onSubmit={onFormSubmit}
          >
            <x.div display={"grid"} gridTemplateColumns={2} rowGap={5} columnGap={6} mb={5}>
              <NumberInput
                block
                {...model(baseAssetId, setBaseAssetId)}
                label={<x.span>Base Asset <x.a color={{_: "blue-gray-500", hover: "teal-200"}} target={"_blank"} href={zigZagChainId === 1 ? "https://zkscan.io/explorer/tokens" : "https://rinkeby.zkscan.io/explorer/tokens"}>Internal ID</x.a></x.span>}
                name={"baseAssetId"}
                validate={[
                  required,
                  min(0),
                  forceValidation(isBaseAssetIdInvalid, "invalid asset on zksync")
                ]}
                rightOfLabel={<TooltipHelper>zkSync token ID of the first asset appearing in the pair (BASE/QUOTE)</TooltipHelper>}
              />
              <NumberInput
                block
                {...model(quoteAssetId, setQuoteAssetId)}
                label={<x.span>Quote Asset <x.a color={{_: "blue-gray-500", hover: "teal-200"}} target={"_blank"} href={zigZagChainId === 1 ? "https://zkscan.io/explorer/tokens" : "https://rinkeby.zkscan.io/explorer/tokens"}>Internal ID</x.a></x.span>}
                name={"quoteAssetId"}
                validate={[
                  required,
                  min(0),
                  forceValidation(isQuoteAssetIdInvalid, "invalid asset on zksync")
                ]}
                rightOfLabel={<TooltipHelper>zkSync token ID of the second asset appearing in the pair (BASE/QUOTE)</TooltipHelper>}
              />
              <x.div display={"flex"} flexDirection={"column"}>
                <NumberInput
                  block
                  name={"baseFee"}
                  {...model(baseFee, setBaseFee)}
                  label={baseSymbol ? `${baseSymbol} Swap Fee` : "Base Swap Fee"}
                  validate={[required, min(0)]}
                  rightOfLabel={<TooltipHelper>Swap fee collected by market makers</TooltipHelper>}
                />
                {renderFeeHint(basePrice, baseFee, baseSymbol, setBaseFee)}
              </x.div>
              <x.div display={"flex"} flexDirection={"column"}>
                <NumberInput
                  block
                  name={"quoteFee"}
                  {...model(quoteFee, setQuoteFee)}
                  label={quoteSymbol ? `${quoteSymbol} Swap Fee` : "Quote Swap Fee"}
                  validate={[required, min(0)]}
                  rightOfLabel={<TooltipHelper>Swap fee collected by market makers</TooltipHelper>}
                />
                {renderFeeHint(quotePrice, quoteFee, quoteSymbol, setQuoteFee)}
              </x.div>
              <NumberInput
                block
                name={"pricePrecisionDecimals"}
                label={"Price Precision Decimals"}
                validate={[required, max(18), min(0)]}
                rightOfLabel={<TooltipHelper>
                  <x.div>
                    Number of decimal places in the price of the asset pair.
                  </x.div>

                  <x.div display={"grid"} gridTemplateColumns={2} mt={2} gap={0}>
                    <x.div>ex: ETH/USDC has '2'</x.div>
                    <x.div>($3250.61)</x.div>
                    <x.div>ex: ETH/WBTC has '6'</x.div>
                    <x.div>(0.075225)</x.div>
                  </x.div>
                </TooltipHelper>}
              />
              <SelectInput
                {...model(zigZagChainId, setZigZagChainId)}
                name={"zigzagChainId"}
                label={"Network"}
                items={[{name: "zkSync - Mainnet", id: 1}, {name: "zkSync - Rinkeby", id: 1000}]}
                validate={required}
                rightOfLabel={<TooltipHelper>zkSync network on which the pair will be listed</TooltipHelper>}
              />
            </x.div>
            {isAllocationInsufficient &&
            <x.div display={"flex"} alignItems={"center"} justifyContent={"space-between"} mb={4}>
              <x.div display={"flex"} alignItems={"center"}>
                <RiErrorWarningLine size={18} color={"red"}/>
                <x.div ml={1} fontSize={12} color={"blue-gray-400"}>Insufficient Arweave allocation</x.div>
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
            {!isUserLoggedIn && <ConnectWalletButton/>}
            {isUserLoggedIn && isUserConnectedToMainnet && <Submit block mt={5}>{isAllocationInsufficient ? "PURCHASE ALLOCATION" : "LIST"}</Submit>}
            {isUserLoggedIn && !isUserConnectedToMainnet && <Button block isDisabled>Please connect to Mainnet</Button>}
          </Form>
        </Pane>
      </x.div>
      <AllocationModal
        onClose={() => setIsAllocationModalOpen(false)}
        show={isAllocationModalOpen}
        bytesToPurchase={bytesToPurchase}
        onSuccess={() => {
          // API cache needs a bit of time to update. Arweave bridge runs on a 5 second loop
          // we timeout here so we make sure we get fresh data
          setTimeout(async () => {
            await refreshUserArweaveAllocation()
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

const TooltipHelper = ({children}) => {
  return <Tooltip placement={"right"} label={children}>
    <x.div display={"inline-flex"} color={"blue-gray-600"} ml={2} alignItems={"center"}>
      <AiOutlineQuestionCircle size={14}/>
    </x.div>
  </Tooltip>
}
