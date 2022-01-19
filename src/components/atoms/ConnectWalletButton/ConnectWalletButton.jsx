import React, {useState} from "react";
import {useSelector} from "react-redux";
import {networkSelector} from "../../../lib/store/features/api/apiSlice";
import {Button} from "../Button";
import api from "../../../lib/api";
import {useHistory, useLocation} from "react-router-dom";
import {BsFillPlugFill} from "react-icons/all";
import API from "../../../lib/api/API";

const ConnectWalletButton = () => {
  const network = useSelector(networkSelector);
  const [isLoading, setIsLoading] = useState(false)
  const history = useHistory()
  const location = useLocation()

  const pushToBridgeMaybe = (state) => {
    if (!state.id && !/^\/bridge(\/.*)?/.test(location.pathname)) {
      history.push('/bridge')
    }
  }

  return <Button
    block
    size={"sm"}
    loading={isLoading}
    onClick={() => {
      setIsLoading(true)
      api.signIn(network)
        .then(state => {
          pushToBridgeMaybe(state)
        })
        .finally(() => setIsLoading(false))
    }}
  >
    <BsFillPlugFill size={18}/>
    CONNECT WALLET
  </Button>
}


export default ConnectWalletButton;
