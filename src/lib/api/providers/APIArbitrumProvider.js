import { ethers } from 'ethers';
import APIProvider from "./APIProvider";
import balanceBundleABI  from "lib/contracts/BalanceBundle.json";
import erc20ContractABI from "lib/contracts/ERC20.json";
import wethContractABI from "lib/contracts/WETH.json";
import { 
  balanceBundlerAddress,
  ARBITRUM_ADDRESSES
} from "./../constants";

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
    const erc20Contract = new ethers.Contract(
      balanceBundlerAddress,
      balanceBundleABI,
      this.api.rollupProvider
    );
    const balanceList = await erc20Contract.balances([this.accountState.address], tokenList);

    // generate object
    for(let i = 0; i < tokens.length; i++) {
      const balanceBN = balanceList[i];
      const currencyInfo = tokenInfoList[i];
      
      const allowanceBN = (tokens[i] === 'ETH') 
        ? ethers.constants.MaxUint256
        : await this.allowance(currencyInfo.address); // TODO replace
      const valueReadable = (balanceBN && currencyInfo)
        ? ethers.utils.formatUnits(balanceBN.toString(), currencyInfo.decimals)
        : 0 
      const allowanceReadable = (allowanceBN && currencyInfo)
        ? ethers.utils.formatUnits(allowanceBN.toString(), currencyInfo.decimals)
        : 0 

      balances[tokens[i]] = {
        value: balanceBN.toString(),
        valueReadable,
        allowance: allowanceBN.toString(),
        allowanceReadable
      }
    }

    return balances;
  };

  // TODO replace
  allowance = async (tokenAddress) => {
    if (!this.accountState.address) return 0;

    const erc20Contract = new ethers.Contract(
      tokenAddress,
      erc20ContractABI,
      this.api.rollupProvider
    );

    const allowance = await erc20Contract.allowance(
      this.accountState.address,
      ARBITRUM_ADDRESSES.EXCHANGE_ADDRESS
    );

    return ethers.BigNumber.from(allowance);
  };

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
        marketInfo.baseFee,
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
        marketInfo.quoteFee,
        marketInfo.quoteAsset.decimals
      )
    }

    const expirationTimeSeconds = (orderType === 'market')
      ? Date.now() / 1000 + 60 * 2 // two minutes
      : Date.now() / 1000 + 60 * 60 * 24 * 7 // one week

    const Order = {
      makerAddress: this.accountState.address,
      makerToken: makerToken,
      takerToken: takerToken,
      feeRecipientAddress: ARBITRUM_ADDRESSES.FEE_RECIPIENT_ADDRESS,
      makerAssetAmount:  makerAmountBN.toString(),
      takerAssetAmount: takerAmountBN.toString(),
      makerVolumeFee: '0',
      takerVolumeFee: '0',
      gasFee: gasFee.toString(),
      expirationTimeSeconds: expirationTimeSeconds.toFixed(0),
      salt: (Math.random() * 123456789).toFixed(0),
    };
    
    const domain = {
      name: 'ZigZag',
      version: '2',
      chainId: this.network,
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
    console.log(signature);

    Order.signature = signature;    
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

  approveExchangeContract = async (token, amount) => {
    const currencyInfo = this.api.getCurrencyInfo(token);
    if (!currencyInfo.address) throw new Error(`ERC20 address for ${token} not found`);
    let amountBN;
    if(!amount) {
      amountBN = ethers.constants.MaxUint256;
    } else {
      amountBN = ethers.utils.parseUnits (
        amount.toFixed(currencyInfo.decimals),
        currencyInfo.decimals
      );
    }

    const signer = await this.api.rollupProvider.getSigner();
    const erc20Contract = new ethers.Contract(
      currencyInfo.address,
      erc20ContractABI,
      signer
    );

    await erc20Contract.approve(
      ARBITRUM_ADDRESSES.EXCHANGE_ADDRESS,
      amountBN
    );

    // update account balance
    await this.api.getBalances();
    return true;
  };

  warpETH = async (amountBN) => {
    const signer = await this.api.rollupProvider.getSigner();
    const wethContract = new ethers.Contract(
      ARBITRUM_ADDRESSES.WETH_ADDRESS,
      wethContractABI,
      signer
    );

    await wethContract.deposit(amountBN);

    // update account balance
    await this.api.getBalances();
    return true;
  };

  unWarpETH = async (amountBN) => {
    const signer = await this.api.rollupProvider.getSigner();
    const wethContract = new ethers.Contract(
      ARBITRUM_ADDRESSES.WETH_ADDRESS,
      wethContractABI,
      signer
    );

    await wethContract.withdraw(amountBN);

    // update account balance
    await this.api.getBalances();
    return true;
  };
}
