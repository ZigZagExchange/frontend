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

const chainMap = {
  "0x1": 1,
  "0x4": 1000,
};
export default class API extends Emitter {
    networks = {}
    ws = null
    apiProvider = null
    ethersProvider = null
    currencies = null
    isArgent = false
    marketInfo = {}
    lastprices = {}
    _signInProgress = null
    _profiles = {}

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

    setAPIProvider = (network) => {
        const networkName = this.getNetworkName(network)
        
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
        
        if (this.isZksyncChain()) {
            this.web3 = new Web3(
                window.ethereum || new Web3.providers.HttpProvider(
                    `https://${networkName}.infura.io/v3/${this.infuraId}`
                )
            )
    
            this.web3Modal = new Web3Modal({
                network: networkName,
                cacheProvider: false,
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
        }

        this.getAccountState()
            .catch(err => {
                console.log('Failed to switch providers', err)
            })

        this.emit('providerChange', network)
    }

    getProfile = async (address) => {
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
                    this._fetchENSName(address),
                    this.apiProvider.getProfile(address),
                ]))
            )

            if (!profile.image) {
                profile.image = createIcon({ seed: address }).toDataURL()
            }
        }

        return this._profiles[address]
  };

  _fetchENSName = async (address) => {
    let name = await getENSName(address);
    if (name) return { name };
    return {};
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
      this.apiProvider.marketInfo[marketInfo.alias] = marketInfo;
    }
    if (msg.op === "marketinfo2") {
      const marketInfos = msg.args[0];
      marketInfos.forEach(marketInfo => {
        if (!marketInfo) return;
        this.apiProvider.marketInfo[marketInfo.alias] = marketInfo;
      });
    }
    if (msg.op === "lastprice") {
      const lastprices = msg.args[0];
      lastprices.forEach((l) => (this.apiProvider.lastPrices[l[0]] = l));
      const noInfoPairs = lastprices
        .map((l) => l[0])
        .filter((pair) => !this.apiProvider.marketInfo[pair]);
      this.apiProvider.cacheMarketInfoFromNetwork(noInfoPairs);
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

        await this.signOut();

        switch (this.apiProvider.network) {
            case 1:
                ethereumChainId = "0x1";
            break;
            case 1000:
                ethereumChainId = "0x4";
            break;
            default:
                return
        }

        await window.ethereum.request({ method: 'eth_requestAccounts' });

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
          if (this.isZksyncChain()) {
            await this.sleep(2000);
            const web3Provider = isMobile
              ? await this.web3Modal.connectTo("walletconnect")
              : await this.web3Modal.connect();
            await this.web3Modal.toggleModal();
            this.web3.setProvider(web3Provider);
            this.ethersProvider = new ethers.providers.Web3Provider(
              web3Provider
            );
          }

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

          this.emit("signIn", accountState);
          return accountState;
        })
        .finally(() => {
          this._signInProgress = null;
        });
    }

    return this._signInProgress;
  };

  signOut = async () => {
    if (this._signInProgress) {
      return;
    } else if (!this.apiProvider) {
      return;
    } else if (this.web3Modal) {
      await this.web3Modal.clearCachedProvider();
    }

    this.web3 = null;
    this.web3Modal = null;
    this.ethersProvider = null;
    this.isArgent = false
    this.setAPIProvider(this.apiProvider.network);
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
    const polygonChainId = this.getPolygonChainId(this.apiProvider.network);
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: polygonChainId }],
    });
    const polygonProvider = new ethers.providers.Web3Provider(
      window.web3.currentProvider
    );
    const currentNetwork = await polygonProvider.getNetwork();

    if ("0x"+currentNetwork.chainId.toString(16) !== polygonChainId)
      throw new Error("Must approve network change");
    // const signer = polygonProvider.getSigner();
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

    this.signIn(this.apiProvider.network)
  };

  getNetworkName = (network) => {
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
    return await this.apiProvider.withdrawL2GasFee(token);
  };

  withdrawL2FastGasFee = async (token) => {
    return await this.apiProvider.withdrawL2FastGasFee(token);
  };

  withdrawL2FastBridgeFee = async (token) => {
    return await this.apiProvider.withdrawL2FastBridgeFee(token);
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
    }
  };

  getBalanceOfCurrency = async (currency) => {
    const currencyInfo = this.getCurrencyInfo(currency);
    let result = { balance: 0, allowance: ethersConstants.Zero };
    if (!this.ethersProvider || !currencyInfo) return result;

    try {
      const netContract = this.getNetworkContract();
      const [account] = await this.web3.eth.getAccounts();
      if (currency === "ETH") {
        result.balance = await this.web3.eth.getBalance(account);
        return result;
      }
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
      }

      this.emit("balanceUpdate", "wallet", { ...balances });
    };

    const tickers = this.getCurrencies();

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
    const marketInfo = this.apiProvider.marketInfo[market];
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
}
