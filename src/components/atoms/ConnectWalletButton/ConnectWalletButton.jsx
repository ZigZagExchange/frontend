import React, {useState} from "react";
import { useTranslation } from "react-i18next";
import "../../../translations/i18n";
import {useSelector} from "react-redux";
import {networkSelector} from "../../../lib/store/features/api/apiSlice";
import {Button} from "../Button";
import darkPlugHead from "../../../assets/icons/dark-plug-head.png";
import api from "../../../lib/api";
import {useHistory, useLocation} from "react-router-dom";

const ConnectWalletButton = () => {
  const network = useSelector(networkSelector);
  const [isLoading, setIsLoading] = useState(false)
  const history = useHistory()
  const location = useLocation()
  const { t } = useTranslation();

  const pushToBridgeMaybe = (state) => {
    if (!state.id && !/^\/bridge(\/.*)?/.test(location.pathname)) {
      history.push('/bridge')
    }
  }

  return <Button
    loading={isLoading}
    className="bg_btn"
    text={t("connect_wallet")}
    img={darkPlugHead}
    onClick={() => {
      setIsLoading(true)
      api.signIn(network)
        .then(state => {
          pushToBridgeMaybe(state)
        })
        .finally(() => setIsLoading(false))
    }}
  />
}


export default ConnectWalletButton;
