import Web3 from "web3";
import { createIcon } from "@download/blockies";
import Web3Modal from "web3modal";
import Emitter from "tiny-emitter";
import { ethers, constants as ethersConstants } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { getENSName } from "lib/ens";
import { formatAmount } from "lib/utils";
import erc20ContractABI from "lib/contracts/ERC20.json";
import wethContractABI from "lib/contracts/WETH.json";
import { MAX_ALLOWANCE } from "./constants";
import { toast } from "react-toastify";
import {
  ZKSYNC_POLYGON_BRIDGE,
  POLYGON_MUMBAI_WETH_ADDRESS,
  POLYGON_MAINNET_WETH_ADDRESS,
} from "components/pages/BridgePage/constants";

import axios from "axios";
import { isMobile } from "react-device-detect";
import get from "lodash/get";

const chainMap = {
  "0x1": 1,
  "0x5": 1002,
  "0xa4b1": 42161,
};

export default class API extends Emitter {
  networks = {};
  ws = null;
  apiProvider = null;
  mainnetProvider = null;
  rollupProvider = null;
  currencies = null;
  isArgent = false;
  marketInfo = {};
  lastPrices = {};
  balances = {};
  _signInProgress = null;
  _profiles = {};
  _pendingOrders = [];
  _pendingFills = [];
  serverDelta = 0;

  constructor({ infuraId, networks, currencies, validMarkets }) {
    super();

    if (networks) {
      Object.keys(networks).forEach((k) => {
        this.networks[k] = [
          networks[k][0],
          new networks[k][1](this, networks[k][0]),
          networks[k][2],
        ];
      });
    }

    this.infuraId = infuraId;
    this.currencies = currencies;
    this.validMarkets = validMarkets;

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", this.signOut);
      window.ethereum.on("chainChanged", (chainId) => {
        this.signOut().then(() => {
          this.setAPIProvider(chainMap[chainId]);
        });
      });

      this.setAPIProvider(chainMap[window.ethereum.chainId] || 1);
    } else {
      console.log(this.networks);
      this.setAPIProvider(this.networks.zksync[0]);
    }
  }

  getAPIProvider = (network) => {
    return this.networks[this.getNetworkName(network)][1];
  };

  setAPIProvider = (network, networkChanged = true) => {
    const chainName = this.getChainName(network);

    if (!chainName) {
      console.error(`Can't get chainName for ${network}`);
      this.signOut();
      return;
    }
    const oldNetwork = this.apiProvider?.network;
    const apiProvider = this.getAPIProvider(network);
    this.apiProvider = apiProvider;

    // Change WebSocket if necessary
    if (this.ws) {
      const oldUrl = new URL(this.ws.url);
      const newUrl = new URL(this.apiProvider.websocketUrl);
      if (oldUrl.host !== newUrl.host) {
        // Stopping the WebSocket will trigger an auto-restart in 3 seconds
        this.start();
      }
      if (oldNetwork !== this.apiProvider.network) {
        // get initial marketinfos, returns lastprice and marketinfo2
        this.send("marketsreq", [this.apiProvider.network, true]);
      }
    }

    this.web3 = new Web3(
      window.ethereum ||
        new Web3.providers.HttpProvider(
          `https://${chainName}.infura.io/v3/${this.infuraId}`
        )
    );

    if (chainName === "arbitrum") {
      this.web3Modal = new Web3Modal({
        network: chainName,
        cacheProvider: true,
        theme: "dark",
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              rpc: {
              42161: `https://arbitrum-mainnet.infura.io/v3/${this.infuraId}`,
              },
              infuraId: this.infuraId,
            },
          },
        },
      });
    } else {
      this.web3Modal = new Web3Modal({
        network: chainName,
        cacheProvider: true,
        theme: "dark",
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              infuraId: this.infuraId,
            },
          },
          "custom-argent": {
            display: {
              logo: "https://images.prismic.io/argentwebsite/313db37e-055d-42ee-9476-a92bda64e61d_logo.svg?auto=format%2Ccompress&fit=max&q=50",
              name: "Argent zkSync",
              description: "Connect to your Argent zkSync wallet",
            },
            package: WalletConnectProvider,
            options: {
              infuraId: this.infuraId,
            },
            connector: async (ProviderPackage, options) => {
              const provider = new ProviderPackage(options);
              await provider.enable();
              this.isArgent = true;
              return provider;
            },
          },
        },
      });
    }

    this.getAccountState().catch((err) => {
      console.log("Failed to switch providers", err);
    });

    if (networkChanged) this.emit("providerChange", network);
  };

  getProfile = async (address) => {
    const getProfileFromIPFS = async (address) => {
      try {
        const { data } = await axios.get(
          `https://ipfs.3box.io/profile?address=${address}`
        );
        const profile = {
          coverPhoto: get(data, "coverPhoto.0.contentUrl./"),
          image: get(data, "image.0.contentUrl./"),
          description: data.description,
          emoji: data.emoji,
          website: data.website,
          location: data.location,
          twitter_proof: data.twitter_proof,
        };

        if (data.name) {
          profile.name = data.name;
        }
        if (profile.image) {
          profile.image = `https://gateway.ipfs.io/ipfs/${profile.image}`;
        }

        return profile;
      } catch (err) {
        if (!err.response) {
          throw err;
        }
      }
      return {};
    };

    const fetchENSName = async (address) => {
      let name = await getENSName(address);
      if (name) return { name };
      return {};
    };

    if (!this._profiles[address]) {
      const profile = (this._profiles[address] = {
        description: null,
        website: null,
        image: null,
        address,
      });

      if (!address) {
        return profile;
      }

      profile.name = `${address.substr(0, 6)}…${address.substr(-6)}`;
      Object.assign(
        profile,
        ...(await Promise.all([
          fetchENSName(address),
          getProfileFromIPFS(address),
        ]))
      );

      if (!profile.image) {
        profile.image = createIcon({ seed: address }).toDataURL();
      }
    }

    return this._profiles[address];
  };

  _socketOpen = () => {
    this.emit("open");

    // get initial marketinfos, returns lastprice and marketinfo2
    this.send("marketsreq", [this.apiProvider.network, true]);
  };

  _socketClose = () => {
    console.warn("Websocket dropped. Restarting");
    this.ws = null;
    setTimeout(() => {
      this.start();
    }, 3000);
    this.emit("close");
  };

  _socketMsg = (e) => {
    if (!e.data && e.data.length <= 0) return;
    const msg = JSON.parse(e.data);
    this.emit("message", msg.op, msg.args);

    // Is there a better way to do this? Not sure.
    if (msg.op === "marketinfo") {
      const marketInfo = msg.args[0];
      if (!marketInfo) return;
      this.marketInfo[`${marketInfo.zigzagChainId}:${marketInfo.alias}`] = marketInfo;
    }
    if (msg.op === "marketinfo2") {
      const marketInfos = msg.args[0];
      marketInfos.forEach((marketInfo) => {
        if (!marketInfo) return;
        this.marketInfo[`${marketInfo.zigzagChainId}:${marketInfo.alias}`] = marketInfo;
      });
    }
    if (msg.op === "lastprice") {
      const lastPricesUpdate = msg.args[0];
      const chainId = msg.args[1];
      lastPricesUpdate.forEach((l) => {
        if (!this.lastPrices[chainId]) this.lastPrices[chainId] = {};
        this.lastPrices[chainId][l[0]] = l
      });
    }
  };

  refreshNetwork = async () => {
    if (!window.ethereum) return;
    let ethereumChainId, ethereumChainInfo;

    // await this.signOut();

    switch (this.apiProvider.network) {
      case 1:
        ethereumChainId = "0x1";
        ethereumChainInfo = {
          chainId: "0x1",
        };
        break;
      case 1002:
        ethereumChainId = "0x5";
        ethereumChainInfo = {
          chainId: "0x5",
        };
        break;
      case 42161:
        ethereumChainId = "0xa4b1";
        ethereumChainInfo = {
          chainId: "0xA4B1",
          chainName: "Arbitrum",
          nativeCurrency: {
            name: "Arbitrum Coin",
            symbol: "ETH",
            decimals: 18,
          },
          rpcUrls: ["https://arb1.arbitrum.io/rpc"],
          blockExplorerUrls: ["https://arbiscan.io/"],
        };
        break;
      default:
        return;
    }

    await window.ethereum.request({
      method: "eth_requestAccounts",
      params: [{ eth_accounts: {} }],
    });

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ethereumChainId }],
      });
    } catch (switchError) {
      try {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [ethereumChainInfo],
          });
        }
      } catch (addError) {
        console.error(addError);
        throw addError;
      }
    }
  };

  _socketError = (e) => {
    console.log(e)
    console.warn("Zigzag websocket connection failed");
  };

  calculateServerDelta = async () => {
    const url = (this.apiProvider.websocketUrl).replace('wss','https');
    let serverTime, res;
    try {
      res = await axios.get(`${url}/api/v1/time`);
      serverTime = res.data.serverTimestamp;
    } catch (e) {
      console.log(e);
      console.log(res);
      serverTime = Date.now();
    }
    const clientTime = Date.now();
    this.serverDelta = Math.floor((serverTime - clientTime) / 1000);
    if (this.serverDelta < -5 || this.serverDelta > 5) {
      console.warn(`Your PC clock is not synced (delta: ${
        this.serverDelta / 60
        } min). Please sync it via settings > date/time > sync now`);
    }
  }

  start = () => {
    if (this.ws) this.stop();
    this.ws = new WebSocket(this.apiProvider.websocketUrl);
    this.ws.addEventListener("open", this._socketOpen);
    this.ws.addEventListener("close", this._socketClose);
    this.ws.addEventListener("message", this._socketMsg);
    this.ws.addEventListener("error", this._socketError);
    this.emit("start");

    // login after reconnect
    const accountState = this.getAccountState();
    if (accountState && accountState.id) {
      this.send("login", [
        this.apiProvider.network,
        accountState.id && accountState.id.toString(),
      ]);
    }

    if(!this.serverDelta) this.calculateServerDelta();    
  };

  stop = () => {
    if (!this.ws) return;
    this.ws.close();
    this.emit("stop");
  };

  getAccountState = async () => {
    const accountState = { ...(await this.apiProvider.getAccountState()) };
    accountState.profile = await this.getProfile(accountState.address);
    this.emit("accountState", accountState);
    return accountState;
  };

  send = (op, args) => {
    if (!this.ws) return;
    if (this.ws.readyState === 1) {
      return this.ws.send(JSON.stringify({ op, args }));
    } else {
      setTimeout(this.send, 500, op, args);
    }
  };

  sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  signIn = async (network, ...args) => {
    if (!this._signInProgress) {
      this._signInProgress = Promise.resolve()
        .then(async () => {
          if (network) {
            this.apiProvider = this.getAPIProvider(network);
          }

          await this.refreshNetwork();
          await this.sleep(1000);
          const web3Provider = await this.web3Modal.connect();
          this.web3.setProvider(web3Provider);
          this.rollupProvider = new ethers.providers.Web3Provider(web3Provider);

          this.mainnetProvider = new ethers.providers.InfuraProvider(
            this.getChainNameL1(network),
            this.infuraId
          );

          // set up polygon providers. mumbai for testnet. polygon for mainnet
          this.polygonProvider = new ethers.providers.JsonRpcProvider(
            this.getPolygonUrl(network)
          );

          let accountState;
          try {
            accountState = await this.apiProvider.signIn(...args);
          } catch (err) {
            await this.signOut();
            throw err;
          }

          if (accountState.err === 4001) {
            await this.signOut();
            return;
          }

          try {
            accountState.profile = await this.getProfile(accountState.address);
          } catch (e) {
            accountState.profile = {};
          }

          this.emit("signIn", accountState);

          if (accountState && accountState.id) {
            this.send("login", [
              network,
              accountState.id && accountState.id.toString(),
            ]);
          }

          // fetch blances
          await this.getBalances();
          await this.getWalletBalances();
          await this.getPolygonWethBalance();

          return accountState;
        })
        .finally(() => {
          this._signInProgress = null;
        });
    }

    return this._signInProgress;
  };

  signOut = async (clearCatch = false) => {
    if (!this.apiProvider) {
      return;
    } else if (this.web3Modal && clearCatch) {
      this.web3Modal.clearCachedProvider();
    }

    if (isMobile) window.localStorage.clear();
    else window.localStorage.removeItem("walletconnect");

    this.balances = {};
    this._profiles = {};
    this._pendingOrders = [];
    this._pendingFills = [];

    this.web3 = null;
    this.web3Modal = null;
    this.rollupProvider = null;
    this.mainnetProvider = null;
    this.isArgent = false;
    this.setAPIProvider(this.apiProvider.network, false);
    this.emit("balanceUpdate", "wallet", {});
    this.emit("balanceUpdate", this.apiProvider.network, {});
    this.emit("balanceUpdate", "polygon", {});
    this.emit("accountState", {});
    this.emit("signOut");
  };

  getPolygonUrl(network) {
    switch (network) {
      case 1:
      case 42161:
        return `https://polygon-mainnet.infura.io/v3/${this.infuraId}`;
      case 1002:
        return `https://polygon-mumbai.infura.io/v3/${this.infuraId}`;
      default:
        throw new Error(`getPolygonUrl network: ${network} not understood.`);
    }
  }

  getPolygonChainId(network) {
    switch (network) {
      case 1:
      case 42161:
        return "0x89";
      case 1002:
        return "0x13881";
      default:
        throw new Error(
          `getPolygonChainId network: ${network} not understood.`
        );
    }
  }

  getPolygonWethContract(network) {
    switch (network) {
      case 1:
      case 42161:
        return POLYGON_MAINNET_WETH_ADDRESS;
      case 1002:
        return POLYGON_MUMBAI_WETH_ADDRESS;
      default:
        throw new Error(
          `getPolygonWethContract network: ${network} not understood.`
        );
    }
  }

  getPolygonWethBalance = async () => {
    const [account] = await this.web3.eth.getAccounts();
    if (!account) return;
    const polygonEthAddress = this.getPolygonWethContract(
      this.apiProvider.network
    );
    if (!this.polygonProvider) return 0;
    if (!polygonEthAddress) return 0;

    const ethContract = new ethers.Contract(
      polygonEthAddress,
      erc20ContractABI,
      this.polygonProvider
    );
    const wethBalance = await ethContract.balanceOf(account);
    let p = formatAmount(wethBalance, { decimals: 18 });

    this.emit("balanceUpdate", "polygon", {
      WETH: {
        value: wethBalance.toString(),
        allowance: wethBalance,
        valueReadable: p,
      },
    });
    return wethBalance;
  };

  transferPolygonWeth = async (amount, walletAddress) => {
    let networkSwitched = false;
    this.emit("bridge_connecting", true);
    try {
      const polygonChainId = this.getPolygonChainId(this.apiProvider.network);
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: polygonChainId }],
      });
      const polygonProvider = new ethers.providers.Web3Provider(
        window.web3.currentProvider
      );

      networkSwitched = true;

      const wethContractAddress = this.getPolygonWethContract(
        this.apiProvider.network
      );

      const contract = new this.web3.eth.Contract(
        wethContractABI,
        wethContractAddress
      );
      // contract.connect(signer);
      const [account] = await this.web3.eth.getAccounts();
      const result = await contract.methods
        .transfer(
          ZKSYNC_POLYGON_BRIDGE.address,
          "" + Math.round(amount * 10 ** 18)
        )
        .send({
          from: account,
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
        });

      const txHash = result.transactionHash;

      let receipt = {
        date: +new Date(),
        network: await polygonProvider.getNetwork(),
        amount,
        token: "WETH",
        type: ZKSYNC_POLYGON_BRIDGE.polygonToZkSync,
        txId: txHash,
        walletAddress:
          polygonChainId === "0x13881"
            ? `https://rinkeby.zksync.io/explorer/accounts/${walletAddress}`
            : `https://zkscan.io/explorer/accounts/${walletAddress}`,
      };
      const subdomain = polygonChainId === "0x13881" ? "mumbai." : "";
      receipt.txUrl = `https://${subdomain}polygonscan.com/tx/${txHash}`;
      this.emit("bridgeReceipt", receipt);

      await this.signIn(this.apiProvider.network);
      this.emit("bridge_connecting", false);
    } catch (e) {
      if (networkSwitched) await this.signIn(this.apiProvider.network);
      this.emit("bridge_connecting", false);
      throw e;
    }
  };

  getNetworkName = (network) => {
    const keys = Object.keys(this.networks);
    return keys[keys.findIndex((key) => network === this.networks[key][0])];
  };

  getChainName = (chainId) => {
    switch (chainId) {
      case 1:
        return "mainnet";
      case 1002:
        return "goerli";
      case 42161:
        return "arbitrum";
      default:
        return null;
    }
  };

  getChainNameL1 = (chainId) => {
    switch (chainId) {
      case 1:
      case 42161:
        return "mainnet";
      case 1002:
        return "goerli";
      default:
        return null;
    }
  };

  getChainIdFromName = (name) => {
    return this.networks?.[name]?.[0];
  };

  getNetworkDisplayName = (network) => {
    switch (network) {
      case 1:
      case 1002:
        return "zkSync";
      case 42161:
        return "Arbitrum";
      default:
        return "ZigZag";
    }
  };

  subscribeToMarket = (market, showNightPriceChange = false) => {
    this.send("subscribemarket", [
      this.apiProvider.network,
      market,
      showNightPriceChange,
    ]);
  };

  unsubscribeToMarket = (market) => {
    this.send("unsubscribemarket", [this.apiProvider.network, market]);
  };

  isZksyncChain = () => {
    return !!this.apiProvider.zksyncCompatible;
  };

  isEVMChain = () => {
    return !!this.apiProvider.evmCompatible;
  };

  cancelOrder = async (orderId) => {
    const token = localStorage.getItem(orderId);
    // token is used to cancel the order - otherwiese the user is asked to sign a msg
    if (token) {
      await this.send("cancelorder3", [this.apiProvider.network, orderId, token]);
    } else {
      const toastMsg = toast.info('Sign the message to cancel your order...', {
        toastId: "Sign the message to cancel your order...'",
      });

      const message = `cancelorder2:${this.apiProvider.network}:${orderId}`
      const signedMessage = await this.apiProvider.signMessage(message);
      try {
        await this.send("cancelorder2", [this.apiProvider.network, orderId, signedMessage]);
      } finally {
        toast.dismiss(toastMsg);
      }
    }
    
    return true;
  };

  depositL2 = async (amount, token, address) => {
    return this.apiProvider.depositL2(amount, token, address);
  };

  getPolygonFee = async () => {
    const res = await axios.get("https://gasstation-mainnet.matic.network/v2");
    return res.data;
  };

  getEthereumFee = async () => {
    if (this.mainnetProvider) {
      const feeData = await this.mainnetProvider.getFeeData();
      return feeData;
    }
  };

  withdrawL2 = async (amount, token) => {
    return this.apiProvider.withdrawL2(amount, token);
  };

  transferToBridge = (amount, token, address, userAddress) => {
    return this.apiProvider.transferToBridge(
      amount,
      token,
      address,
      userAddress
    );
  };

  depositL2Fee = async (token) => {
    return await this.apiProvider.depositL2Fee(token);
  };

  withdrawL2GasFee = async (token) => {
    try {
      return await this.apiProvider.withdrawL2GasFee(token);
    } catch (err) {
      console.log(err);
      return { amount: 0, feeToken: "ETH" };
    }
  };

  transferL2GasFee = async (token) => {
    try {
      return await this.apiProvider.transferL2GasFee(token);
    } catch (err) {
      console.log(err);
      return { amount: 0, feeToken: "ETH" };
    }
  };

  withdrawL2FastBridgeFee = async (token) => {
    try {
      return await this.apiProvider.withdrawL2FastBridgeFee(token);
    } catch (err) {
      console.log(err);
      return 0;
    }
  };

  cancelAllOrders = async (orderIds) => {
    const { id: userId } = await this.getAccountState();
    const tokenArray = [];
    orderIds.forEach(id => {
      const token = localStorage.getItem(id);
      if (token) tokenArray.push(token);
    })
    if (orderIds.length === tokenArray.length) {
      await this.send("cancelall3", [this.apiProvider.network, userId, tokenArray]);
    } else {
      const toastMsg = toast.info('Sign the message to cancel your order...', {
        toastId: "Sign the message to cancel your order...'",
      });
      const validUntil = Math.floor(Date.now() / 1000) + 10;
      const message = `cancelall2:${this.apiProvider.network}:${validUntil}`
      const signedMessage = await this.apiProvider.signMessage(message);
      try {
        await this.send("cancelall2", [this.apiProvider.network, userId, validUntil, signedMessage]);
      } finally {
        toast.dismiss(toastMsg);
      }
    }

    return true;
  };

  cancelAllOrdersAllChains = async () => {
    const toastMsg = toast.info('Sign the message to cancel your order...', {
      toastId: "Sign the message to cancel your order...'",
    });

    const validUntil = (Date.now() / 1000) + 10;
    const message = `cancelall2:0:${validUntil}`
    const signedMessage = await this.apiProvider.signMessage(message);
    const { id: userId } = await this.getAccountState();
    try {
      await this.send("cancelall2", [0, userId, signedMessage]);
    } finally {
      toast.dismiss(toastMsg);
    }
    return true;
  };

  isImplemented = (method) => {
    return this.apiProvider[method] && !this.apiProvider[method].notImplemented;
  };

  getNetworkContract = () => {
    return this.networks[this.getNetworkName(this.apiProvider.network)][2];
  };

  approveSpendOfCurrency = async (currency) => {
    const netContract = this.getNetworkContract();
    if (netContract) {
      const [account] = await this.web3.eth.getAccounts();
      const currencyInfo = this.getCurrencyInfo(currency);
      const contract = new this.web3.eth.Contract(
        erc20ContractABI,
        currencyInfo.address
      );
      await contract.methods
        .approve(netContract, MAX_ALLOWANCE)
        .send({ from: account });

      // update allowances after successfull approve
      this.getWalletBalances();
    }
  };

  getBalanceOfCurrency = async (currency) => {
    const currencyInfo = this.getCurrencyInfo(currency);
    let result = { balance: 0, allowance: ethersConstants.Zero };
    if (!this.mainnetProvider) return result;

    try {
      const netContract = this.getNetworkContract();
      const [account] = await this.web3.eth.getAccounts();
      if (!account || account === "0x") return result;

      if (currency === "ETH") {
        result.balance = await this.mainnetProvider.getBalance(account);
        result.allowance = ethersConstants.MaxUint256;
        return result;
      }

      if (!currencyInfo || !currencyInfo.address) return result;

      const contract = new ethers.Contract(
        currencyInfo.address,
        erc20ContractABI,
        this.mainnetProvider
      );
      result.balance = await contract.balanceOf(account);
      if (netContract) {
        result.allowance = ethers.BigNumber.from(
          await contract.allowance(account, netContract)
        );
      }
      return result;
    } catch (e) {
      console.log(e);
      return result;
    }
  };

  getWalletBalances = async () => {
    const balances = {};

    const getBalance = async (ticker) => {
      const currencyInfo = this.getCurrencyInfo(ticker);
      const { balance, allowance } = await this.getBalanceOfCurrency(ticker);
      balances[ticker] = {
        value: balance,
        allowance,
        valueReadable: "0",
      };
      if (balance && currencyInfo) {
        balances[ticker].valueReadable = formatAmount(balance, currencyInfo);
      } else if (ticker === "ETH") {
        balances[ticker].valueReadable = formatAmount(balance, {
          decimals: 18,
        });
      }

      this.emit("balanceUpdate", "wallet", { ...balances });
    };

    const tickers = this.getCurrencies();
    // allways fetch ETH for Etherum wallet
    if (!tickers.includes("ETH")) {
      tickers.push("ETH");
    }

    await Promise.all(tickers.map((ticker) => getBalance(ticker)));

    return balances;
  };

  getBalances = async () => {
    const balances = await this.apiProvider.getBalances();
    this.balances[this.apiProvider.network] = balances;
    this.emit("balanceUpdate", this.apiProvider.network, balances);
    return balances;
  };

  getOrderDetailsWithoutFee = (order) => {
    const side = order[3];
    const baseQuantity = order[5];
    const quoteQuantity = order[4] * order[5];
    const remaining = Number(order[11]) !== null ? order[5] : order[11];
    const market = order[2];
    const marketInfo = this.marketInfo[`${this.apiProvider.network}:${market}`];
    let baseQuantityWithoutFee,
      quoteQuantityWithoutFee,
      priceWithoutFee,
      remainingWithoutFee;
    if (side === "s") {
      const fee = marketInfo ? marketInfo.baseFee : 0;
      baseQuantityWithoutFee = baseQuantity - fee;
      remainingWithoutFee = Math.max(0, remaining - fee);
      priceWithoutFee = quoteQuantity / baseQuantityWithoutFee;
      quoteQuantityWithoutFee = priceWithoutFee * baseQuantityWithoutFee;
    } else {
      const fee = marketInfo ? marketInfo.quoteFee : 0;
      quoteQuantityWithoutFee = quoteQuantity - fee;
      priceWithoutFee = quoteQuantityWithoutFee / baseQuantity;
      baseQuantityWithoutFee = quoteQuantityWithoutFee / priceWithoutFee;
      remainingWithoutFee = Math.min(baseQuantityWithoutFee, remaining);
    }
    return {
      price: priceWithoutFee,
      quoteQuantity: quoteQuantityWithoutFee,
      baseQuantity: baseQuantityWithoutFee,
      remaining: remainingWithoutFee,
    };
  };

  submitOrder = async (market, side, baseAmount, quoteAmount, orderType) => {
    if (!quoteAmount || !baseAmount) {
      throw new Error("Set base or quote amount");
    }

    const marketInfo = this.marketInfo[`${this.apiProvider.network}:${market}`];
    let baseAmountBN = ethers.utils.parseUnits(
      Number(baseAmount).toFixed(marketInfo.baseAsset.decimals),
      marketInfo.baseAsset.decimals
    );
    let quoteAmountBN = ethers.utils.parseUnits(
      Number(quoteAmount).toFixed(marketInfo.quoteAsset.decimals),
      marketInfo.quoteAsset.decimals
    );

    const expirationTimeSeconds = orderType === "market"
      ? Date.now() / 1000 + 60 * 2 // two minutes
      : Date.now() / 1000 + 60 * 60 * 24 * 7; // one week
    

    await this.apiProvider.submitOrder(
      market,
      side,
      baseAmountBN,
      quoteAmountBN,
      Math.floor(expirationTimeSeconds + this.serverDelta)
    );
  };

  calculatePriceFromLiquidity = (quantity, spotPrice, side, liquidity) => {
    //let availableLiquidity;
    //if (side === 's') {
    //    availableLiquidity = liquidity.filter(l => (['d','s']).includes(l[2]));
    //} else if (side === 'b') {
    //    availableLiquidity = liquidity.filter(l => (['d','b']).includes(l[2]));
    //}
    //availableLiquidity.sort((a,b) => a[1] - b[1]);
    //const avgSpread = 0;
    //for (let i in availableLiquidity) {
    //    const spread = availableLiquidity[2];
    //    const amount = availableLiquidity[2];
    //}
  };

  refreshArweaveAllocation = async (address) => {
    return this.apiProvider.refreshArweaveAllocation(address);
  };

  purchaseArweaveBytes = (bytes) => {
    return this.apiProvider.purchaseArweaveBytes(bytes);
  };

  signMessage = async (message) => {
    return this.apiProvider.signMessage(message);
  };

  approveExchangeContract = async (token, amount) => {
    return this.apiProvider.approveExchangeContract(token, amount);
  };

  checkAccountActivated = async () => {
    if (!this.apiProvider.isZksyncChain) return true;
    return this.apiProvider.checkAccountActivated();
  };

  warpETH = async (amount) => {
    if (!amount) throw new Error("No amount set");
    let amountBN = ethers.utils.parseEther(amount.toFixed(18));

    return this.apiProvider.warpETH(amountBN);
  };

  unWarpETH = async (amount) => {
    if (!amount) throw new Error("No amount set");
    let amountBN = ethers.utils.parseEther(amount.toFixed(18));

    return this.apiProvider.unWarpETH(amountBN);
  };

  getWrapFees = async () => {
    return this.apiProvider.getWrapFees();
  };

  uploadArweaveFile = async (sender, timestamp, signature, file) => {
    const formData = new FormData();
    formData.append("sender", sender);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("file", file);

    const url = "https://zigzag-arweave-bridge.herokuapp.com/arweave/upload";
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    }).then((r) => r.json());
    return response;
  };

  getTokenInfo = (tokenLike, chainId) => {
    return this.apiProvider.getTokenInfo(tokenLike, chainId);
  };

  getTokenPrice = (tokenLike, chainId) => {
    return this.apiProvider.tokenPrice(tokenLike, chainId);
  };

  getCurrencyLogo(currency) {
    try {
      return require(`assets/images/currency/${currency}.svg`).default;
    } catch (e) {
      try {
        return require(`assets/images/currency/${currency}.png`).default;
      } catch (e) {
        try {
          return require(`assets/images/currency/${currency}.webp`).default;
        } catch (e) {
          return require(`assets/images/currency/ZZ.webp`).default;
        }
      }
    }
  }

  get fastWithdrawTokenAddresses() {
    if (this.apiProvider.network === 1) {
      return {
        FRAX: "0x853d955aCEf822Db058eb8505911ED77F175b99e",
        UST: "0xa693b19d2931d498c5b318df961919bb4aee87a5",
      };
    } else if (this.apiProvider.network === 1002) {
      return {
        // these are just tokens on rinkeby with the correct tickers.
        // neither are actually on rinkeby.
        FRAX: "0x6426e27d8c6fDCd1e0c165d0D58c7eC0ef51f3a7",
        UST: "0x2fd4e2b5340b7a29feb6ce737bc82bc4b3eefdb4",
      };
    } else {
      throw Error("Network unknown");
    }
  }

  async getL2FastWithdrawLiquidity() {
    if (this.mainnetProvider) {
      const currencyMaxes = {};
      if (!this.apiProvider.eligibleFastWithdrawTokens) return currencyMaxes;
      for (const currency of this.apiProvider.eligibleFastWithdrawTokens) {
        let max = 0;
        try {
          if (currency === "ETH") {
            max = await this.mainnetProvider.getBalance(
              this.apiProvider.fastWithdrawContractAddress
            );
          } else {
            const contract = new ethers.Contract(
              this.fastWithdrawTokenAddresses[currency],
              erc20ContractABI,
              this.mainnetProvider
            );
            max = await contract.balanceOf(
              this.apiProvider.fastWithdrawContractAddress
            );
          }
        } catch (e) {
          console.error(e);
        }
        const currencyInfo = this.getCurrencyInfo(currency);
        if (!currencyInfo) {
          return {};
        }
        currencyMaxes[currency] = max / 10 ** currencyInfo.decimals;
      }
      return currencyMaxes;
    } else {
      console.error("Ethers provider null or undefined");
      return {};
    }
  }

  updatePendingOrders = (userOrders) => {
    Object.keys(userOrders).forEach((orderId) => {
      const orderStatus = userOrders[orderId][9];
      if (["b", "m", "pm"].includes(orderStatus)) {
        // _pendingOrders is used to only request on the 2nd time
        const index = this._pendingOrders.indexOf(orderId);
        if (index > -1) {
          this._pendingOrders.splice(index, 1);
          // request status update
          this.send("orderreceiptreq", [
            this.apiProvider.network,
            Number(orderId),
          ]);
        } else {
          this._pendingOrders.push(orderId);
        }
      }
    });
  };

  updatePendingFills = (userFills) => {
    const fillRequestIds = [];
    Object.keys(userFills).forEach((fillId) => {
      if (!fillId) return;

      const fillStatus = userFills[fillId][6];
      if (["b", "m", "pm"].includes(fillStatus)) {
        // _pendingFills is used to only request on the 2nd time
        const index = this._pendingFills.indexOf(fillId);
        if (index > -1) {
          this._pendingFills.splice(index, 1);
          fillRequestIds.push(fillId);
        } else {
          this._pendingFills.push(fillId);
        }
      }
    });
    // request status update
    if (fillRequestIds.length > 0) {
      for (let i in fillRequestIds) {
        this.send("fillreceiptreq", [
          this.apiProvider.network,
          Number(fillRequestIds[i]),
        ]);
      }
    }
  };

  getPairs = (chainId = this.apiProvider.network) => {
    if (!this.lastPrices[chainId]) return [];
    return Object.keys(this.lastPrices[chainId]);
  };

  getCurrencyInfo = (currency) => {
    const pairs = this.getPairs();
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const marketInfo = this.marketInfo[`${this.apiProvider.network}:${pair}`]
      const baseCurrency = pair.split("-")[0];
      const quoteCurrency = pair.split("-")[1];
      if (baseCurrency === currency && marketInfo) {
        return marketInfo.baseAsset;
      } else if (quoteCurrency === currency && marketInfo) {
        return marketInfo.quoteAsset;
      }
    }
    return null;
  };

  getCurrencies = (chainId = this.apiProvider.network) => {
    const tickers = new Set();
    for (let market in this.lastPrices[chainId]) {
      tickers.add(this.lastPrices[chainId][market][0].split("-")[0]);
      tickers.add(this.lastPrices[chainId][market][0].split("-")[1]);
    }
    return [...tickers];
  };

  getExplorerTxLink = (chainId, txhash) => {
    switch (Number(chainId)) {
      case 1:
        return "https://zkscan.io/explorer/transactions/" + txhash;
      case 1002:
        return "https://goerli.zkscan.io/explorer/transactions/" + txhash;
      case 42161:
        return "https://arbiscan.io/tx/" + txhash;
      default:
        throw Error("Chain ID not understood");
    }
  };

  getExplorerAccountLink = (chainId, address, layer = 2) => {
    if (layer === 1) {
      switch (Number(chainId)) {
        case 1:
        case 42161:
          return "https://etherscan.io/address/" + address;
        case 1002:
          return "https://goerli.etherscan.io/address/" + address;
        default:
          throw Error("Chain ID not understood");
      }
    } else {
      switch (Number(chainId)) {
        case 1:
          return "https://zkscan.io/explorer/accounts/" + address;
        case 1002:
          return "https://goerli.zkscan.io/explorer/accounts/" + address;
        case 42161:
          return "https://arbiscan.io/address/" + address;
        default:
          throw Error("Chain ID not understood");
      }
    }
  };
}
