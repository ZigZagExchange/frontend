import { ethers } from 'ethers';
import APIProvider from "./APIProvider";
import balanceBundleABI  from "lib/contracts/BalanceBundle.json";
import erc20ContractABI from "lib/contracts/ERC20.json";
import wethContractABI from "lib/contracts/WETH.json";
import { 
  balanceBundlerAddress
} from "./../constants";

export default class APIArbitrumProvider extends APIProvider {

  accountState = {};
  evmCompatible = true;
  zksyncCompatible = false;
  _tokenInfo = {};
  defaultMarket = "WETH-USDC"

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
      if (!tokenInfo || !tokenInfo.address) continue;

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
    const exchangeAddress = this.getExchangeAddress();

    // generate object
    for(let i = 0; i < tokens.length; i++) {
      const balanceBN = balanceList[i];
      const currencyInfo = tokenInfoList[i];
      
      const allowanceBN = (tokens[i] === 'ETH') 
        ? ethers.constants.MaxUint256
        : await this.getAllowance(currencyInfo.address, exchangeAddress); // TODO replace
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

  getAllowance = async (
    tokenAddress,
    contractAddress
  ) => {
    if (!this.accountState.address || !contractAddress) return 0;

    const erc20Contract = new ethers.Contract(
      tokenAddress,
      erc20ContractABI,
      this.api.rollupProvider
    );

    const allowance = await erc20Contract.allowance(
      this.accountState.address,
      contractAddress
    );

    return ethers.BigNumber.from(allowance);
  };

  submitOrder = async (market, side, price, baseAmount, quoteAmount, orderType) => {
    const marketInfo = this.api.marketInfo[market];

    if (!quoteAmount) quoteAmount = baseAmount * price;
    if (!baseAmount) baseAmount = quoteAmount / price;

    let makerToken, takerToken, makerAmountBN, takerAmountBN, gasFee, makerVolumeFeeBN, takerVolumeFeeBN;
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
      takerAmountBN = takerAmountBN.mul(99999).div(100000);
      gasFee = ethers.utils.parseUnits(
        parseFloat(marketInfo.baseFee).toFixed(marketInfo.baseAsset.decimals),
        marketInfo.baseAsset.decimals 
      )
      const makerFee = baseAmount * Number(marketInfo.makerVolumeFee)
      makerVolumeFeeBN = ethers.utils.parseUnits (
        makerFee.toFixed(marketInfo.baseAsset.decimals),
        marketInfo.baseAsset.decimals 
      )
      const takerFee = baseAmount * Number(marketInfo.takerVolumeFee)
      takerVolumeFeeBN = ethers.utils.parseUnits (
        takerFee.toFixed(marketInfo.baseAsset.decimals),
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
        marketInfo.quoteFee.toString(),
        marketInfo.quoteAsset.decimals
      )
      const makerFee = quoteAmount * Number(marketInfo.makerVolumeFee)
      makerVolumeFeeBN = ethers.utils.parseUnits (
        makerFee.toFixed(marketInfo.quoteAsset.decimals),
        marketInfo.quoteAsset.decimals 
      )
      const takerFee = quoteAmount * Number(marketInfo.takerVolumeFee)
      takerVolumeFeeBN = ethers.utils.parseUnits (
        takerFee.toFixed(marketInfo.quoteAsset.decimals),
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
      feeRecipientAddress: marketInfo.feeAddress,
      makerAssetAmount:  makerAmountBN.toString(),
      takerAssetAmount: takerAmountBN.toString(),
      makerVolumeFee: makerVolumeFeeBN.toString(),
      takerVolumeFee: takerVolumeFeeBN.toString(),
      gasFee: gasFee.toString(),
      expirationTimeSeconds: expirationTimeSeconds.toFixed(0),
      salt: (Math.random() * 123456789).toFixed(0),
    };
    
    const domain = {
      name: 'ZigZag',
      version: '3',
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

    const signer = await this.api.rollupProvider.getSigner();
    const signature = await signer._signTypedData(domain, types, Order);

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
    const exchangeAddress = this.getExchangeAddress();
    if (!exchangeAddress) throw new Error(`No exchange contract address`);

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
      exchangeAddress,
      amountBN
    );

    // update account balance
    await this.api.getBalances();
    return true;
  };

  warpETH = async (amountBN) => {
    const wethInfo = this.api.getCurrencyInfo('WETH');
    if (!wethInfo) throw new Error('No WETH contract address')

    const signer = await this.api.rollupProvider.getSigner();
    const wethContract = new ethers.Contract(
      wethInfo.address,
      wethContractABI,
      signer
    );
    await wethContract.deposit({ value: amountBN });

    // update account balance
    await this.api.getBalances();
    return true;
  };

  unWarpETH = async (amountBN) => {
    const wethInfo = this.api.getCurrencyInfo('WETH');
    if (!wethInfo) throw new Error('No WETH contract address')

    const signer = await this.api.rollupProvider.getSigner();
    const wethContract = new ethers.Contract(
      wethInfo.address,
      wethContractABI,
      signer
    );

    await wethContract.withdraw(amountBN);

    // update account balance
    await this.api.getBalances();
    return true;
  };

  getWrapFees = async () => {
    let feeData = {
      'gasPrice': ethers.BigNumber.from(2_500_000_000) // 2.5 GWEI
    };
    try {
      feeData = await this.api.rollupProvider.getFeeData()
    } catch (e) {
      console.log(`No fee data, error: ${e.message}`)
    }
    const feeResult = ethers.utils.formatEther (
      (feeData.gasPrice).mul(450_000)
    ).toString();
    return {
      'wrap': feeResult,
      'unwrap': feeResult,
    };
  }

  getExchangeAddress = () => {
    const marketInfoArray = Object.values(this.api.marketInfo);
    return marketInfoArray[0].exchangeAddress;
  }
}
