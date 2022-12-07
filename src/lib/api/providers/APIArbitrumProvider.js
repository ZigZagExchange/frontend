import { ethers, constants as ethersConstants } from "ethers";
import APIProvider from "./APIProvider";
import erc20ContractABI from "lib/contracts/ERC20.json";
import wethContractABI from "lib/contracts/WETH.json";
import { formatAmount } from "lib/utils";

export default class APIArbitrumProvider extends APIProvider {
  accountState = {};
  evmCompatible = true;
  zksyncCompatible = false;
  _tokenInfo = {};
  defaultMarket = {
    42161: "WETH-USDC",
    421613: "WBTC-DAI",
  };

  getDefaultMarket = () => {
    return this.defaultMarket[this.network] || "WETH-USDC";
  }

  getAccountState = async () => {
    return this.accountState;
  };

  getBalances = async () => {
    const balances = {};
    const getBalance = async (ticker) => {
      const currencyInfo = this.api.getCurrencyInfo(ticker);
      const { balance, allowance } = await this.getBalanceOfCurrency(currencyInfo, ticker);
      balances[ticker] = {
        value: balance,
        allowance,
        valueReadable: "0",
      };
      if (balance && currencyInfo) {
        balances[ticker].valueReadable = formatAmount(balance, currencyInfo);
        balances[ticker].allowanceReadable = formatAmount(allowance, currencyInfo);
      } else if (ticker === "ETH") {
        balances[ticker].valueReadable = formatAmount(balance, {
          decimals: 18,
        });
        balances[ticker].allowanceReadable = formatAmount(allowance, {
          decimals: 18,
        });
      }
    };

    const tickers = this.api.getCurrencies();
    // allways fetch ETH for Etherum wallet
    if (!tickers.includes("ETH")) {
      tickers.push("ETH");
    }

    await Promise.all(tickers.map((ticker) => getBalance(ticker)));

    return balances;
  }

  getBalanceOfCurrency = async (currencyInfo, currency) => {
    let result = { balance: 0, allowance: ethersConstants.Zero };
    if (!this.api.rollupProvider) return result;

    try {
      const exchangeAddress = this.getExchangeAddress();
      const account = this.accountState.address;
      if (!account || account === "0x") return result;

      if (currency === "ETH") {
        result.balance = await this.api.rollupProvider.getBalance(account);
        result.allowance = ethersConstants.MaxUint256;
        return result;
      }

      if (!currencyInfo || !currencyInfo.address) return result;

      const contract = new ethers.Contract(
        currencyInfo.address,
        erc20ContractABI,
        this.api.rollupProvider
      );
      result.balance = await contract.balanceOf(account);
      if (exchangeAddress) {
        result.allowance = ethers.BigNumber.from(
          await contract.allowance(account, exchangeAddress)
        );
      }
      return result;
    } catch (e) {
      console.log(e);
      return result;
    }
  };

  submitOrder = async (
    market,
    side,
    baseAmountBN,
    quoteAmountBN,
    expirationTimeSeconds
  ) => {
    const marketInfo = this.api.marketInfo[`${this.network}:${market}`];

    const [baseToken, quoteToken] = market.split("-");
    let sellToken, buyToken, sellAmountBN, buyAmountBN, balanceBN;
    if (side === "s") {
      sellToken = marketInfo.baseAsset.address;
      buyToken = marketInfo.quoteAsset.address;
      sellAmountBN = baseAmountBN;
      buyAmountBN = quoteAmountBN.mul(99999).div(100000);
      balanceBN = ethers.BigNumber.from(
        this.api.balances[this.network][baseToken].value
      );
    } else {
      sellToken = marketInfo.quoteAsset.address;
      buyToken = marketInfo.baseAsset.address;
      sellAmountBN = quoteAmountBN;
      buyAmountBN = baseAmountBN.mul(99999).div(100000);
      balanceBN = ethers.BigNumber.from(
        this.api.balances[this.network][quoteToken].value
      );
    }

    const makerVolumeFeeBN = sellAmountBN
      .mul(marketInfo.makerVolumeFee * 10000)
      .div(9999);

    const takerVolumeFeeBN = sellAmountBN
      .mul(marketInfo.takerVolumeFee * 10000)
      .div(9999);

    // size check
    if (makerVolumeFeeBN.gte(takerVolumeFeeBN)) {
      balanceBN = balanceBN.sub(makerVolumeFeeBN);
    } else {
      balanceBN = balanceBN.sub(takerVolumeFeeBN);
    }

    if (balanceBN.lte(0)) throw new Error(`Amount exceeds balance.`);

    const delta = sellAmountBN.mul("100000").div(balanceBN).toNumber();
    if (delta > 100100) {
      // 100.1 %
      throw new Error(`Amount exceeds balance.`);
    }
    // prevent dust issues
    if (delta > 99990) {
      // 99.9 %
      sellAmountBN = balanceBN;
      buyAmountBN = buyAmountBN.mul(100000).div(delta);
    }
    const Order = {
      user: this.accountState.address,
      sellToken,
      buyToken,
      sellAmount: sellAmountBN.toString(),
      buyAmount: buyAmountBN.toString(),
      expirationTimeSeconds: expirationTimeSeconds.toFixed(0),
    };

    const domain = {
      name: "ZigZag",
      version: marketInfo.contractVersion.toString(),
      chainId: this.network,
      verifyingContract: marketInfo.exchangeAddress,
    };

    const types = {
      Order: [
        { name: "user", type: "address" },
        { name: "sellToken", type: "address" },
        { name: "buyToken", type: "address" },
        { name: "sellAmount", type: "uint256" },
        { name: "buyAmount", type: "uint256" },
        { name: "expirationTimeSeconds", type: "uint256" },
      ],
    };

    const signer = await this.api.rollupProvider.getSigner();
    const signature = await signer._signTypedData(domain, types, Order);

    Order.signature = signature;
    this.api.send("submitorder3", [this.network, market, Order]);
    return Order;
  };

  signIn = async () => {
    console.log("signing in to arbitrum");
    const address = await this.api.rollupProvider.getSigner().getAddress();
    const balances = await this.getBalances();
    this.accountState = {
      id: address,
      address,
      committed: {
        balances,
      },
    };

    return this.accountState;
  };

  approveExchangeContract = async (token, amount) => {
    const exchangeAddress = this.getExchangeAddress();
    if (!exchangeAddress) throw new Error(`No exchange contract address`);

    const currencyInfo = this.api.getCurrencyInfo(token);
    if (!currencyInfo.address)
      throw new Error(`ERC20 address for ${token} not found`);

    let amountBN;
    if (!amount) {
      amountBN = ethers.constants.MaxUint256;
    } else {
      amountBN = ethers.utils.parseUnits(
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

    const tx = await erc20Contract.approve(exchangeAddress, amountBN);
    const { status } = await tx.wait();

    // update account balance
    if (status) this.api.getBalances();

    return status;
  };

  warpETH = async (amountBN) => {
    const wethInfo = this.api.getCurrencyInfo("WETH");
    if (!wethInfo) throw new Error("No WETH contract address");

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
    const wethInfo = this.api.getCurrencyInfo("WETH");
    if (!wethInfo) throw new Error("No WETH contract address");

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
      gasPrice: ethers.BigNumber.from(2_500_000_000), // 2.5 GWEI
    };
    try {
      feeData = await this.api.rollupProvider.getFeeData();
    } catch (e) {
      console.log(`No fee data, error: ${e.message}`);
    }
    const feeResult = ethers.utils
      .formatEther(feeData.gasPrice.mul(450_000))
      .toString();
    return {
      wrap: feeResult,
      unwrap: feeResult,
    };
  };

  getExchangeAddress = () => {
    const marketInfo = this.api.marketInfo[`${this.network}:${this.defaultMarket[this.network]}`];
    return marketInfo?.exchangeAddress;
  };

  signMessage = async (message) => {
    const signer = await this.api.rollupProvider.getSigner();
    return await signer.signMessage(message);
  };
}
