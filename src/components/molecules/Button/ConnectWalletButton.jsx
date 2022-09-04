import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  networkSelector,
  isConnectingSelector,
} from "../../../lib/store/features/api/apiSlice";
import Button from "./Button";
import api from "../../../lib/api";
import { useHistory, useLocation } from "react-router-dom";
import { formatAmount } from "../../../lib/utils";

const ConnectWalletButton = (props) => {
  const network = useSelector(networkSelector);
  const isLoading = useSelector(isConnectingSelector);
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
      // setConnecting(true);
      const state = await api.signIn(network);
      const walletBalance = formatAmount(state.committed.balances["ETH"], {
        decimals: 18,
      });
      const activationFee = api.apiProvider.zksyncCompatible
        ? await api.apiProvider.changePubKeyFee("ETH")
        : 0;

      if (
        network === 1 &&
        !state.id &&
        !/^\/bridge(\/.*)?/.test(location.pathname) &&
        (isNaN(walletBalance) || walletBalance < activationFee)
      ) {
        history.push("/bridge");
      }
      // setConnecting(false);
      api.emit("connecting", false);
    } catch (e) {
      console.error(e);
      // setConnecting(false);
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
