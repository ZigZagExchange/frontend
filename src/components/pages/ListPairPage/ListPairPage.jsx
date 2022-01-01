import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { userSelector } from "lib/store/features/auth/authSlice";
import { arweaveAllocationSelector } from "lib/store/features/api/apiSlice";
import api from 'lib/api';
import './ListPairPage.style.css'
import { Header } from 'components';

export default function ListPairPage() {
  const user = useSelector(userSelector);
  const arweaveAllocation = useSelector(arweaveAllocationSelector);
  const [txid, setTxId] = useState("");

  useEffect(() => {
      api.refreshArweaveAllocation(user.address);
  }, []);

  async function handleFileUpload(e) {
      const files = document.getElementById("arweave-file-upload").files;
      console.log(files);
      const timestamp = Date.now();
      const message = `${user.address}:${timestamp}`;
      const signature = await api.signMessage(message);
      const response = await api.uploadArweaveFile(user.address, timestamp, signature, files[0]);
      console.log(response);
      setTxId(response.arweave_txid);
  }

  return (
      <>
          <Header />
          <h3>Allocation</h3>
          <div className="arweave-allocation">Available Bytes: {arweaveAllocation}</div>
          <button onClick={() => api.refreshArweaveAllocation(user.address)}>Refresh Allocation</button>
          <br/>
          <br/>
          <button onClick={() => api.purchaseArweaveBytes("USDC", 10**5)}>Purchase 100kB (0.10 USDC)</button>
          <br/>
          <br/>

          <h3>Upload</h3>
          <input id="arweave-file-upload" type="file" name="file" />
          <br/>
          <br/>
          <button type="button" onClick={handleFileUpload}>Upload</button>
          <br/>
          <br/>
          <div>TXID: {txid}</div>
          <br/>
          <br/>
      </>
  )
}
