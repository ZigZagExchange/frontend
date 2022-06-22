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
import { 
  ZKSYNC_POLYGON_BRIDGE,
  POLYGON_MUMBAI_WETH_ADDRESS,
  POLYGON_MAINNET_WETH_ADDRESS,
} from "components/pages/BridgePage/Bridge/constants";

import axios from "axios";
import { isMobile } from "react-device-detect";
import get from "lodash/get";

const chainMap = {
  "0x1": 1,
  "0x4": 1000,
  "0xf00": 42161,
};

export default class API extends Emitter {
    networks = {}
    ws = null
    apiProvider = null
    ethersProvider = null
    currencies = null
    isArgent = false
    marketInfo = {}
    lastPrices = {}
    _signInProgress = null
    _profiles = {}
    _pendingOrders = []
    _pendingFills = []

    constructor({ infuraId, networks, currencies, validMarkets }) {
        super()
        
        if (networks) {
            Object.keys(networks).forEach(k => {
                this.networks[k] = [
                    networks[k][0],
                    new networks[k][1](this, networks[k][0]),
                    networks[k][2],
                ]
            })
        }
        
        this.infuraId = infuraId
        this.currencies = currencies
        this.validMarkets = validMarkets

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', this.signOut)
            window.ethereum.on('chainChanged', chainId => {
                this.signOut().then(() => {
                    this.setAPIProvider(chainMap[chainId])
                })
            })

            this.setAPIProvider(chainMap[window.ethereum.chainId] || 1)
        } else {
            this.setAPIProvider(this.networks.mainnet[0])
        }
    }

    getAPIProvider = (network) => {
        return this.networks[this.getNetworkName(network)][1]
    }

    setAPIProvider = (network, networkChanged = true) => {
        const networkName = this.getNetworkName(network)
        console.log(network, networkName);
        
        if (!networkName) {
            this.signOut()
            return
        }

        const apiProvider = this.getAPIProvider(network) 
        this.apiProvider = apiProvider

        // Change WebSocket if necessary
        if (this.ws) {
            const oldUrl = new URL(this.ws.url);
            const newUrl = new URL(this.apiProvider.websocketUrl);
            if (oldUrl.host !== newUrl.host) {
                // Stopping the WebSocket will trigger an auto-restart in 3 seconds
                this.stop();
            }
        }
        
        this.web3 = new Web3(
            window.ethereum || new Web3.providers.HttpProvider(
                `https://${networkName}.infura.io/v3/${this.infuraId}`
            )
        )

        this.web3Modal = new Web3Modal({
            network: networkName,
            cacheProvider: true,
            theme: "dark",
            providerOptions: {
                walletconnect: {
                    package: WalletConnectProvider,
                    options: {
                        infuraId: this.infuraId,
                    }
                },
                "custom-argent": {
                    display: {
                        logo: "https://images.prismic.io/argentwebsite/313db37e-055d-42ee-9476-a92bda64e61d_logo.svg?auto=format%2Ccompress&fit=max&q=50",
                        name: "Argent zkSync",
                        description: "Connect to your Argent zkSync wallet"
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
                    }
                }
            }
        })

        this.getAccountState()
            .catch(err => {
                console.log('Failed to switch providers', err)
            })

        if(networkChanged)
          this.emit('providerChange', network)
    }

    getExplorer = (address, layer, network) => {
      if (layer === 1) {
        const subdomain = this.apiProvider.network === 1 ? "" : "rinkeby.";
        return `https://${subdomain}etherscan.io/address/${address}`;
      }

      const network = this.apiProvider.network
      const subdomain = this.apiProvider.network === 1 ? "" : "rinkeby.";
      switch(network) {
        case 1000: return `https://${subdomain}zkscan.io/explorer/accounts/${address}`;
        case 42161: return `https://${subdomain}arbiscan.io/address/${address}`;
        default: return `https://${subdomain}etherscan.io/address/${address}`;
      }
    }
    
    getProfile = async (address) => {
      const getProfileFromIPFS  = async (address) => {
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
      const profile = this._profiles[address] = {
        description: null,
        website: null,
        image: null,
        address,
      }

      if (!address) {
        return profile
      }

      profile.name = `${address.substr(0, 6)}…${address.substr(-6)}`
      Object.assign(
        profile,
      ...(await Promise.all([
          fetchENSName(address),
          getProfileFromIPFS(address),
        ]))
      )

      if (!profile.image) {
        profile.image = createIcon({ seed: address }).toDataURL()
      }
    }

    return this._profiles[address]
  };

  _socketOpen = () => {
    this.emit("open");
    
    // get initial marketinfos, returns lastprice and marketinfo2
    this.send("marketsreq", [this.apiProvider.network, true])
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
      this.marketInfo[marketInfo.alias] = marketInfo;
    }
    if (msg.op === "marketinfo2") {
      const marketInfos = msg.args[0];
      marketInfos.forEach(marketInfo => {
        if (!marketInfo) return;
        this.marketInfo[marketInfo.alias] = marketInfo;
      });
    }
    if (msg.op === "lastprice") {
      const lastPricesUpdate = msg.args[0];
      lastPricesUpdate.forEach((l) => (this.lastPrices[l[0]] = l));
      const noInfoPairs = lastPricesUpdate
        .map((l) => l[0])
        .filter((pair) => !this.marketInfo[pair]);
      this.cacheMarketInfoFromNetwork(noInfoPairs);
    }
  }

    _socketError = (e) => {
        console.warn("Zigzag websocket connection failed");
    }

    start = () => {
        if (this.ws) this.stop()
        this.ws = new WebSocket(this.apiProvider.websocketUrl)
        this.ws.addEventListener('open', this._socketOpen)
        this.ws.addEventListener('close', this._socketClose)
        this.ws.addEventListener('message', this._socketMsg)
        this.ws.addEventListener('error', this._socketError)
        this.emit('start')

        // login after reconnect
        const accountState = this.getAccountState();
        if (accountState && accountState.id) {
          this.send("login", [
            this.apiProvider.network,
            accountState.id && accountState.id.toString(),
          ]);
        }
    }

    stop = () => {
        if (!this.ws) return
        this.ws.close()
        this.emit('stop')
    }

    getAccountState = async () => {
        const accountState = { ...(await this.apiProvider.getAccountState()) }
        accountState.profile = await this.getProfile(accountState.address)
        this.emit('accountState', accountState)
        return accountState
    }

    send = (op, args) => {
        if (!this.ws) return;
        return this.ws.send(JSON.stringify({ op, args }))
    }

    refreshNetwork = async () => {
        if (!window.ethereum) return
        let ethereumChainId

        // await this.signOut();

        switch (this.apiProvider.network) {
            case 1:
                ethereumChainId = "0x1";
            break;
            case 1000:
                ethereumChainId = "0x4";
            break;
            case 42161: 
              ethereumChainId = "0xf00";
            default:
                return
        }

        await window.ethereum.request({
          method: 'eth_requestAccounts',
          params: [{eth_accounts: {}}]
        });

        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ethereumChainId }],
        });
  };
          

  sleep=(ms)=>{
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  signIn = async (network, ...args) => {
    if (!this._signInProgress) {
      this._signInProgress = Promise.resolve()
        .then(async () => {
          const apiProvider = this.apiProvider;

          if (network) {
            this.apiProvider = this.getAPIProvider(network);
          }

          await this.refreshNetwork();
          await this.sleep(1000);
          const web3Provider = await this.web3Modal.connect();
          this.web3.setProvider(web3Provider);
          this.ethersProvider = new ethers.providers.Web3Provider(
            web3Provider
          );

          // set up polygon providers. mumbai for testnet. polygon for mainnet
          this.polygonProvider = new ethers.providers.JsonRpcProvider(
            this.getPolygonUrl(network)
          );

          let accountState;
          try {
            accountState = await apiProvider.signIn(...args);
          } catch (err) {
            await this.signOut();
            throw err;
          }

          if (accountState && accountState.id) {
            this.send("login", [
              network,
              accountState.id && accountState.id.toString(),
            ]);
          }

          accountState.profile = await this.getProfile(accountState.address)

          this.emit("signIn", accountState);

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

  signOut = async () => {
    if (!this.apiProvider) {
      return;
    } else if (this.web3Modal) {
      await this.web3Modal.clearCachedProvider();
    }

    if(isMobile)
      window.localStorage.clear();
    else
      window.localStorage.removeItem('walletconnect');

      
    this.marketInfo = {}
    this.lastPrices = {}
    this._profiles = {}
    this._pendingOrders = []
    this._pendingFills = []

    this.web3 = null;
    this.web3Modal = null;
    this.ethersProvider = null;
    this.isArgent = false
    this.setAPIProvider(this.apiProvider.network, false);
    this.emit("balanceUpdate", "wallet", {});
    this.emit("balanceUpdate", this.apiProvider.network, {});
    this.emit("balanceUpdate", "polygon", {});
    this.emit("accountState", {});
    this.emit("signOut");
  };

  getPolygonUrl(network) {
    if (network === 1000) {
      return `https://polygon-mumbai.infura.io/v3/${this.infuraId}`;
    } else {
      return `https://polygon-mainnet.infura.io/v3/${this.infuraId}`;
    }
  }

  getPolygonChainId(network) {
    if (network === 1000) {
      return "0x13881";
    } else {
      return "0x89";
    }
  }

  getPolygonWethContract(network) {
    if (network === 1000) {
      return POLYGON_MUMBAI_WETH_ADDRESS;
    } else if (network === 1) {
      return POLYGON_MAINNET_WETH_ADDRESS;
    }
  }

  getPolygonWethBalance = async () => {
    const [account] = await this.web3.eth.getAccounts();
    if (!account) return;
    const polygonEthAddress = this.getPolygonWethContract(
      this.apiProvider.network
    );
    if(!this.polygonProvider) return 0;
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
    try{
      const polygonChainId = this.getPolygonChainId(this.apiProvider.network);
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: polygonChainId }],
      });
      const polygonProvider = new ethers.providers.Web3Provider(
        window.web3.currentProvider
      );
      // const currentNetwork = await polygonProvider.getNetwork(); // This is not correct on the brave browser.

      // if ("0x"+currentNetwork.chainId.toString(16) !== polygonChainId)
      //   throw new Error("Must approve network change");
      // const signer = polygonProvider.getSigner();

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
        .transfer(ZKSYNC_POLYGON_BRIDGE.address, "" + Math.round(amount * (10 ** 18)))
        .send({ 
          from: account, 
          maxPriorityFeePerGas: null,
          maxFeePerGas: null
        });

      const txHash = result.transactionHash;

      let receipt = {
        date: +new Date(),
        network: await polygonProvider.getNetwork(),
        amount,
        token: "WETH",
        type: ZKSYNC_POLYGON_BRIDGE.polygonToZkSync,
        txId: txHash,
        walletAddress: polygonChainId === "0x13881" ? `https://rinkeby.zksync.io/explorer/accounts/${walletAddress}` : `https://zkscan.io/explorer/accounts/${walletAddress}`
      };
      const subdomain = polygonChainId === "0x13881" ? "mumbai." : "";
      receipt.txUrl = `https://${subdomain}polygonscan.com/tx/${txHash}`;
      this.emit("bridgeReceipt", receipt);

      await this.signIn(this.apiProvider.network)
    } catch(e) {
      if (networkSwitched)
        await this.signIn(this.apiProvider.network);
      throw e;
    }
  };

  getNetworkName = (network) => {
    const keys = Object.keys(this.networks);
    return keys[keys.findIndex((key) => network === this.networks[key][0])];
  };

  getNetworkDisplayName = (network) => {
    switch(network) {
      case 1: case 1000: return 'zkSync';
      case 42161: return 'Arbitrum';
      default: return 'ZigZag';
    }

    const keys = Object.keys(this.networks);
    return keys[keys.findIndex((key) => network === this.networks[key][0])];
  };

  subscribeToMarket = (market) => {
    this.send("subscribemarket", [this.apiProvider.network, market]);
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
    await this.send("cancelorder", [this.apiProvider.network, orderId]);
    return true;
  };

  depositL2 = async (amount, token, address) => {
    return this.apiProvider.depositL2(amount, token, address);
  };

  getPolygonFee = async () => {
    const res = await axios.get("https://gasstation-mainnet.matic.network/v2");
    return res.data;
  }

  getEthereumFee = async () => {
    if (this.ethersProvider) {
      const feeData = await this.ethersProvider.getFeeData();
      return feeData;
    }
  };

  withdrawL2 = async (amount, token) => {
    return this.apiProvider.withdrawL2(amount, token);
  };

  transferToBridge = (amount, token, address, userAddress) => {
    return this.apiProvider.transferToBridge(amount, token, address, userAddress);
  };

  depositL2Fee = async (token) => {
    return await this.apiProvider.depositL2Fee(token);;
  };

  withdrawL2GasFee = async (token) => {
    try {
      return await this.apiProvider.withdrawL2GasFee(token);
    } catch (err) {
      console.log(err);
      return { amount: 0, feeToken: 'ETH' };
    }
  };

  transferL2GasFee = async (token) => {
    try {
      return await this.apiProvider.transferL2GasFee(token);
    } catch (err) {
      console.log(err);
      return { amount: 0, feeToken: 'ETH' };
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

  cancelAllOrders = async () => {
    const { id: userId } = await this.getAccountState();
    await this.send("cancelall", [this.apiProvider.network, userId]);
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
    if (!this.ethersProvider) return result;

    try {
      const netContract = this.getNetworkContract();
      const [account] = await this.web3.eth.getAccounts();
      if (currency === "ETH") {
        result.balance = await this.web3.eth.getBalance(account);
        return result;
      }

      if (!currencyInfo) return result;
      const contract = new this.web3.eth.Contract(
        erc20ContractABI,
        currencyInfo.address
      );
      result.balance = await contract.methods.balanceOf(account).call();
      if (netContract) {
        result.allowance = ethers.BigNumber.from(
          await contract.methods.allowance(account, netContract).call()
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
      if (currencyInfo) {
        balances[ticker].valueReadable = formatAmount(balance, currencyInfo);
      } else if (ticker === "ETH") {
        balances[ticker].valueReadable = formatAmount(balance, { decimals: 18 });
      }

      this.emit("balanceUpdate", "wallet", { ...balances });
    };

    const tickers = this.getCurrencies();
    // allways fetch ETH for Etherum wallet
    if(!tickers.includes("ETH")) { tickers.push("ETH"); }

    await Promise.all(tickers.map((ticker) => getBalance(ticker)));

    return balances;
  };

  getBalances = async () => {
    const balances = await this.apiProvider.getBalances();
    this.emit("balanceUpdate", this.apiProvider.network, balances);
    return balances;
  };

  getOrderDetailsWithoutFee = (order) => {
    const side = order[3];
    const baseQuantity = order[5];
    const quoteQuantity = order[4] * order[5];
    const remaining = isNaN(Number(order[11])) ? order[5] : order[11];
    const market = order[2];
    const marketInfo = this.marketInfo[market];
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

  submitOrder = async (
    product,
    side,
    price,
    baseAmount,
    quoteAmount,
    orderType
  ) => {
    if (!quoteAmount && !baseAmount) {
      throw new Error("Set base or quote amount");
    }
    await this.apiProvider.submitOrder(
      product,
      side,
      price,
      baseAmount,
      quoteAmount,
      orderType
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

  getCurrencies = () => {
    return this.apiProvider.getCurrencies();
  };

  getPairs = () => {
    return this.apiProvider.getPairs();
  };

  getCurrencyInfo(currency) {
    return this.apiProvider.getCurrencyInfo(currency);
  }

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
  
  // marketinfo calls can get expesnive so it's good to cache them
  cacheMarketInfoFromNetwork = async (pairs) => {
    if (pairs.length === 0) return;
    if (!this.apiProvider.network) return;
    const pairText = pairs.join(",");
    const url = (this.apiProvider.network === 1)
      ? `https://zigzag-markets.herokuapp.com/markets?id=${pairText}&chainid=${this.apiProvider.network}`
      : `https://secret-thicket-93345.herokuapp.com/api/v1/marketinfos?chain_id=${this.apiProvider.network}&market=${pairText}`
    const marketInfoArray = await fetch(url).then((r) => r.json());
    if (!(marketInfoArray instanceof Array)) return;
    marketInfoArray.forEach((info) => (this.marketInfo[info.alias] = info));
    return;
  }

  get fastWithdrawTokenAddresses() {
    if (this.apiProvider.network === 1) {
      return {
        FRAX: "0x853d955aCEf822Db058eb8505911ED77F175b99e",
        UST: "0xa693b19d2931d498c5b318df961919bb4aee87a5",
      };
    } else if (this.apiProvider.network === 1000) {
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
    if (this.ethersProvider) {
      const currencyMaxes = {};
      if(!this.apiProvider.eligibleFastWithdrawTokens) return currencyMaxes;
      for (const currency of this.apiProvider.eligibleFastWithdrawTokens) {
        let max = 0;
        try {
          if (currency === "ETH") {
            max = await this.ethersProvider.getBalance(
              this.apiProvider.fastWithdrawContractAddress
            );
          } else {
            const contract = new ethers.Contract(
              this.fastWithdrawTokenAddresses[currency],
              erc20ContractABI,
              this.ethersProvider
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
    Object.keys(userOrders).forEach(orderId => {
      const orderStatus = userOrders[orderId][9];
      if (['b', 'm', 'pm'].includes(orderStatus)) {
        // _pendingOrders is used to only request on the 2nd time
        const index = this._pendingOrders.indexOf(orderId);
        if (index > -1) {
          this._pendingOrders.splice(index, 1);
          // request status update
          this.send("orderreceiptreq", [this.apiProvider.network, orderId])
        } else {
          this._pendingOrders.push(orderId);
        }
      }
    })
  }

  updatePendingFills = (userFills) => {
    const fillRequestIds = [];
    Object.keys(userFills).forEach(fillId => {
      const fillStatus = userFills[fillId][6];
      if (['b', 'm', 'pm'].includes(fillStatus)) {
        // _pendingFills is used to only request on the 2nd time
        const index = this._pendingFills.indexOf(fillId);
        if (index > -1) {
          this._pendingFills.splice(index, 1);
          fillRequestIds.push(fillId);
        } else {
          this._pendingFills.push(fillId);
        }
      }
    })    
    // request status update
    this.send("fillreceiptreq", [this.apiProvider.network, fillRequestIds])
  }

  getPairs = () => {
    return Object.keys(this.lastPrices);
  };

  getCurrencyInfo = (currency) => {
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
  };

  getCurrencies = () => {
    const tickers = new Set();
    for (let market in this.lastPrices) {
      tickers.add(this.lastPrices[market][0].split("-")[0]);
      tickers.add(this.lastPrices[market][0].split("-")[1]);
    }
    return [...tickers];
  };
}
