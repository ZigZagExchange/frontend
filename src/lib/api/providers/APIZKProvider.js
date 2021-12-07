import * as zksync from 'zksync'
import { toast } from 'react-toastify'
import APIProvider from './APIProvider'

export default class APIZKProvider extends APIProvider {
    static VALID_SIDES = ['b', 's']
    
    syncWallet = null
    syncProvider = null

    changePubKey = async () => {
        let feeToken = "ETH";
        const balances = this._accountState.committed.balances;
        if (balances.ETH && balances.ETH > 0.005e18) {
            feeToken = "ETH";
        } else if (balances.USDC && balances.USDC > 20e6) {
            feeToken = "USDC";
        } else if (!balances.USDC && balances.USDC > 20e6) {
            feeToken = "USDT";
        } else {
            feeToken = "ETH";
        }
        const changeAction = await this.syncWallet.setSigningKey({
            feeToken,
            ethAuthType: "ECDSALegacyMessage",
        });
        return await changeAction.awaitReceipt();
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
        tokenRatio[quoteCurrency] = priceWithFee
        const now_unix = Date.now() / 1000 | 0
        const three_minute_expiry = now_unix + 180
        const order = await this.syncWallet.getOrder({
            tokenSell,
            tokenBuy,
            amount: this.syncProvider.tokenSet.parseToken(
                tokenSell,
                sellQuantityWithFee.toPrecision(6)
            ),
            ratio: zksync.utils.tokenRatio(tokenRatio),
            validUntil: three_minute_expiry
        })
        this.api.send('submitorder', [this.network, order])

        return order
    }

    getAccountState = async () => {
        return this.syncWallet
            ? this.syncWallet.getAccountState()
            : {}
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

        const ethWallet = this.api.ethersProvider.getSigner()
        this.syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, this.syncProvider)        
        this._accountState = await this.syncWallet.getAccountState()        
        const signingKeySet = await this.syncWallet.isSigningKeySet()
        
        if (! signingKeySet) {
            if (this.network === 1) {
                toast.info('You need to sign a one-time transaction to activate your zksync account. The fee for this tx will be ~0.003 ETH (~$15)')
            }
            else if (this.network === 1000) {
                toast.info('You need to sign a one-time transaction to activate your zksync account.')
            }
            const setPubkey = await this.changePubKey();
            await setPubkey.awaitReceipt()
        }

        return this._accountState
    }
}
