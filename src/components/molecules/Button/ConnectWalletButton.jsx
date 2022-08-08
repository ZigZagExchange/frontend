import React from "react";
import { useSelector } from "react-redux";
import {
  networkSelector,
  isConnectingSelector,
  balancesSelector,
} from "../../../lib/store/features/api/apiSlice";
import Button from "./Button";
import api from "../../../lib/api";
import { useHistory, useLocation } from "react-router-dom";

const ConnectWalletButton = (props) => {
  const network = useSelector(networkSelector);
  const isLoading = useSelector(isConnectingSelector);
  const balanceData = useSelector(balancesSelector);
  const history = useHistory();
  const location = useLocation();

  const connect = async (event) => {
    event.preventDefault();
    api.emit("connecting", true);
    try {
      await api.signIn(network);
      if (api.zksyncCompatible) {
        const balance = balanceData?.[network]?.ETH?.valueReadable;
        const activationFee = await api.apiProvider.changePubKeyFee("ETH");  
        const activated = await api.apiProvider.checkAccountActivated();
        if (
          !activated &&
          !/^\/bridge(\/.*)?/.test(location.pathname) &&
          (isNaN(balance) || balance < activationFee)
        ) {
          history.push("/bridge");
        }
      }
    } catch (e) {
      console.error(e);
    }
    api.emit("connecting", false);
  };

  return (
    <Button
      isLoading={isLoading || props.isLoading}
      scale="md"
      onClick={connect}
      style={{
        width: props.width,
        padding: isLoading || props.isLoading ? "8px 5px" : "8px 15px",
      }}
      className={props?.className}
    >
      CONNECT WALLET
    </Button>
  );
};

export default ConnectWalletButton;
