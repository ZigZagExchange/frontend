import React, {useState, useEffect, useRef} from "react";
import {useSelector} from 'react-redux';
import {userSelector} from "lib/store/features/auth/authSlice";
import {arweaveAllocationSelector} from "lib/store/features/api/apiSlice";
import api from 'lib/api';
import './ListPairPage.style.css'
import {Button, DefaultTemplate} from 'components';
import {BsLink45Deg, IoCloseSharp, RiErrorWarningLine} from "react-icons/all";
import cx from "classnames";
import 'bootstrap'
import ConnectWalletButton from "../../atoms/ConnectWalletButton/ConnectWalletButton";
import Pane from "../../atoms/Pane/Pane";
import AllocationModal from "./AllocationModal";
import {Col, Row} from "react-bootstrap";
import {x} from "@xstyled/styled-components"
import Form from "../../atoms/Form/Form";
import NumberInput from "../../atoms/Form/NumberInput";
import Submit from "../../atoms/Form/Submit";
import {max} from "../../atoms/Form/validation";


export default function ListPairPage() {
  const user = useSelector(userSelector);
  const isUserLoggedIn = user.id !== null && user.id !== undefined
  const arweaveAllocation = useSelector(arweaveAllocationSelector);
  const [txid, setTxId] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null)
  const [isFileUploadLoading, setIsFileUploadLoading] = useState(false)
  const fileInputRef = useRef()
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false)
  const [isAllocationInsufficient, setIsAllocationInsufficient] = useState(false)

  // TODO: Modal for successful upload receipt
  // TODO: Waiting on full validation from

  // test txid for receipt
  // ILvtamrekb_DUWjhx-Pwa2X6xCLpajouQvrq3aURzB0

  const refreshUserArweaveAllocation = () => {
    return api.refreshArweaveAllocation(user.address)
  }

  const clearFileInput = () => {
    fileInputRef.current.value = null
    setFileToUpload(null)
  }

  async function handleFileUpload(e) {
    const timestamp = Date.now();
    const message = `${user.address}:${timestamp}`;
    try {
      setIsFileUploadLoading(true)
      const signature = await api.signMessage(message);
      const response = await api.uploadArweaveFile(user.address, timestamp, signature, fileToUpload);
      setTxId(response.arweave_txid);
      clearFileInput()
      refreshUserArweaveAllocation()
    } finally {
      setIsFileUploadLoading(false)
      refreshUserArweaveAllocation()
    }
  }


  useEffect(() => {
    if (user.address) {
      refreshUserArweaveAllocation()
    }
  }, []);

  return (
    <DefaultTemplate>
      <div className={"p-4"}
           style={{background: "#1c2231", width: "100%", height: "calc(100vh - 80px)", color: "white"}}>
        <div className={"d-flex justify-content-center h-100 align-items-center"}>
          {!isUserLoggedIn && <div className={"d-flex flex-column align-items-center"}>
            <BsLink45Deg size={30}/>
            <h3>Connect wallet</h3>
            <div className={"mt-2"}>
              Connect your wallet to list new trading pairs
            </div>
            <div className={"mt-4"}>
              <ConnectWalletButton/>
            </div>
          </div>}

          {isUserLoggedIn && <div>
            <Pane size={"sm"} variant={"light"}>
              <x.div maxWidth={"500px"}>
                <x.div fontSize={28} mb={2}>List Pair</x.div>
                  <Form onSubmit={(data) => console.log(data)}>
                    <x.div display={"grid"} gridTemplateColumns={2} rowGap={3} columnGap={6}>
                      <NumberInput block name={"baseAssetID"} label={"Base Asset ID"}/>
                      <NumberInput block name={"quoteAssetID"} label={"Quote Asset ID"}/>
                      <NumberInput block name={"baseFee"} label={"Base Fee"}/>
                      <NumberInput block name={"quoteFee"} label={"Quote Fee"}/>
                      <NumberInput block name={"minSize"} label={"Min Size"}/>
                      <NumberInput block name={"maxSize"} label={"Max Size"}/>
                      <NumberInput block name={"zzID"} label={"Zig Zag Chain ID"}/>
                      <NumberInput block name={"pricePrecisionDecimal"} label={"Price Precision Decimals"}/>
                    </x.div>
                    <Submit w={"full"} mt={5}/>
                  </Form>

                  {fileToUpload && <x.div
                      flexGrow={1}
                      maxWidth={"150px"}
                      overflow={"hidden"}
                      textOverflow={"ellipsis"}
                      fontSize={"16px"}
                  >
                    {fileToUpload.name}
                  </x.div>}
                  {fileToUpload && <Button
                    className={"rounded close-button"}
                    onClick={() => {
                      clearFileInput()
                      setIsAllocationInsufficient(false)
                    }}>
                    <IoCloseSharp/>
                  </Button>}

                {isAllocationInsufficient && <x.div mt={3}>
                    <Row>
                      <Col sm={8} className={"d-flex align-items-center"}>
                        <RiErrorWarningLine size={18} color={"red"}/>
                        <div style={{marginLeft: "8px", fontSize: "12px"}}>Insufficient allocation</div>
                      </Col>
                      <Col sm={4} className={"d-flex justify-content-end align-items-center"}>
                        <Button
                          className={"bg_btn"}
                          onClick={() => setIsAllocationModalOpen(true)}
                          style={{
                            fontSize: "14px",
                            maxWidth: "fit-content",
                            height: "auto",
                            padding: "4px 15px"
                          }}
                        >
                          Purchase
                        </Button>
                      </Col>
                    </Row>
                  </x.div>}
                  <Button
                    className={cx("bg_btn", "mt-3", {zig_disabled: !fileToUpload})}
                    onClick={handleFileUpload}
                    disabled={!fileToUpload || isAllocationInsufficient}
                    loading={isFileUploadLoading}
                  >
                    UPLOAD
                  </Button>
              </x.div>
            </Pane>

            {txid && <div className={"mt-2"}>
              TXID: {txid}
            </div>}
          </div>}
        </div>
      </div>
      <AllocationModal
        onClose={() => setIsAllocationModalOpen(false)}
        show={isAllocationModalOpen}
        fileSize={fileToUpload?.size}
        onSuccess={() => {
          // API cache needs a bit of time to update. 1s should do it.
          setTimeout(() => {
            refreshUserArweaveAllocation()
          }, 1 * 1000)
        }}
      />
    </DefaultTemplate>
  )
}


