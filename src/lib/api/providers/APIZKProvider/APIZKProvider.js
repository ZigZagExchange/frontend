import get from 'lodash/get'
import * as zksync from 'zksync'
import {ethers} from 'ethers';
import { toast } from 'react-toastify'
import { toBaseUnit } from 'lib/utils'
import APIProvider from '../APIProvider'
import { MAX_ALLOWANCE } from '../../constants'
import axios from 'axios';
import {closestPackableTransactionAmount} from "zksync";
import BatchTransferService from "./BatchTransferService";

export default class APIZKProvider extends APIProvider {
    static SEEDS_STORAGE_KEY = '@ZZ/ZKSYNC_SEEDS'
    static VALID_SIDES = ['b', 's']

    marketInfo = {}
    lastPrices = {}
    accountState = {}
    ethWallet = null
    syncWallet = null
    syncProvider = null
    batchTransferService = null
    zksyncCompatible = true
    fastWithdrawContractAddress = "0xCC9557F04633d82Fb6A1741dcec96986cD8689AE"
    eligibleFastWithdrawTokens = ["ETH", "FRAX", "UST"]
    _tokenWithdrawFees = {}
    _tokenInfo = {}


  getProfile = async (address) => {
        try {
            const { data } = await axios.get(`https://ipfs.3box.io/profile?address=${address}`)
            const profile = {
                coverPhoto: get(data, 'coverPhoto.0.contentUrl./'),
                image: get(data, 'image.0.contentUrl./'),
                description: data.description,
                emoji: data.emoji,
                website: data.website,
                location: data.location,
                twitter_proof: data.twitter_proof,
            }

            if (data.name) {
                profile.name = data.name
            }
            if (profile.image) {
                profile.image = `https://gateway.ipfs.io/ipfs/${profile.image}`
            }

            return profile
        } catch (err) {
            if (!err.response) {
                throw err
            }
        }

        return {}
    }

    handleBridgeReceipt = (_receipt, amount, token, type) => {
        let receipt = { date: +(new Date()), network: this.network, amount, token, type }
        const subdomain = this.network === 1 ? '' : 'rinkeby.'

        if (!_receipt) {
            return receipt
        } if (_receipt.ethTx) {
            receipt.txId = _receipt.ethTx.hash
            receipt.txUrl = `https://${subdomain}etherscan.io/tx/${receipt.txId}`
        } else if (_receipt.txHash) {
            receipt.txId = _receipt.txHash.split(':')[1]
            receipt.txUrl = `https://${subdomain}zkscan.io/explorer/transactions/${receipt.txId}`
        }

        return receipt
    }

    handleFastBridgeReceipt = (_receipt, amount, token, type) => {
      const receipt = this.handleBridgeReceipt(_receipt, amount, token, type)
      receipt.isFastWithdraw = true
      return receipt
    }

    changePubKey = async () => {
        if (this.network === 1) {
            toast.info('You need to sign a one-time transaction to activate your zksync account. The fee for this tx will be ~0.003 ETH (~$15)')
        }
        else if (this.network === 1000) {
            toast.info('You need to sign a one-time transaction to activate your zksync account.')
        }
        let feeToken = "ETH";
        const accountState = this.accountState ? this.accountState : await this.getAccountState()
        const balances = accountState.committed.balances;
        if (balances.ETH && balances.ETH > 0.005e18) {
            feeToken = "ETH";
        } else if (balances.USDC && balances.USDC > 20e6) {
            feeToken = "USDC";
        } else if (balances.USDT && balances.USDT > 20e6) {
            feeToken = "USDT";
        } else if (balances.DAI && balances.DAI > 20e6) {
            feeToken = "DAI";
        } else if (balances.WBTC && balances.WBTC > 0.0003e8) {
            feeToken = "WBTC";
        } else {
            toast.warn("Your token balances are very low. You might need to bridge in more funds first.");
            feeToken = "ETH";
        }

        const signingKey = await this.syncWallet.setSigningKey({
            feeToken,
            ethAuthType: "ECDSALegacyMessage",
        });

        await signingKey.awaitReceipt();

        return signingKey;
    }

    submitOrder = async (market, side, price, amount, orderType) => {
        const marketInfo = this.marketInfo[market];
        amount = parseFloat(amount).toFixed(marketInfo.baseAsset.decimals);
        price = parseFloat(price).toFixed(marketInfo.pricePrecisionDecimals);

        if (!APIZKProvider.VALID_SIDES.includes(side)) {
            throw new Error('Invalid side')
        }

        let tokenBuy, tokenSell, sellQuantity, sellQuantityWithFee, tokenRatio = {}, fullSellQuantity;

        if (side === 'b') {
            sellQuantity = parseFloat(amount * price)
            sellQuantityWithFee = (sellQuantity + marketInfo.quoteFee).toFixed(marketInfo.quoteAsset.decimals);
            tokenSell = marketInfo.quoteAssetId;
            tokenBuy = marketInfo.baseAssetId;

            const accountState = this.accountState ? this.accountState : await this.getAccountState()
            const balances = accountState.committed.balances;
            const tokenSellSymbol = marketInfo.quoteAsset.symbol;
            const balanceQuote = (balances[tokenSellSymbol]).toFixed(marketInfo.quoteAsset.decimals);
            sellQuantityWithFee = (sellQuantityWithFee < balanceQuote) ? sellQuantityWithFee : balanceQuote;

            tokenRatio[marketInfo.baseAssetId] = amount;
            tokenRatio[marketInfo.quoteAssetId] = sellQuantityWithFee;
            fullSellQuantity = (sellQuantityWithFee * 10**(marketInfo.quoteAsset.decimals)).toLocaleString('fullwide', {useGrouping: false })
        } else if (side === 's') {
            sellQuantity = parseFloat(amount)
            sellQuantityWithFee = (sellQuantity + marketInfo.baseFee).toFixed(marketInfo.baseAsset.decimals);
            tokenSell = marketInfo.baseAssetId;
            tokenBuy = marketInfo.quoteAssetId;
            tokenRatio[marketInfo.baseAssetId] = sellQuantityWithFee;
            tokenRatio[marketInfo.quoteAssetId] = (amount * price).toFixed(marketInfo.quoteAsset.decimals);
            fullSellQuantity = (sellQuantity * 10**(marketInfo.baseAsset.decimals)).toLocaleString('fullwide', {useGrouping: false })
        }

        const now_unix = Date.now() / 1000 | 0
        const two_minute_expiry = now_unix + 120
        const one_week_expiry = now_unix + 7*24*3600;
        let validUntil;
        if (orderType === "limit") {
            validUntil = one_week_expiry;
        } else {
            validUntil = two_minute_expiry;
        }
        const sellQuantityBN = ethers.BigNumber.from(fullSellQuantity);
        const packedSellQuantity = zksync.utils.closestPackableTransactionAmount(sellQuantityBN);
        const order = await this.syncWallet.getOrder({
            tokenSell,
            tokenBuy,
            amount: packedSellQuantity.toString(),
            ratio: zksync.utils.tokenRatio(tokenRatio),
            validUntil
        })
        this.api.send('submitorder2', [this.network, market, order])

        return order
    }

    getBalances = async () => {
        const account = this.accountState ? this.accountState : await this.getAccountState()
        const balances = {}

        this.getCurrencies().forEach(ticker => {
            const currencyInfo = this.getCurrencyInfo(ticker);
            const balance = ((account && account.committed) ? (account.committed.balances[ticker] || 0) : 0)
            if (!balance) return true;
            balances[ticker] = {
                value: balance,
                valueReadable: (balance && currencyInfo && (balance / (10 ** currencyInfo.decimals))) || 0,
                allowance: MAX_ALLOWANCE,
            }
        })

        return balances
    }

    getAccountState = async () => {
        this.accountState = this.syncWallet 
            ? await this.syncWallet.getAccountState() 
            : {}
        return this.accountState
    }

    withdrawL2 = async (amountDecimals, token = 'ETH') => {
        const currencyInfo = this.getCurrencyInfo(token);
        const amount = toBaseUnit(amountDecimals, currencyInfo.decimals)

        try {
            const transfer = await this.syncWallet.withdrawFromSyncToEthereum({
                token,
                ethAddress: await this.ethWallet.getAddress(),
                amount,
            })

            await transfer.awaitReceipt()
            
            this.api.emit('bridgeReceipt',
                this.handleBridgeReceipt(transfer, amountDecimals, token, 'withdraw')
            )
            return transfer
        } catch(err) {
            console.log(err)
        }
    }

    withdrawL2Fast = async (amountDecimals, token) => {
      if (!this.eligibleFastWithdrawTokens.includes(token)) {
        throw Error("Token not supported for fast withdraw")
      }

      const currencyInfo = this.getCurrencyInfo(token)
      let amount = toBaseUnit(amountDecimals, currencyInfo.decimals)

      // if amount is not packable
      const isPackable = isTransactionAmountPackable(amount)
      if (!isPackable) {
        amount = closestPackableTransactionAmount(amount)
      }

      const transfer = await this.syncWallet.syncTransfer({
        to: this._fastWithdrawContractAddress,
        token,
        amount
      })
      await transfer.awaitReceipt()

      this.api.emit('bridgeReceipt', this.handleFastBridgeReceipt(transfer, amountDecimals, token, 'withdraw'))
      return transfer
    }

    depositL2 = async (amountDecimals, token = 'ETH') => {
        let transfer

        const currencyInfo = this.getCurrencyInfo(token);
        const amount = toBaseUnit(amountDecimals, currencyInfo.decimals)

        try {
            transfer = await this.syncWallet.depositToSyncFromEthereum({
                token,
                depositTo: this.syncWallet.address(),
                amount,
            })

            this.api.emit('bridgeReceipt',
                this.handleBridgeReceipt(transfer, amountDecimals, token, 'deposit')
            )            
            return transfer
        } catch(err) {
            console.log(err)
        }
    }

    depositL2Fee = async (token = 'ETH') => {
        // TODO: implement
        return 0
    }

    createWithdraw = async (amountDecimals, token, onSameFeeToken, onDiffFeeToken) => {
      let transfer

      const currencyInfo = this.getCurrencyInfo(token);
      const amount = toBaseUnit(amountDecimals, currencyInfo.decimals);
      const packableAmount = closestPackableTransactionAmount(amount);
      const feeToken = await this.getWithdrawFeeToken(token);
      if (feeToken === token) {
        transfer = await onSameFeeToken(packableAmount)
      } else {
        transfer = await onDiffFeeToken(packableAmount, feeToken)
      }
      return {amountTransferred: amountDecimals, transfer}
    }

    withdrawL2Normal = async (amountDecimals, token) => {

      const onSameFeeToken = async (amount) => {
        const transfer = await this.syncWallet.withdrawFromSyncToEthereum({
          token,
          ethAddress: await this.ethWallet.getAddress(),
          amount,
        })
        await transfer.awaitReceipt()
        return transfer
      }

      const onDiffFeeToken = async (amount, feeToken) => {
        const hashes = await this.batchTransferService.sendWithdraw({
            ethAddress: await this.ethWallet.getAddress(),
            token: token,
            amount: amount,
            fee: 0
          }, feeToken)
        return {txHash: hashes[0]}
      }

      const {transfer, amountTransferred} = await this.createWithdraw(amountDecimals, token, onSameFeeToken, onDiffFeeToken)
      this.api.emit('bridgeReceipt', this.handleBridgeReceipt(transfer, amountTransferred, token, 'withdraw'))
      return transfer
    }

    withdrawL2Fast = async (amountDecimals, token) => {
      if (!this.eligibleFastWithdrawTokens.includes(token)) {
        throw Error("Token not supported for fast withdraw")
      }

      const onSameFeeToken = async (amount) => {
        const transfer = await this.syncWallet.syncTransfer({
          to: this.fastWithdrawContractAddress,
          token,
          amount
        })
        await transfer.awaitReceipt()
        return transfer
      }

      const onDiffFeeToken = async (amount, feeToken) => {
        const hashes = await this.batchTransferService.sendTransfer({
            to: this.fastWithdrawContractAddress,
            token: token,
            amount: amount,
            fee: 0
          }, feeToken)
          return {txHash: hashes[0]}
      }

      const {transfer, amountTransferred} = await this.createWithdraw(amountDecimals, token, onSameFeeToken, onDiffFeeToken)
      this.api.emit('bridgeReceipt', this.handleFastBridgeReceipt(transfer, amountTransferred, token, 'withdraw'))
    }

    getWithdrawFeeToken = async (tokenToWithdraw) => {
      const backupFeeToken = "ETH"
      const tokenInfo = await this.getTokenInfo(tokenToWithdraw);
      return tokenInfo.enabledForFees ? tokenToWithdraw : backupFeeToken
    }

    withdrawL2GasFee = async (token) => {
      const feeToken = await this.getWithdrawFeeToken(token)
      const currencyInfo = this.getCurrencyInfo(feeToken);
      if (!this._tokenWithdrawFees[token]) {
          const fee = await this.syncProvider.getTransactionFee(
              'Withdraw',
              this.syncWallet.address(),
              feeToken,
          )
          const amount = (
            parseInt(fee.totalFee)
            / 10 ** currencyInfo.decimals
          )
          this._tokenWithdrawFees[token] = {amount, feeToken}
        }
        return this._tokenWithdrawFees[token]
    }

    withdrawL2FastGasFee = async (token) => {
      const feeToken = await this.getWithdrawFeeToken(token)
      const feeCurrencyInfo = this.getCurrencyInfo(feeToken)

      let totalFee
      if (feeToken !== token) {
        // paying for tx fees with different tokens requires us to
        // send batch transactions. we estimate those fees here.
        totalFee = await this.syncProvider.getTransactionsBatchFee(
          ['Transfer', 'Transfer'],
          [this.fastWithdrawContractAddress, this.syncWallet.address()],
          feeToken
        );
      } else {
        const fee = await this.syncProvider.getTransactionFee(
          'Transfer',
          this.fastWithdrawContractAddress,
          token
        )
        totalFee = fee.totalFee
      }

      const amount = parseInt(totalFee) / 10 ** feeCurrencyInfo.decimals
      return {amount, feeToken}
    }

    withdrawL2FastBridgeFee = async (token) => {
      /*
      * Returns the fee taken by ZigZag when sending on L1. If the token is not ETH,
      * the notional amount of the ETH tx fee will be taken in the currency being bridged
      * */
      const currencyInfo = this.getCurrencyInfo(token)
      const getNumberFormatted = (atoms) => {
        return parseInt(atoms) / 10 ** currencyInfo.decimals
      }

      if (this.api.ethersProvider) {
        if (!this.eligibleFastWithdrawTokens.includes(token)) {
          throw Error("Token not eligible for fast withdraw")
        }
        const feeData = await this.api.ethersProvider.getFeeData()
        const bridgeFee = feeData.maxFeePerGas.mul(21000)

        if (token === "ETH") {
          return getNumberFormatted(bridgeFee)
        } else if (["FRAX", "UST"].includes(token)) {
          const priceInfo = await this.tokenPrice("ETH")
          const stableFee = (bridgeFee.toString() / 1e18 * priceInfo.price * 10**currencyInfo.decimals * 50000 / 21000).toFixed(0);
          return getNumberFormatted(stableFee)
        }
      } else {
        throw new Error("Ethers provider not found")
      }
    }

    signIn = async () => {
        try {
            this.syncProvider = await zksync.getDefaultProvider(
                this.api.getNetworkName(this.network)
            )
        } catch (e) {
            toast.error('Zksync is down. Try again later')
            throw e
        }

        try {
            this.ethWallet = this.api.ethersProvider.getSigner()
            const { seed, ethSignatureType } = await this.getSeed(this.ethWallet);
            const syncSigner = await zksync.Signer.fromSeed(seed);
            this.syncWallet = await zksync.Wallet.fromEthSigner(this.ethWallet, this.syncProvider, syncSigner, undefined, ethSignatureType)
        } catch (err) {
            console.log(err)
            throw err
        }

        this.batchTransferService = new BatchTransferService(this.syncProvider, this.syncWallet)
        const accountState = this.accountState ? this.accountState : await this.getAccountState()
        if (!accountState.id) {
            if (!/^\/bridge(\/.*)?$/.test(window.location.pathname)) {
                toast.error("Account not found. Please use the bridge to deposit funds before trying again.");
            }
        } else {
            const signingKeySet = await this.syncWallet.isSigningKeySet()
            if (! signingKeySet) {
                await this.changePubKey();
            }
        }

        return accountState
    }

    getSeeds = () => {
        try {
            return JSON.parse(window.localStorage.getItem(APIZKProvider.SEEDS_STORAGE_KEY) || '{}')
        } catch {
            return {}
        }
    }

    getSeedKey = async (ethSigner) => {
        return `${this.network}-${await ethSigner.getAddress()}`
    }

    getSeed = async (ethSigner) => {
        const seedKey = await this.getSeedKey(ethSigner)
        let seeds = this.getSeeds(ethSigner)

        if (!seeds[seedKey]) {
            seeds[seedKey] = await this.genSeed(ethSigner)
            seeds[seedKey].seed = seeds[seedKey].seed.toString().split(',').map(x => +x)
            window.localStorage.setItem(
                APIZKProvider.SEEDS_STORAGE_KEY,
                JSON.stringify(seeds),
            )
        }

        seeds[seedKey].seed = Uint8Array.from(seeds[seedKey].seed)
        return seeds[seedKey]
    }

    genSeed = async (ethSigner) => {
        let chainID = 1;
        if (ethSigner.provider) {
            const network = await ethSigner.provider.getNetwork();
            chainID = network.chainId;
        }
        let message = 'Access zkSync account.\n\nOnly sign this message for a trusted client!';
        if (chainID !== 1) {
            message += `\nChain ID: ${chainID}.`;
        }
        const signedBytes = zksync.utils.getSignedBytesFromMessage(message, false);
        const signature = await zksync.utils.signMessagePersonalAPI(ethSigner, signedBytes);
        const address = await ethSigner.getAddress();
        const ethSignatureType = await zksync.utils.getEthSignatureType(ethSigner.provider, message, signature, address);
        const seed = ethers.utils.arrayify(signature);
        return { seed, ethSignatureType };
    }

    refreshArweaveAllocation = async (address) => {
        if (address) {
            const url = "https://zigzag-arweave-bridge.herokuapp.com/allocation/zksync?address=" + address;
            try {
                const allocation = await fetch(url).then(r => r.json());
                const bytes = Number(allocation.remaining_bytes);
                this.api.emit('arweaveAllocationUpdate', bytes);
            } catch (e) {
                console.error(e);
            }
        } else {
            this.api.emit('arweaveAllocationUpdate', 0)
        }
    }

    purchaseArweaveBytes = async (bytes) => {
        const feeToken = "USDC"
        const feeTokenDecimals = 6
        const BYTES_PER_DOLLAR = 10**6;
        const ARWEAVE_BRIDGE_ADDRESS = "0xCb7AcA0cdEa76c5bD5946714083c559E34627607";
        const amount = (bytes / BYTES_PER_DOLLAR * 10**feeTokenDecimals).toString();
        return this.syncWallet.syncTransfer({
            to: ARWEAVE_BRIDGE_ADDRESS,
            token: feeToken,
            amount,
        });
    }

    signMessage = async (message) => {
        return await this.ethWallet.signMessage(message);
    }

    getChainName = (chainId) => {
        if (Number(chainId) === 1) {
            return "mainnet"
        } else if (Number(chainId) === 1000) {
            return "rinkeby"
        } else {
            throw Error("Chain ID not understood")
        }
    }

    getZkSyncBaseUrl = (chainId) => {
        if (this.getChainName(chainId) === "mainnet") {
            return "https://api.zksync.io/api/v0.2"
        } else if (this.getChainName(chainId) === "rinkeby") {
            return "https://rinkeby-api.zksync.io/api/v0.2"
        } else {
            throw Error("Uknown chain")
        }
    }

    /*
    * Gets token info from zkSync REST API
    * @param  {String} tokenLike:            Symbol or Internal ID
    * @param  {Number or String} _chainId:   Network ID to query (1 for mainnet, 1000 for rinkeby)
    * @return {Object}                       {address: string, decimals: number, enabledForFees: bool, id: number, symbol: string}
    * */
    getTokenInfo = async (tokenLike, _chainId = this.network) => {
      const chainId = _chainId.toString()
      const returnFromCache = this._tokenInfo[chainId] && this._tokenInfo[chainId][tokenLike]
      try {
        if (returnFromCache) {
          return this._tokenInfo[chainId][tokenLike]
        } else {
          const res = await axios.get(this.getZkSyncBaseUrl(chainId) + `/tokens/${tokenLike}`)
          this._tokenInfo[chainId] = {...this._tokenInfo[chainId], [tokenLike]: res.data.result}
          return this._tokenInfo[chainId][tokenLike]
        }
      } catch (e) {
          console.error("Could not get token info", e)
      }
    }

    tokenPrice = async (tokenLike, chainId = 1) => {
        try {
            const res = await axios.get(this.getZkSyncBaseUrl(chainId) + `/tokens/${tokenLike}/priceIn/usd`)
            return res.data.result
        } catch (e) {
            console.error("Could not get token price", e)
        }
    }

    cacheMarketInfoFromNetwork = async (pairs) => {
        if (pairs.length === 0) return;
        if (!this.network) return;
        const pairText = pairs.join(',');
        const url = `https://zigzag-markets.herokuapp.com/markets?id=${pairText}&chainid=${this.network}`;
        const marketInfoArray = await fetch(url).then(r => r.json());
        if (!(marketInfoArray instanceof Array)) return;
        marketInfoArray.forEach(info => this.marketInfo[info.alias] = info);
        return;
    }

    getPairs = () => {
        return Object.keys(this.lastPrices);
    }

    getCurrencyInfo (currency) {
        const pairs = this.getPairs();
        for (let i=0; i < pairs.length; i++) {
            const pair = pairs[i];
            const baseCurrency = pair.split("-")[0];
            const quoteCurrency = pair.split("-")[1];
            if (baseCurrency === currency && this.marketInfo[pair]) {
                return this.marketInfo[pair].baseAsset;
            }
            else if (quoteCurrency === currency && this.marketInfo[pair]) {
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
    }
}