import * as zksync from 'zksync'
import { ethers } from 'ethers';
import { toast } from 'react-toastify'
import { toBaseUnit } from 'lib/utils'
import APIProvider from './APIProvider'
import { MAX_ALLOWANCE } from '../constants'
import axios from 'axios';

export default class APIZKProvider extends APIProvider {
    static VALID_SIDES = ['b', 's']
    
    ethWallet = null
    syncWallet = null
    syncProvider = null
    _profiles = {}

    getProfile = async (address) => {
        if (this._profiles.hasOwnProperty(address)) {
            return this._profiles[address]
        }

        if (!address) {
            return {}
        }

        try {
            const { data, statusCode } = await axios.get(`https://ipfs.3box.io/profile?address=${address}`)
            if (statusCode === 200) {
                console.log('got data', data)
                return data
            }
        } catch (err) {
            if (!err.statusCode) {
                console.log(err)
            }
            return {}
        }
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

    submitOrder = async (product, side, price, amount) => {
        amount = parseFloat(amount)
        const currencies = product.split('-')
        const baseCurrency = currencies[0]
        const quoteCurrency = currencies[1]

        if (baseCurrency === 'USDC' || baseCurrency === 'USDT') {
            amount = parseFloat(amount).toFixed(7).slice(0, -1)
        }

        price = parseFloat(price).toPrecision(8)
        
        if (!APIZKProvider.VALID_SIDES.includes(side)) {
            throw new Error('Invalid side')
        }
        
        let tokenBuy, tokenSell, sellQuantity, buyQuantity, sellQuantityWithFee
        
        if (side === 'b') {
            [tokenBuy, tokenSell] = currencies
            buyQuantity = amount
            sellQuantity = parseFloat(amount * price)
        } else if (side === 's') {
            [tokenSell, tokenBuy] = currencies
            buyQuantity = amount * price
            sellQuantity = parseFloat(amount)
        }

        sellQuantityWithFee = sellQuantity + this.api.currencies[tokenSell].gasFee
        let priceWithFee = 0
        
        if (side === 'b') {
            priceWithFee = parseFloat((sellQuantityWithFee / buyQuantity).toPrecision(6))
        }
        else if (side === 's') {
            priceWithFee = parseFloat((buyQuantity / sellQuantityWithFee).toPrecision(6))
        }
        
        const tokenRatio = {}
        tokenRatio[baseCurrency] = 1
        tokenRatio[quoteCurrency] = priceWithFee.toString()
        const now_unix = Date.now() / 1000 | 0
        const two_minute_expiry = now_unix + 120
        const parsedSellQuantity = this.syncProvider.tokenSet.parseToken(
            tokenSell,
            sellQuantityWithFee.toFixed(this.api.currencies[tokenSell].decimals)
        );
        const packedSellQuantity = zksync.utils.closestPackableTransactionAmount(parsedSellQuantity);
        const order = await this.syncWallet.getOrder({
            tokenSell,
            tokenBuy,
            amount: packedSellQuantity,
            ratio: zksync.utils.tokenRatio(tokenRatio),
            validUntil: two_minute_expiry
        })
        this.api.send('submitorder', [this.network, order])

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
    
    signIn = async () => {
        try {
            this.syncProvider = await zksync.getDefaultProvider(
                this.api.getNetworkName(this.network)
            )
        } catch (e) {
            toast.error('Zksync is down. Try again later')
            throw e
        }

        this.ethWallet = this.api.ethersProvider.getSigner()
        const { seed, ethSignatureType } = await this.genSeed(this.ethWallet);
        const syncSigner = await zksync.Signer.fromSeed(seed);
        this.syncWallet = await zksync.Wallet.fromEthSigner(this.ethWallet, this.syncProvider, syncSigner, undefined, ethSignatureType)        
        const accountState = await this.api.getAccountState()
        if (!accountState.id) {
            toast.error(
                "Account not found. Please use the bridge to deposit funds before trying again."
            );
        } else {
            const signingKeySet = await this.syncWallet.isSigningKeySet()
            if (! signingKeySet) {
                await this.changePubKey();
            }
        }

        return accountState
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
}
