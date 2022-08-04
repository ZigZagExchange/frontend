import React, { useEffect } from "react";
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

  useEffect(() => {
    if (props.isLoading) {
      api.emit("connecting", props.isLoading);
    }
  }, [props.isLoading]);

  const connect = async (event) => {
    event.preventDefault();
    try {
      api.emit("connecting", true);
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
      api.emit("connecting", false);
    } catch (e) {
      console.error(e);
      api.emit("connecting", false);
    }
  };

  return (
    <Button
      isLoading={isLoading}
      scale="md"
      onClick={connect}
      style={{
        width: props.width,
        padding: isLoading ? "8px 5px" : "8px 15px",
      }}
      className={props?.className}
    >
      CONNECT WALLET
    </Button>
  );
};

export default ConnectWalletButton;
