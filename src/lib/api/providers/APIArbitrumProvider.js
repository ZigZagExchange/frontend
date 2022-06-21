import { toast } from "react-toastify";
import { ethers } from 'ethers';
import APIProvider from "./APIProvider";
import balanceBundleABI from "lib/contracts/BalanceBundle.json";

export default class APIArbitrumProvider extends APIProvider {
  balanceBundleAddress = '0x1b7ad12c73b9fea574cd2320650676c0a0bde8a0';

  accountState = {};
  ethWallet = {};
  evmCompatible = true;
  zksyncCompatible = false;
  lastPrices = {};
  marketInfo = {};
  balances = {};

  getAccountState = async () => {
    return this._accountState;
  };

  getProfile = async () => {
    return {};
  };

  getBalances = async () => {
    if (!this.accountState.address) return {};

    // allways get ETH - generate token list
    const tokens = super.getCurrencies();
    const tokenInfo = [{ decimals: 18, }];
    const tokenList = [ethers.constants.AddressZero];

    for(let i = 1; i < tokens.length; i++) {
      const token = tokens[i];

      tokenInfo.push(super.getCurrencyInfo(token));
      tokenList.push(tokenInfo[token].address);
    }

    // get token balance
    const ethContract = new ethers.Contract(
      this.balanceBundleAddress,
      balanceBundleABI,
      this.api.ethersProvider
    );
    const balanceList = await ethContract.balances(this.accountState.address, tokenList);

    // generate object
    for(let i = 0; i < tokens.length; i++) {
      const balance = balanceList[i];
      const token = tokens[i];
      const currencyInfo = tokenInfo[token];

      this.balances[tokens[i]] = {
        value: balance,
        valueReadable:
          (balance && currencyInfo && balance / 10 ** currencyInfo.decimals) ||
          0,
        valueAvailable: balance,
        valueAvailableReadable: 
          (balance && currencyInfo && balance / 10 ** currencyInfo.decimals) ||
          0,
        allowance: 0,
      }
    }

    return balances;
  };

  submitOrder = async (product, side, price, baseAmount, quoteAmount) => {
      
  }

  signIn = async () => {
    console.log('signing in to arbitrum');
    this.ethWallet = this.api.ethersProvider.getSigner();

    const address = await this.ethWallet.getAddress();
    this.accountState.id = address
    this.accountState.address = address
  }

  cacheMarketInfoFromNetwork = async (pairs) => {
  }
}
