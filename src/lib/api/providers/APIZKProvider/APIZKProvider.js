import * as zksync from "zksync";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { toBaseUnit } from "lib/utils";
import APIProvider from "../APIProvider";
import axios from "axios";
import { closestPackableTransactionAmount } from "zksync";
import BatchTransferService from "./BatchTransferService";
import {
  ZKSYNC_POLYGON_BRIDGE,
  ZKSYNC_ETHEREUM_FAST_BRIDGE,
  ETH_ZKSYNC_BRIDGE,
} from "components/pages/BridgePage/constants";
import _ from "lodash";
import { formatAmount } from "lib/utils";

export default class APIZKProvider extends APIProvider {
  static SEEDS_STORAGE_KEY = "@ZZ/ZKSYNC_SEEDS";
  static VALID_SIDES = ["b", "s"];

  ethWallet = null;
  syncWallet = null;
  syncProvider = null;
  batchTransferService = null;
  zksyncCompatible = true;
  evmCompatible = false;
  _tokenWithdrawFees = {};
  _tokenInfo = {};
  eligibleFastWithdrawTokens = ["ETH", "FRAX", "UST"];
  fastWithdrawContractAddress = ZKSYNC_ETHEREUM_FAST_BRIDGE.address;
  defaultMarket = "ETH-USDC";

  handleBridgeReceipt = (
    _receipt,
    amount,
    token,
    type,
    target,
    walletAddress
  ) => {
    let receipt = {
      date: +new Date(),
      network: this.network,
      amount,
      token,
      type,
      walletAddress,
    };
    if (!_receipt) {
      return receipt;
    }
    if (target === "ethereum") {
      const subdomain = this.network === 1 ? "" : "rinkeby.";
      receipt.txId = _receipt.ethTx.hash;
      receipt.txUrl = `https://${subdomain}etherscan.io/tx/${receipt.txId}`;
    } else if (target === "zksync") {
      const subdomain = this.network === 1 ? "" : "rinkeby.";
      receipt.txId = _receipt.txHash.split(":")[1];
      receipt.txUrl = `https://${subdomain}zkscan.io/explorer/transactions/${receipt.txId}`;
    }

    return receipt;
  };

  changePubKeyFee = async (currency = "USDC") => {
    const { data } = await axios.post(
      this.getZkSyncBaseUrl(this.network) + "/fee",
      {
        txType: { ChangePubKey: "ECDSA" },
        address: "0x5364ff0cecb1d44efd9e4c7e4fe16bf5774530e3",
        tokenLike: currency,
      },
      { headers: { "Content-Type": "application/json" } }
    );
    // somehow the fee is ~50% too low
    if (currency === "USDC") return (data.result.totalFee / 10 ** 6) * 2;
    else return (data.result.totalFee / 10 ** 18) * 2;
  };

  changePubKey = async () => {
    try {
      const feeUSD = await this.changePubKeyFee();
      toast.info(
        `You need to sign a one-time transaction to activate your zksync account. The fee for this tx will be $${feeUSD.toFixed(
          2
        )}`,
        {
          toastId: `You need to sign a one-time transaction to activate your zksync account. The fee for this tx will be $${feeUSD.toFixed(
            2
          )}`,
        }
      );
    } catch (err) {
      toast.info(
        `You need to sign a one-time transaction to activate your zksync account. The fee for this tx will be ~$2.5`,
        {
          toastId: `You need to sign a one-time transaction to activate your zksync account. The fee for this tx will be ~$2.5`,
        }
      );
    }

    let feeToken = "ETH";
    const accountState = await this.syncWallet.getAccountState();
    const balances = accountState.committed.balances;
    if (balances.ETH && balances.ETH > 0.006e18) {
      feeToken = "ETH";
    } else if (balances.USDC && balances.USDC > 15e6) {
      feeToken = "USDC";
    } else if (balances.USDT && balances.USDT > 15e6) {
      feeToken = "USDT";
    } else if (balances.DAI && balances.DAI > 15e6) {
      feeToken = "DAI";
    } else if (balances.WBTC && balances.WBTC > 0.0003e8) {
      feeToken = "WBTC";
    } else {
      toast.warn(
        "Your token balances are very low. You might need to bridge in more funds first."
      );
      let maxValue = 0;
      const tokens = Object.keys(balances);
      const result = tokens.map(async (token) => {
        const tokenInfo = await this.getTokenInfo(token);
        if (tokenInfo.enabledForFees) {
          const priceInfo = await this.tokenPrice(token);
          const usdValue =
            (priceInfo.price * balances[token]) / 10 ** tokenInfo.decimals;
          if (usdValue > maxValue) {
            maxValue = usdValue;
            feeToken = token;
          }
        }
      });
      await Promise.all(result);
    }

    const signingKey = await this.syncWallet.setSigningKey({
      feeToken,
      ethAuthType: "ECDSALegacyMessage",
    });

    await signingKey.awaitReceipt();

    return signingKey;
  };

  checkAccountActivated = async () => {
    const [accountState, signingKeySet, correspondigKeySet] = await Promise.all(
      [
        this.getAccountState(),
        this.syncWallet.isSigningKeySet(),
        this.syncWallet.isCorrespondingSigningKeySet(),
      ]
    );
    return accountState.id && signingKeySet && correspondigKeySet;
  };

  submitOrder = async (
    market,
    side,
    baseAmountBN,
    quoteAmountBN,
    expirationTimeSeconds
  ) => {
    const accountActivated = await this.checkAccountActivated();
    if (!accountActivated)
      throw new Error(
        "Your zkSync account is not activated. Please use the bridge to deposit funds into zkSync and activate your zkSync wallet."
      );

    const [baseToken, quoteToken] = market.split("-");
    const marketInfo = this.api.marketInfo[market];
    const tokenRatio = {};

    let sellQuantityBN, tokenSell, tokenBuy, balanceBN;
    if (side === "s") {
      sellQuantityBN = baseAmountBN;
      tokenSell = marketInfo.baseAsset.id;
      tokenBuy = marketInfo.quoteAsset.id;
      const sellFeeBN = ethers.utils.parseUnits(
        marketInfo.baseFee.toFixed(marketInfo.baseAsset.decimals),
        marketInfo.baseAsset.decimals
      );
      sellQuantityBN = sellQuantityBN.add(sellFeeBN);
      tokenRatio[marketInfo.baseAsset.id] = baseAmountBN
        .add(sellFeeBN);
      tokenRatio[marketInfo.quoteAsset.id] = quoteAmountBN;
      balanceBN = ethers.BigNumber.from(this.api.balances[baseToken].value);
    } else {
      sellQuantityBN = quoteAmountBN;
      tokenSell = marketInfo.quoteAsset.id;
      tokenBuy = marketInfo.baseAsset.id;
      const sellFeeBN = ethers.utils.parseUnits(
        marketInfo.quoteFee.toFixed(marketInfo.quoteAsset.decimals),
        marketInfo.quoteAsset.decimals
      );
      sellQuantityBN = sellQuantityBN.add(sellFeeBN);
      tokenRatio[marketInfo.baseAsset.id] = baseAmountBN;
      tokenRatio[marketInfo.quoteAsset.id] = quoteAmountBN
        .add(sellFeeBN);
      balanceBN = ethers.BigNumber.from(this.api.balances[quoteToken].value);
    }

    // size check
    const delta = sellQuantityBN.mul("1000").div(balanceBN).toNumber();
    if (delta > 1001) {
      // 100.1 %
      throw new Error(`Amount exceeds balance.`);
    }
    if (delta > 999) {
      // 99.9 %
      sellQuantityBN = balanceBN;
    }

    tokenRatio[marketInfo.baseAsset.id] = ethers.utils.formatUnits(
      tokenRatio[marketInfo.baseAsset.id],
      marketInfo.baseAsset.decimals
    );
    tokenRatio[marketInfo.quoteAsset.id] = ethers.utils.formatUnits(
      tokenRatio[marketInfo.quoteAsset.id],
      marketInfo.quoteAsset.decimals
    );

    const packedSellQuantity =
      zksync.utils.closestPackableTransactionAmount(sellQuantityBN);
    const order = await this.syncWallet.signOrder({
      tokenSell,
      tokenBuy,
      amount: packedSellQuantity.toString(),
      ratio: zksync.utils.tokenRatio(tokenRatio),
      validUntil: expirationTimeSeconds,
    });

    // argent wallet sig change
    if (order.ethereumSignature && !order.ethSignature) {
      order.ethSignature = order.ethereumSignature;
      delete order.ethereumSignature;
    }

    this.api.send("submitorder2", [this.network, market, order]);

    return order;
  };

  getBalances = async () => {
    const account = await this.getAccountState();
    const balances = {};

    this.api.getCurrencies().forEach((ticker) => {
      const currencyInfo = this.api.getCurrencyInfo(ticker);
      const balance =
        account && account.committed
          ? account.committed.balances[ticker] || 0
          : 0;
      balances[ticker] = {
        value: balance,
        valueReadable:
          (balance && currencyInfo && balance / 10 ** currencyInfo.decimals) ||
          0,
        allowance: ethers.constants.MaxUint256,
        allowanceReadable: 9007199254740991, // max save int
      };
    });

    return balances;
  };

  getAccountState = async () => {
    return this.syncWallet ? this.syncWallet.getAccountState() : {};
  };

  depositL2 = async (amountDecimals, token = "ETH", address = "") => {
    let transfer;

    const currencyInfo = this.api.getCurrencyInfo(token);
    const amount = toBaseUnit(amountDecimals, currencyInfo.decimals);

    try {
      transfer = await this.syncWallet.depositToSyncFromEthereum({
        token,
        depositTo: this.syncWallet.address(),
        amount,
      });

      this.api.emit(
        "bridgeReceipt",
        this.handleBridgeReceipt(
          transfer,
          amountDecimals,
          token,
          ETH_ZKSYNC_BRIDGE.ethTozkSync,
          "ethereum",
          this.network === 1000
            ? `https://rinkeby.zksync.io/explorer/accounts/${address}`
            : `https://zkscan.io/explorer/accounts/${address}`
        )
      );
      return transfer;
    } catch (err) {
      console.log(err);
    }
  };

  createWithdraw = async (
    amountDecimals,
    token,
    onSameFeeToken,
    onDiffFeeToken
  ) => {
    let transfer;

    const currencyInfo = this.api.getCurrencyInfo(token);
    const amount = toBaseUnit(amountDecimals, currencyInfo.decimals);
    const packableAmount = closestPackableTransactionAmount(amount);
    const feeToken = await this.getWithdrawFeeToken(token);
    if (feeToken === token) {
      transfer = await onSameFeeToken(packableAmount);
    } else {
      transfer = await onDiffFeeToken(packableAmount, feeToken);
    }
    return { amountTransferred: amountDecimals, transfer };
  };

  withdrawL2 = async (amountDecimals, token) => {
    const onSameFeeToken = async (amount) => {
      const transfer = await this.syncWallet.withdrawFromSyncToEthereum({
        token,
        ethAddress: await this.ethWallet.getAddress(),
        amount,
      });
      await transfer.awaitReceipt();
      return transfer;
    };

    const onDiffFeeToken = async (amount, feeToken) => {
      const hashes = await this.batchTransferService.sendWithdraw(
        {
          ethAddress: await this.ethWallet.getAddress(),
          token: token,
          amount: amount,
          fee: 0,
        },
        feeToken
      );
      return { txHash: hashes[0] };
    };

    const { transfer, amountTransferred } = await this.createWithdraw(
      amountDecimals,
      token,
      onSameFeeToken,
      onDiffFeeToken
    );

    this.api.emit(
      "bridgeReceipt",
      this.handleBridgeReceipt(
        transfer,
        amountTransferred,
        token,
        "withdraw",
        "zksync"
      )
    );
    return transfer;
  };

  transferToBridge = async (amountDecimals, token, address, userAddress) => {
    if (
      (ZKSYNC_POLYGON_BRIDGE.address === address &&
        !ZKSYNC_POLYGON_BRIDGE.eligibleTokensZkSync.includes(token)) ||
      (ZKSYNC_ETHEREUM_FAST_BRIDGE.address === address &&
        !ZKSYNC_ETHEREUM_FAST_BRIDGE.eligibleTokensZkSync.includes(token))
    ) {
      throw Error("Token not supported for fast withdraw");
    }

    const onSameFeeToken = async (amount) => {
      const transfer = await this.syncWallet.syncTransfer({
        to: address,
        token,
        amount,
      });
      await transfer.awaitReceipt();
      return transfer;
    };

    const onDiffFeeToken = async (amount, feeToken) => {
      const hashes = await this.batchTransferService.sendTransfer(
        {
          to: address,
          token: token,
          amount: amount,
          fee: 0,
        },
        feeToken
      );
      return { txHash: hashes[0] };
    };

    const { transfer, amountTransferred } = await this.createWithdraw(
      amountDecimals,
      token,
      onSameFeeToken,
      onDiffFeeToken
    );

    if (ZKSYNC_POLYGON_BRIDGE.address === address) {
      this.api.emit(
        "bridgeReceipt",
        this.handleBridgeReceipt(
          transfer,
          amountTransferred,
          token,
          ZKSYNC_POLYGON_BRIDGE.zkSyncToPolygon,
          "zksync",
          this.network === 1000
            ? `https://mumbai.polygonscan.com/address/${userAddress}#tokentxns`
            : `https://polygonscan.com/address/${userAddress}#tokentxns`
        )
      );
    } else if (ZKSYNC_ETHEREUM_FAST_BRIDGE.address === address) {
      this.api.emit(
        "bridgeReceipt",
        this.handleBridgeReceipt(
          transfer,
          amountTransferred,
          token,
          ZKSYNC_ETHEREUM_FAST_BRIDGE.receiptKeyZkSync,
          "zksync",
          userAddress
        )
      );
    }
  };

  getWithdrawFeeToken = async (tokenToWithdraw) => {
    const backupFeeToken = "ETH";
    const tokenInfo = await this.getTokenInfo(tokenToWithdraw);
    return tokenInfo.enabledForFees ? tokenToWithdraw : backupFeeToken;
  };

  withdrawL2GasFee = async (token) => {
    const feeToken = await this.getWithdrawFeeToken(token);
    const currencyInfo = this.api.getCurrencyInfo(feeToken);
    if (!this._tokenWithdrawFees[token]) {
      const fee = await this.syncProvider.getTransactionFee(
        "Withdraw",
        this.syncWallet.address(),
        feeToken
      );
      const amount = parseInt(fee.totalFee) / 10 ** currencyInfo.decimals;
      this._tokenWithdrawFees[token] = { amount, feeToken };
    }
    return this._tokenWithdrawFees[token];
  };

  transferL2GasFee = async (token) => {
    const feeToken = await this.getWithdrawFeeToken(token);
    const feeCurrencyInfo = this.api.getCurrencyInfo(feeToken);
    const address = this.syncWallet.address();

    let totalFee;
    if (feeToken !== token) {
      // paying for tx fees with different tokens requires us to
      // send batch transactions. we estimate those fees here.
      totalFee = await this.syncProvider.getTransactionsBatchFee(
        ["Transfer", "Transfer"],
        [address, address],
        feeToken
      );
    } else {
      const fee = await this.syncProvider.getTransactionFee(
        "Transfer",
        address,
        token
      );
      totalFee = fee.totalFee;
    }

    const amount = parseInt(totalFee) / 10 ** feeCurrencyInfo.decimals;
    return { amount, feeToken };
  };

  withdrawL2FastBridgeFee = async (token) => {
    /*
     * Returns the fee taken by ZigZag when sending on L1. If the token is not ETH,
     * the notional amount of the ETH tx fee will be taken in the currency being bridged
     * */
    const currencyInfo = this.api.getCurrencyInfo(token);
    const getNumberFormatted = (atoms) => {
      return parseInt(atoms) / 10 ** currencyInfo.decimals;
    };

    if (this.api.rollupProvider) {
      if (
        !ZKSYNC_ETHEREUM_FAST_BRIDGE.eligibleTokensZkSync.includes(token) &&
        !ZKSYNC_POLYGON_BRIDGE.eligibleTokensZkSync.includes(token)
      ) {
        throw Error("Token not eligible for fast withdraw");
      }
      const feeData = await this.api.rollupProvider.getFeeData();
      let bridgeFee = feeData.maxFeePerGas
        .add(feeData.maxPriorityFeePerGas)
        .mul(21000);

      if (token === "ETH") {
        return getNumberFormatted(bridgeFee);
      } else if (["FRAX", "UST"].includes(token)) {
        const priceInfo = await this.tokenPrice("ETH");
        const stableFee = (
          ((bridgeFee.toString() / 1e18) *
            priceInfo.price *
            10 ** currencyInfo.decimals *
            50000) /
          21000
        ).toFixed(0);
        return getNumberFormatted(stableFee);
      }
    } else {
      throw new Error("Ethers provider not found");
    }
  };

  signIn = async () => {
    try {
      this.syncProvider = await zksync.getDefaultProvider(
        this.network === 1 ? "mainnet" : "rinkeby"
      );
    } catch (e) {
      toast.error("Zksync is down. Try again later");
      throw e;
    }

    try {
      if (this.api.isArgent) {
        this.syncWallet = await zksync.RemoteWallet.fromEthSigner(
          this.api.rollupProvider,
          this.syncProvider
        );
      } else {
        this.ethWallet = this.api.rollupProvider.getSigner();
        const { seed, ethSignatureType } = await this.getSeed(this.ethWallet);
        const syncSigner = await zksync.Signer.fromSeed(seed);
        this.syncWallet = await zksync.Wallet.fromEthSigner(
          this.ethWallet,
          this.syncProvider,
          syncSigner,
          undefined,
          ethSignatureType
        );
      }
    } catch (err) {
      console.log(err);
      throw err;
    }

    this.batchTransferService = new BatchTransferService(
      this.syncProvider,
      this.syncWallet
    );

    const [accountState, accountActivated] = await Promise.all([
      this.api.getAccountState(),
      this.checkAccountActivated(),
    ]);
    if (!accountState.id) {
      const walletBalance = formatAmount(
        accountState.committed.balances["ETH"],
        { decimals: 18 }
      );
      const activationFee = await this.changePubKeyFee("ETH");

      if (isNaN(walletBalance) || walletBalance < activationFee) {
        // toast.error(
        //   "Your zkSync account is not activated. Please use the bridge to deposit funds into zkSync and activate your zkSync wallet.",
        //   {
        //     autoClose: 60000,
        //   }
        // );
      } else {
        // toast.error(
        //   "Your zkSync account is not activated. Please activate your zkSync wallet.",
        //   {
        //     autoClose: false,
        //   }
        // );
      }
    } else {
      if (!accountActivated) {
        await this.changePubKey();
      }
    }

    return accountState;
  };

  getSeeds = () => {
    try {
      return JSON.parse(
        window.localStorage.getItem(APIZKProvider.SEEDS_STORAGE_KEY) || "{}"
      );
    } catch {
      return {};
    }
  };

  getSeedKey = async (ethSigner) => {
    return `${this.network}-${await ethSigner.getAddress()}`;
  };

  getSeed = async (ethSigner) => {
    const seedKey = await this.getSeedKey(ethSigner);
    let seeds = this.getSeeds(ethSigner);

    if (!seeds[seedKey]) {
      seeds[seedKey] = await this.genSeed(ethSigner);
      seeds[seedKey].seed = seeds[seedKey].seed
        .toString()
        .split(",")
        .map((x) => +x);
      window.localStorage.setItem(
        APIZKProvider.SEEDS_STORAGE_KEY,
        JSON.stringify(seeds)
      );
    }

    seeds[seedKey].seed = Uint8Array.from(seeds[seedKey].seed);
    return seeds[seedKey];
  };

  genSeed = async (ethSigner) => {
    let chainID = 1;
    if (ethSigner.provider) {
      const network = await ethSigner.provider.getNetwork();
      chainID = network.chainId;
    }
    let message =
      "Access zkSync account.\n\nOnly sign this message for a trusted client!";
    if (chainID !== 1) {
      message += `\nChain ID: ${chainID}.`;
    }
    const signedBytes = zksync.utils.getSignedBytesFromMessage(message, false);
    const signature = await zksync.utils.signMessagePersonalAPI(
      ethSigner,
      signedBytes
    );
    const address = await ethSigner.getAddress();
    const ethSignatureType = await zksync.utils.getEthSignatureType(
      ethSigner.provider,
      message,
      signature,
      address
    );
    const seed = ethers.utils.arrayify(signature);
    return { seed, ethSignatureType };
  };

  refreshArweaveAllocation = async (address) => {
    if (address) {
      const url =
        "https://zigzag-arweave-bridge.herokuapp.com/allocation/zksync?address=" +
        address;
      try {
        const allocation = await fetch(url).then((r) => r.json());
        const bytes = Number(allocation.remaining_bytes);
        this.api.emit("arweaveAllocationUpdate", bytes);
      } catch (e) {
        console.error(e);
      }
    } else {
      this.api.emit("arweaveAllocationUpdate", 0);
    }
  };

  purchaseArweaveBytes = async (bytes) => {
    const feeToken = "USDC";
    const feeTokenDecimals = 6;
    const BYTES_PER_DOLLAR = 10 ** 6;
    const ARWEAVE_BRIDGE_ADDRESS = "0xCb7AcA0cdEa76c5bD5946714083c559E34627607";
    const amount = (
      (bytes / BYTES_PER_DOLLAR) *
      10 ** feeTokenDecimals
    ).toString();
    return this.syncWallet.syncTransfer({
      to: ARWEAVE_BRIDGE_ADDRESS,
      token: feeToken,
      amount,
    });
  };

  signMessage = async (message) => {
    return await this.ethWallet.signMessage(message);
  };

  getZkSyncBaseUrl = (chainId) => {
    if (this.getChainName(chainId) === "mainnet") {
      return "https://api.zksync.io/api/v0.2";
    } else if (this.getChainName(chainId) === "rinkeby") {
      return "https://rinkeby-api.zksync.io/api/v0.2";
    } else {
      throw Error("Uknown chain");
    }
  };

  tokenPrice = async (tokenLike, chainId = 1) => {
    try {
      const res = await axios.get(
        this.getZkSyncBaseUrl(chainId) + `/tokens/${tokenLike}/priceIn/usd`
      );
      return res.data.result;
    } catch (e) {
      console.error("Could not get token price", e);
    }
  };

  /*
   * Gets token info from zkSync REST API
   * @param  {String} tokenLike:            Symbol or Internal ID
   * @param  {Number or String} _chainId:   Network ID to query (1 for mainnet, 1000 for rinkeby)
   * @return {Object}                       {address: string, decimals: number, enabledForFees: bool, id: number, symbol: string}
   * */
  getTokenInfo = async (tokenLike, _chainId = this.network) => {
    const chainId = _chainId.toString();
    const returnFromCache =
      this._tokenInfo[chainId] && this._tokenInfo[chainId][tokenLike];
    try {
      if (returnFromCache) {
        return this._tokenInfo[chainId][tokenLike];
      } else {
        const res = await axios.get(
          this.getZkSyncBaseUrl(chainId) + `/tokens/${tokenLike}`
        );
        this._tokenInfo[chainId] = {
          ...this._tokenInfo[chainId],
          [tokenLike]: res.data.result,
        };
        return this._tokenInfo[chainId][tokenLike];
      }
    } catch (e) {
      console.error("Could not get token info", e);
    }
  };

  getChainName = (chainId) => {
    switch (Number(chainId)) {
      case 1:
        return "mainnet";
      case 1000:
        return "rinkeby";
      default:
        throw Error("Chain ID not understood");
    }
  };

  tokenPrice = async (tokenLike, chainId = 1) => {
    try {
      const res = await axios.get(
        this.getZkSyncBaseUrl(chainId) + `/tokens/${tokenLike}/priceIn/usd`
      );
      return res.data.result;
    } catch (e) {
      console.error("Could not get token price", e);
    }
  };

  cacheMarketInfoFromNetwork = async (pairs) => {
    if (pairs.length === 0) return;
    if (!this.network) return;
    const pairText = pairs.join(",");
    const url =
      this.network === 1
        ? `https://zigzag-markets.herokuapp.com/markets?id=${pairText}&chainid=${this.network}`
        : `https://secret-thicket-93345.herokuapp.com/api/v1/marketinfos?chain_id=${this.network}&market=${pairText}`;
    const marketInfoArray = await fetch(url).then((r) => r.json());
    // if (!(marketInfoArray instanceof Array)) return;
    _.forEach(marketInfoArray, (info) => (this.marketInfo[info.alias] = info));
    // marketInfoArray.forEach((info) => (this.marketInfo[info.alias] = info));
    return;
  };

  getPairs = () => {
    return Object.keys(this.lastPrices);
  };

  getCurrencyInfo(currency) {
    const pairs = this.getPairs();
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const baseCurrency = pair.split("-")[0];
      const quoteCurrency = pair.split("-")[1];
      if (baseCurrency === currency && this.marketInfo[pair]) {
        return this.marketInfo[pair].baseAsset;
      } else if (quoteCurrency === currency && this.marketInfo[pair]) {
        return this.marketInfo[pair].quoteAsset;
      }
    }
    return null;
  }
}
