import { toast } from "react-toastify";
import APIProvider from "./APIProvider";

export default class APIArbitrumProvider extends APIProvider {

  _accountState = {};
  evmCompatible = true;
  zksyncCompatible = false;
  lastPrices = {};
  marketInfo = {};

  getAccountState = async () => {
    return this._accountState;
  };

  getProfile = async () => {
    return {};
  };

  getBalances = async () => {
    return {};
  };

  submitOrder = async (product, side, price, baseAmount, quoteAmount) => {
      
  }

  signIn = async () => {
      console.log('signing in to arbitrum');
  }

  cacheMarketInfoFromNetwork = async (pairs) => {
  }
}
