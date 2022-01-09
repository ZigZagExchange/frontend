import React, {useState} from "react";
import {useSelector} from "react-redux";
import {networkSelector} from "../../../lib/store/features/api/apiSlice";
import {Button} from "../../atoms/Button";
import darkPlugHead from "../../../assets/icons/dark-plug-head.png";
import api from "../../../lib/api";

const ConnectWalletButton = ({onSuccess}) => {
  const network = useSelector(networkSelector);
  const [isLoading, setIsLoading] = useState(false)
  return <Button
    loading={isLoading}
    className="bg_btn"
    text="CONNECT WALLET"
    img={darkPlugHead}
    onClick={() => {
      setIsLoading(true)
      api.signIn(network)
        .then(state => {
          if (onSuccess) {
            onSuccess(state)
          }
        })
        .finally(() => setIsLoading(false))
    }}
  />
}

export default ConnectWalletButton;
