import { ethers } from 'ethers';
import APIProvider from "./APIProvider";
import balanceBundleABI from "lib/contracts/BalanceBundle.json";
import { balanceBundlerAddress, ARBITRUM_FEE_RECIPIENT_ADDRESS } from "./../constants";

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
    const tokens = ['ETH'].concat(this.api.getCurrencies());
    const tokenInfoList = [{ decimals: 18, }];
    const tokenList = [ethers.constants.AddressZero];

    for(let i = 1; i < tokens.length; i++) {
      const token = tokens[i];
      const tokenInfo = this.api.getCurrencyInfo(token);
      if (!tokenInfo || !tokenInfo.address) return;

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
  
  submitOrder = async (market, side, price, baseAmount, quoteAmount, orderType) => {
    const marketInfo = this.api.marketInfo[market];

    if (!quoteAmount) quoteAmount = baseAmount * price;
    if (!baseAmount) baseAmount = quoteAmount / price;

    let makerToken, takerToken, makerAmountBN, takerAmountBN, gasFee;
    if(side === 's') {
      makerToken = marketInfo.baseAsset.address;
      takerToken = marketInfo.quoteAsset.address;
      makerAmountBN = ethers.utils.parseUnits (
        baseAmount.toFixed(marketInfo.baseAsset.decimals),
        marketInfo.baseAsset.decimals
      );
      takerAmountBN = ethers.utils.parseUnits (
        quoteAmount.toFixed(marketInfo.quoteAsset.decimals),
        marketInfo.quoteAsset.decimals
      );
      gasFee = ethers.utils.parseUnits (
        marketInfo.baseFee.toFixed(marketInfo.baseAsset.decimals),
        marketInfo.baseAsset.decimals
      )
    } else {
      makerToken = marketInfo.quoteAsset.address;
      takerToken = marketInfo.baseAsset.address;
      makerAmountBN = ethers.utils.parseUnits (
        quoteAmount.toFixed(marketInfo.quoteAsset.decimals),
        marketInfo.quoteAsset.decimals
      )
      takerAmountBN = ethers.utils.parseUnits (
        baseAmount.toFixed(marketInfo.baseAsset.decimals),
        marketInfo.baseAsset.decimals
      )
      gasFee = ethers.utils.parseUnits (
        marketInfo.quoteFee.toFixed(marketInfo.quoteAsset.decimals),
        marketInfo.quoteAsset.decimals
      )
    }

    const expirationTimeSeconds = (orderType === 'market')
      ? Date.now() / 1000 + 60 // one minute
      : Date.now() / 1000 + 60 * 60 * 24 * 7 // one week

    const Order = {
      makerAddress: this.accountState.address,
      makerToken: makerToken,
      takerToken: takerToken,
      feeRecipientAddress: ARBITRUM_FEE_RECIPIENT_ADDRESS,
      makerAssetAmount:  makerAmountBN.toString(),
      takerAssetAmount: takerAmountBN.toString(),
      makerVolumeFee: '0',
      takerVolumeFee: '0',
      gasFee: gasFee.toString(),
      expirationTimeSeconds: expirationTimeSeconds.toFixed(0),
      salt: (Math.random() * 123456789).toFixed(0),
    };
    
    /*
    const domain = {
      name: 'ZigZag Order',
      version: '1',
      chainId: this.network,
      //verifyingContract: "0x48caa485547760cae44b82f1d8caeebfe63c9312"
    };
    */
    const domain = {
      name: 'SetTest',
      version: '1',
      chainId: '1',
    };
    
    const types = {
      "Order": [
        { "name": 'makerAddress', "type": 'address' },
        { "name": 'makerToken', "type": 'address' },
        { "name": 'takerToken', "type": 'address' },
        { "name": 'feeRecipientAddress', "type": 'address' },
        { "name": 'makerAssetAmount', "type": 'uint256' },
        { "name": 'takerAssetAmount', "type": 'uint256' },
        { "name": 'makerVolumeFee', "type": 'uint256' },
        { "name": 'takerVolumeFee', "type": 'uint256' },
        { "name": 'gasFee', "type": 'uint256' },
        { "name": 'expirationTimeSeconds', "type": 'uint256' },
        { "name": 'salt', "type": 'uint256' }
      ]
    };

    console.log(domain, types, Order);
    const signer = await this.api.rollupProvider.getSigner();
    const signature = await signer._signTypedData(domain, types, Order);

    Order.signature = signature;
    console.log(Order)
    
    
    this.api.send("submitorder3", [this.network, market, Order]);
    return Order;
    
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
