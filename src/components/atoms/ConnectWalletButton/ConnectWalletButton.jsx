import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { networkSelector, isConnectingSelector } from "../../../lib/store/features/api/apiSlice";
import { Button } from "../Button";
import darkPlugHead from "../../../assets/icons/dark-plug-head.png";
import api from "../../../lib/api";
import { useHistory, useLocation } from "react-router-dom";
import { formatAmount } from "../../../lib/utils";

const ConnectWalletButton = (props) => {
  const network = useSelector(networkSelector);
  const isLoading = useSelector(isConnectingSelector);
  // const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const location = useLocation();

  useEffect(()=>{
    if(props.isLoading) {
      api.emit("connecting", props.isLoading);
      // setIsLoading(props.isLoading)
    }
  }, [props.isLoading])

  const pushToBridgeMaybe = async (state) => {
    const walletBalance = formatAmount(state.committed.balances['ETH'], { decimals: 18 });
    let activationFee;
    if (api.apiProvider.changePubKeyFee) {
        activationFee = await api.apiProvider.changePubKeyFee('ETH');
    } else {
        activationFee = 0;
    }

    if (!state.id && (!/^\/bridge(\/.*)?/.test(location.pathname)) && (isNaN(walletBalance) || walletBalance < activationFee)) {
      history.push("/bridge");
    }
  };

  return (
    <Button
      loading={isLoading}
      className="bg_btn"
      text="CONNECT WALLET"
      img={darkPlugHead}
      onClick={() => {
        api.emit("connecting", true);
        // setIsLoading(true);
        api
          .signIn(network)
          .then((state) => {
            pushToBridgeMaybe(state);
          })
          .finally(() => api.emit("connecting", false));
      }}
    />
  );
};

export default ConnectWalletButton;
