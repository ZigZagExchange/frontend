import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { userSelector } from "lib/store/features/auth/authSlice";
import {arweaveAllocationSelector, networkSelector} from "lib/store/features/api/apiSlice";
import api from 'lib/api';
import './ListPairPage.style.css'
import {Button, DefaultTemplate} from 'components';
import {BsLink45Deg, HiOutlineRefresh} from "react-icons/all";
import darkPlugHead from "../../../assets/icons/dark-plug-head.png";

export default function ListPairPage() {
  const user = useSelector(userSelector);
  const isUserLoggedIn = Object.keys(user).length !== 0
  const arweaveAllocation = useSelector(arweaveAllocationSelector);
  const [txid, setTxId] = useState("");

  const refreshUserArweaveAllocation = () => {
    return api.refreshArweaveAllocation(user.address)
  }

  useEffect(() => {
    if (user.address) {
      refreshUserArweaveAllocation()
    }
  }, []);

  async function handleFileUpload(e) {
      const files = document.getElementById("arweave-file-upload").files;
      console.log("debug:: files", files);
      const timestamp = Date.now();
      const message = `${user.address}:${timestamp}`;
      const signature = await api.signMessage(message);
      const response = await api.uploadArweaveFile(user.address, timestamp, signature, files[0]);
      console.log(response);
      setTxId(response.arweave_txid);
  }

  return (
      <DefaultTemplate>
        <div className={"p-4"} style={{background: "#1c2231", width: "100%", height: "calc(100vh - 80px)", color: "white"}}>
          <div className={"d-flex justify-content-center"}>
            {!isUserLoggedIn && <div className={"d-flex flex-column align-items-center"}>
              <BsLink45Deg size={30}/>
              <h3>Connect wallet</h3>
              <div className={"mt-2"}>
                Connect your wallet to list new trading pairs
              </div>
              <div className={"mt-4"}>
                <ConnectWalletButton />
              </div>
            </div>}

            {isUserLoggedIn && <div>
              <div>
                <h3>Allocation</h3>
                <div className={"d-flex align-items-center mt-1"}>
                  <div className={"arweave-allocation"}>
                    Available Bytes: {arweaveAllocation}
                  </div>
                  <RefreshButton onClick={() => refreshUserArweaveAllocation()}/>
                </div>
                <div className={"d-flex mt-3"}>
                  <div>
                    <PurchaseButton onSuccess={() => refreshUserArweaveAllocation()}/>
                  </div>
                </div>
              </div>

              <h3 className={"mt-5"}>Upload</h3>
              <input id="arweave-file-upload" type="file" name="file"/>
              <button type="button" onClick={handleFileUpload}>Upload</button>
              <div>TXID: {txid}</div>
            </div>}
          </div>
        </div>
      </DefaultTemplate>
  )
}

const PurchaseButton = ({onSuccess}) => {
  const [isLoading, setIsLoading] = useState(false)
  return <Button loading={isLoading} className="bg_btn" onClick={() => {
    setIsLoading(true)
    api.purchaseArweaveBytes("USDC", 10**5)
      .then((transaction) => transaction.awaitReceipt().then(() => onSuccess()))
      .finally(() => setIsLoading(false))
  }}>
    Purchase 100kB (0.10 USDC)
  </Button>
}

const RefreshButton = ({onClick}) => {
  return <button className={"refresh-button"} onClick={onClick}>
    <HiOutlineRefresh display={"block"} size={18}/>
  </button>
}

const ConnectWalletButton = () => {
  const network = useSelector(networkSelector);
  const [isLoading, setIsLoading] = useState(false)
  return <Button
    loading={isLoading}
    className="bg_btn"
    text="CONNECT WALLET"
    img={darkPlugHead}
    onClick={() => {
      setIsLoading(true)
      api.signIn(network).finally(() => setIsLoading(false))
    }}
  />
}

