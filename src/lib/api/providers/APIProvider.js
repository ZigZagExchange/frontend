import axios from 'axios'

const notImplemented = function (method) {
  const x = () => { throw new Error(`APIProvider method not implemented: ${method}`) }
  x.notImplemented = true
  return x
}

export default class APIProvider {
  // Methods required to be implemented
  signIn                  = notImplemented('signIn')
  signOut                 = notImplemented('signOut')
  getAccountState         = notImplemented('getAccountState')
  submitOrder             = notImplemented('submitOrder')
  depositL2               = notImplemented('depositL2')
  withdrawL2Normal        = notImplemented('withdrawL2Normal')
  withdrawL2Fast          = notImplemented('withdrawL2Fast')
  depositL2Fee            = notImplemented('depositL2Fee')
  withdrawL2GasFee        = notImplemented('withdrawL2GasFee')
  withdrawL2FastBridgeFee = notImplemented('withdrawL2FastBridgeFee')
  getBalances             = notImplemented('getBalances')
  
  marketInfo = {};
  lastPrices = {};
  _tokenInfo = {};

  constructor(api, network) {
    this.api = api
    this.network = network
    this.websocketUrl = process.env.REACT_APP_ZIGZAG_WS;
    if (network === 1000 && process.env.REACT_APP_ZIGZAG_WS_RINKEBY) {
      this.websocketUrl = process.env.REACT_APP_ZIGZAG_WS_RINKEBY;
    }
  }
  
  getChainName = (chainId) => {
    if (Number(chainId) === 1) {
      return "mainnet";
    } else if (Number(chainId) === 1000) {
      return "rinkeby";
    } else {
      throw Error("Chain ID not understood");
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

  getCurrencies = () => {
    const tickers = new Set();
    for (let market in this.lastPrices) {
      tickers.add(this.lastPrices[market][0].split("-")[0]);
      tickers.add(this.lastPrices[market][0].split("-")[1]);
    }
    return [...tickers];
  };
}