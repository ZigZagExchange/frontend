import React, {useState, useEffect, useRef} from "react";
import {useSelector} from 'react-redux';
import {userSelector} from "lib/store/features/auth/authSlice";
import {arweaveAllocationSelector} from "lib/store/features/api/apiSlice";
import api from 'lib/api';
import './ListPairPage.style.css'
import {Button, DefaultTemplate, Modal} from 'components';
import {BsLink45Deg, HiOutlineRefresh, IoCloseSharp, RiErrorWarningLine} from "react-icons/all";
import cx from "classnames";
import 'bootstrap'
import ConnectWalletButton from "../../atoms/ConnectWalletButton/ConnectWalletButton";
import Pane from "../../atoms/Pane/Pane";
import AllocationModal from "./AllocationModal";
import {Col, Row} from "react-bootstrap";


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

  const onFileChange = (e) => {
    const fileReader = new FileReader()
    fileReader.onload = (e) => {
      try {
        const contents = JSON.parse(e.target.result)
      } catch (e) {
        console.log(e)
      }
    }

    const file = e.target.files[0]
    fileReader.readAsText(file)
    setFileToUpload(file)

    if (Number(file.size) > arweaveAllocation) {
      setIsAllocationInsufficient(true)
      setIsAllocationModalOpen(true)
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
            <Pane size={"md"}>
              <div style={{minWidth: "300px"}}>
                <h3>List Pair</h3>
                <div className={"mt-2 d-flex justify-content-between align-items-center"}>
                  <div className={"d-flex align-items-center mt-3 justify-content-between"} style={{flexGrow: 1}}>
                    <Button onClick={() => fileInputRef.current.click()}
                            className={cx("bg_btn_secondary", "p-1", "rounded", "w-100", {"d-none": fileToUpload})}>
                      <input
                        type="file"
                        name="file"
                        id="arweave-file-upload"
                        accept="application/json"
                        ref={fileInputRef}
                        style={{display: "none"}}
                        onChange={onFileChange}
                      />
                      SELECT FILE
                    </Button>
                    {fileToUpload && <div
                      style={{
                        flexGrow: 1,
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontSize: "16px"
                      }}
                    >
                      {fileToUpload.name}
                    </div>}
                    {fileToUpload && <Button
                      className={"rounded close-button"}
                      onClick={() => {
                        clearFileInput()
                        setIsAllocationInsufficient(false)
                      }}>
                      <IoCloseSharp/>
                    </Button>}
                  </div>
                </div>

                {isAllocationInsufficient && <div className={"mt-3"}>
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
                  </div>}
                  <Button
                    className={cx("bg_btn", "mt-3", {zig_disabled: !fileToUpload})}
                    onClick={handleFileUpload}
                    disabled={!fileToUpload || isAllocationInsufficient}
                    loading={isFileUploadLoading}
                  >
                    UPLOAD
                  </Button>
              </div>
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


