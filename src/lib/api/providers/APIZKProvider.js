import get from 'lodash/get'
import * as zksync from 'zksync'
import { ethers } from 'ethers';
import { toast } from 'react-toastify'
import { toBaseUnit } from 'lib/utils'
import APIProvider from './APIProvider'
import { MAX_ALLOWANCE } from '../constants'
import axios from 'axios';
export default class APIZKProvider extends APIProvider {
    static SEEDS_STORAGE_KEY = '@ZZ/ZKSYNC_SEEDS'
    static VALID_SIDES = ['b', 's']
    
    ethWallet = null
    syncWallet = null
    syncProvider = null
    zksyncCompatible = true
    _tokenWithdrawFees = {}

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

    changePubKey = async () => {
        if (this.network === 1) {
            toast.info('You need to sign a one-time transaction to activate your zksync account. The fee for this tx will be ~0.003 ETH (~$15)')
        }
        else if (this.network === 1000) {
            toast.info('You need to sign a one-time transaction to activate your zksync account.')
        }
        let feeToken = "ETH";
        const accountState = await this.syncWallet.getAccountState()
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

    getMarketInfo = async (market) => {
        return fetch(`https://zigzag-markets.herokuapp.com/markets?id=${market}&chainid=${this.network}`)
            .then(r => r.json())
            .then(r => r[0]);
    }

    submitOrder = async (market, side, price, amount, orderType) => {
        const marketInfo = await this.getMarketInfo(market);
        console.log(marketInfo);
        amount = parseFloat(amount).toFixed(marketInfo.baseAsset.decimals);
        price = parseFloat(price).toFixed(marketInfo.pricePrecisionDecimals);
        
        if (!APIZKProvider.VALID_SIDES.includes(side)) {
            throw new Error('Invalid side')
        }
        
        let tokenBuy, tokenSell, sellQuantity, sellQuantityWithFee;
        
        if (side === 'b') {
            sellQuantity = parseFloat(amount * price)
            sellQuantityWithFee = sellQuantity + marketInfo.quoteFee;
            tokenSell = marketInfo.quoteAssetId;
            tokenBuy = marketInfo.baseAssetId
        } else if (side === 's') {
            sellQuantity = parseFloat(amount)
            sellQuantityWithFee = sellQuantity + marketInfo.baseFee;
            tokenSell = marketInfo.baseAssetId;
            tokenBuy = marketInfo.quoteAssetId;
        }
        
        const tokenRatio = {}
        tokenRatio[marketInfo.baseAssetId] = amount;
        tokenRatio[marketInfo.quoteAssetId] = (amount * price).toFixed(marketInfo.quoteAsset.decimals);
        const now_unix = Date.now() / 1000 | 0
        const two_minute_expiry = now_unix + 120
        const one_day_expiry = now_unix + 24*3600;
        let validUntil;
        if (orderType === "limit") {
            validUntil = one_day_expiry;
        } else {
            validUntil = two_minute_expiry;
        }
        const parsedSellQuantity = this.syncProvider.tokenSet.parseToken(
            tokenSell,
            sellQuantityWithFee.toString()
        );
        const packedSellQuantity = zksync.utils.closestPackableTransactionAmount(parsedSellQuantity);
        const order = await this.syncWallet.getOrder({
            tokenSell,
            tokenBuy,
            amount: packedSellQuantity,
            ratio: zksync.utils.tokenRatio(tokenRatio),
            validUntil
        })
        this.api.send('submitorder2', [this.network, market, order])

        return order
    }

    getBalances = async () => {
        const account = await this.getAccountState()
        const balances = {}

        Object.keys(this.api.currencies).forEach(ticker => {
            const currency = this.api.currencies[ticker]
            const balance = ((account && account.committed) ? (account.committed.balances[ticker] || 0) : 0)
            balances[ticker] = {
                value: balance,
                valueReadable: balance && (balance / (10 ** currency.decimals)),
                allowance: MAX_ALLOWANCE,
            }
        })

        return balances
    }

    getAccountState = async () => {
        return this.syncWallet
            ? this.syncWallet.getAccountState()
            : {}
    }

    withdrawL2 = async (amountDecimals, token = 'ETH') => {
        let transfer

        const amount = toBaseUnit(amountDecimals, this.api.currencies[token].decimals)
        
        try {
            transfer = await this.syncWallet.withdrawFromSyncToEthereum({
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

    depositL2 = async (amountDecimals, token = 'ETH') => {
        let transfer

        const amount = toBaseUnit(amountDecimals, this.api.currencies[token].decimals)

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
        return 0
    }
    
    withdrawL2Fee = async (token = 'ETH') => {
        if (! this._tokenWithdrawFees[token]) {
            const fee = await this.syncProvider.getTransactionFee(
                'Withdraw',
                [this.syncWallet.address()],
                token,
            )
    
            this._tokenWithdrawFees[token] = (
                parseInt(fee.totalFee)
                / 10 ** this.api.currencies[token].decimals
            )
        }

        return this._tokenWithdrawFees[token]
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

        const accountState = await this.api.getAccountState()
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
        const url = "https://zigzag-arweave-bridge.herokuapp.com/allocation/zksync?address=" + address;
        try {
            const allocation = await fetch(url).then(r => r.json());
            const bytes = allocation.remaining_bytes;
            this.api.emit('arweaveAllocationUpdate', bytes);
        } catch (e) {
            console.error(e);
        }
    }

    purchaseArweaveBytes = async (currency, bytes) => {
        const BYTES_PER_DOLLAR = 10**6;
        const ARWEAVE_BRIDGE_ADDRESS = "0xCb7AcA0cdEa76c5bD5946714083c559E34627607";
        const decimals = this.api.currencies[currency].decimals;
        console.log(currency, bytes, decimals, BYTES_PER_DOLLAR);
        const amount = (bytes / BYTES_PER_DOLLAR * 10**decimals).toString();
        return this.syncWallet.syncTransfer({
            to: ARWEAVE_BRIDGE_ADDRESS,
            token: currency,
            amount,
        });
    }

    signMessage = async (message) => {
        return await this.ethWallet.signMessage(message);
    }
}
