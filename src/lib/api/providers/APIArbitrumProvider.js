import { ethers } from 'ethers';
import APIProvider from "./APIProvider";
import balanceBundleABI from "lib/contracts/BalanceBundle.json";
import { balanceBundlerAddress } from "./../constants";

export default class APIArbitrumProvider extends APIProvider {

  accountState = {};
  evmCompatible = true;
  zksyncCompatible = false;
  _tokenInfo = {};

  getAccountState = async () => {
    return this.accountState;
  };

  getBalances = async () => {
    const balances = {}
    if (!this.accountState.address) return balances;

    // allways get ETH - generate token list     
    // const tokens = ['ETH'].concat(this.api.getCurrencies()); // TODO re-enable
    const tokens = ['ETH'];
    const tokenInfoList = [{ decimals: 18, }];
    const tokenList = [ethers.constants.AddressZero];

    for(let i = 1; i < tokens.length; i++) {
      const token = tokens[i];
      const tokenInfo = this.api.getCurrencyInfo(token);

      tokenInfoList.push(tokenInfo);
      tokenList.push(tokenInfo.address);
    }

    // get token balance
    const ethContract = new ethers.Contract(
      balanceBundlerAddress,
      balanceBundleABI,
      this.api.rollupProvider
    );
    const balanceList = await ethContract.balances([this.accountState.address], tokenList);

    // generate object
    for(let i = 0; i < tokens.length; i++) {
      const balanceBN = balanceList[i];
      const currencyInfo = tokenInfoList[i];
      const valueReadable = (balanceBN && currencyInfo)
        ? ethers.utils.formatUnits(balanceBN.toString(), currencyInfo.decimals)
        : 0 

      balances[tokens[i]] = {
        value: balanceBN.toString(),
        valueReadable,
        allowance: 0,
      }
    }

    return balances;
  };

  settleOrderFill = (market, side, baseAmount, quoteAmount) => {
    const marketInfo = this.api.marketInfo[market];
    const [base, quote] = market.split('-');

    if(side === 's') {
      this.balances[base].valueReadable -= baseAmount;
      this.balances[quote].valueReadable += quoteAmount;
    } else {
      this.balances[base].valueReadable += baseAmount;
      this.balances[quote].valueReadable -= quoteAmount;
    }

    const newBaseAmountBn = ethers.utils.parseUnits(
      (this.balances[base].valueReadable).toFixed(marketInfo.baseAsset.decimals),
      marketInfo.baseAsset.decimals
    );
    const newQuoteAmountBn = ethers.utils.parseUnits(
      (this.balances[quote].valueReadable).toFixed(marketInfo.quoteAsset.decimals),
      marketInfo.quoteAsset.decimals
    );
    this.balances[base].value = newBaseAmountBn.toString();
    this.balances[quote].value = newQuoteAmountBn.toSTring();
  }
  
  submitOrder = async (product, side, price, baseAmount, quoteAmount) => {
      
  }

  signIn = async () => {
    console.log('signing in to arbitrum');
    const [account] = await this.api.web3.eth.getAccounts();
    const balances = await this.getBalances();
    this.accountState = {
      id: account,
      address: account,
      committed: {
        balances,
      },
    };

    return this.accountState;
  }  
}
