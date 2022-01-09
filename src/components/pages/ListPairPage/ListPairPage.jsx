import React, {useState, useEffect, useRef} from "react";
import {useSelector} from 'react-redux';
import {userSelector} from "lib/store/features/auth/authSlice";
import {arweaveAllocationSelector} from "lib/store/features/api/apiSlice";
import api from 'lib/api';
import './ListPairPage.style.css'
import {Button, DefaultTemplate} from 'components';
import {BsLink45Deg, HiOutlineRefresh, IoCloseSharp} from "react-icons/all";
import cx from "classnames";
import 'bootstrap'
import ConnectWalletButton from "../../molecules/ConnectWalletButton/ConnectWalletButton";


export default function ListPairPage() {
  const user = useSelector(userSelector);
  const isUserLoggedIn = Object.keys(user).length !== 0
  const arweaveAllocation = useSelector(arweaveAllocationSelector);
  const [txid, setTxId] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null)
  const [isFileUploadLoading, setIsFileUploadLoading] = useState(false)
  const fileInputRef = useRef()

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
        <div className={"d-flex justify-content-center"}>
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
            <div>
              <h3>Allocation</h3>
              <div className={"d-flex align-items-center"}>
                <div className={"arweave-allocation"}>
                  Available Bytes: {arweaveAllocation}
                </div>
                <RefreshButton onClick={() => refreshUserArweaveAllocation()}/>
              </div>
              <div className={"d-flex mt-3"}>
                <div>
                  <PurchaseButton onSuccess={() => {
                    // API cache needs a bit of time to update. 1s should do it.
                    setTimeout(() => {
                      refreshUserArweaveAllocation()
                    }, 1 * 1000)
                  }}/>
                </div>
              </div>
            </div>

            <h3 className={"mt-5"}>Upload</h3>
            <div className={"mt-2 d-flex justify-content-between align-items-center"}>
              <div className={"d-flex align-items-center"} style={{flexGrow: 1}}>
                <Button onClick={() => fileInputRef.current.click()}
                        className={cx("file-input-button", "p-1", "rounded")}>
                  <input
                    type="file"
                    name="file"
                    id="arweave-file-upload"
                    accept="application/json"
                    ref={fileInputRef}
                    style={{display: "none"}}
                    onChange={onFileChange}
                  />
                  Add file
                </Button>
                {fileToUpload && <div
                  style={{
                    marginLeft: "10px",
                    flexGrow: 1,
                    maxWidth: "150px",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {fileToUpload.name}
                </div>}
              </div>
              {fileToUpload && <Button
                className={"rounded close-button"}
                onClick={() => clearFileInput()}>
                <IoCloseSharp/>
              </Button>}
            </div>
            {fileToUpload && <div className={"mt-2"}>
              Size (bytes): {fileToUpload.size}
            </div>}
            <Button
              className={cx("bg_btn", "mt-3", {zig_disabled: !fileToUpload})}
              onClick={handleFileUpload}
              disabled={!fileToUpload}
              loading={isFileUploadLoading}
            >
              Upload
            </Button>
            {txid && <div className={"mt-2"}>
              TXID: {txid}
            </div>}
          </div>}
        </div>
      </div>
    </DefaultTemplate>
  )
}

const RefreshButton = ({onClick}) => {
  const [rotation, setRotation] = useState(0)
  return <button
    style={{
      transform: `rotateZ(${rotation}deg)`,
    }}
    onClick={() => {
      onClick()
      setRotation(rotation - 180)
    }}
    className={"refresh-button"}
  >
    <HiOutlineRefresh size={18}/>
  </button>
}

const PurchaseButton = ({onSuccess}) => {
  const [isLoading, setIsLoading] = useState(false)
  return <Button loading={isLoading} className="bg_btn" onClick={() => {
    setIsLoading(true)
    api.purchaseArweaveBytes("USDC", 10 ** 5)
      .then((transaction) => {
        transaction.awaitReceipt().then(() => onSuccess())
      })
      .finally(() => setIsLoading(false))
  }}>
    Purchase 100kB (0.10 USDC)
  </Button>
}
