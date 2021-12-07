import Web3 from 'web3'
import { toast } from 'react-toastify'
import Web3Modal from 'web3modal'
import Emitter from 'tiny-emitter'
import { ethers } from 'ethers'
import WalletConnectProvider from '@walletconnect/web3-provider'
import erc20ContractABI from 'lib/contracts/ERC20.json'

export default class API extends Emitter {
    networks = {}
    ws = null
    apiProvider = null
    syncProvider = null
    ethersProvider = null
    currencies = null
    websocketUrl = null
    
    constructor({ infuraId, websocketUrl, networks, currencies, validMarkets }) {
        super()
        
        if (networks) {
            Object.keys(networks).forEach(k => {
                this.networks[k] = [
                    networks[k][0],
                    new networks[k][1](this, networks[k][0]),
                ]
            })
        }
        
        this.infuraId = infuraId
        this.websocketUrl = websocketUrl
        this.currencies = currencies
        this.validMarkets = validMarkets
        this.setAPIProvider(this.networks.mainnet[0])
    }

    getAPIProvider = (network) => {
        return this.networks[this.getNetworkName(network)][1]
    }

    setAPIProvider = (network) => {
        const networkName = this.getNetworkName(network)
        this.apiProvider = this.getAPIProvider(network)

        this.web3 = new Web3(
            window.ethereum || new Web3.providers.HttpProvider(
                `https://${networkName}.infura.io/v3/${this.infuraId}`
            )
        )

        this.web3Modal = new Web3Modal({
            network: networkName,
            cacheProvider: false,
            providerOptions: {
                walletconnect: {
                    package: WalletConnectProvider,
                    options: {
                        infuraId: this.infuraId,
                    }
                }
            }
        })

        this.getAccountState()
            .then(accountState => {
                console.log('Account state', accountState)
            })
            .catch(err => {
                console.log('Failed to switch providers', err)
            })

        this.emit('providerChange', network)
    }

    _socketOpen = () => {
        this.__pingServerTimeout = setInterval(this.ping, 5000)
        this.emit('open')
    }
    
    _socketClose = () => {
        clearInterval(this.__pingServerTimeout)
        this.emit('close')
    }

    _socketMsg = (e) => {
        if (!e.data && e.data.length <= 0) return
        const msg = JSON.parse(e.data)
        this.emit('message', msg.op, msg.args)
    }

    start = () => {
        if (this.ws) this.stop()
        this.ws = new WebSocket(this.websocketUrl)
        this.ws.addEventListener('open', this._socketOpen)
        this.ws.addEventListener('close', this._socketClose)
        this.ws.addEventListener('message', this._socketMsg)
        this.emit('start')
    }

    stop = () => {
        if (!this.ws) return
        this.ws.removeEventListener('open', this._socketOpen)
        this.ws.removeEventListener('close', this._socketClose)
        this.ws.removeEventListener('message', this._socketMsg)
        this._socketClose()
        this.ws.close()
        this.emit('stop')
    }

    getAccountState = async () => {
        const state = await this.apiProvider.getAccountState()
        this.emit('accountState', state)
        return state
    }

    ping = () => this.send('ping')

    send = (op, args) => {
        return this.ws.send(JSON.stringify({ op, args }))
    }

    refreshNetwork = async () => {
        if (!window.ethereum) return
        let ethereumChainId

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

        await window.ethereum.enable();

        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ethereumChainId }],
        });
    }

    signIn = async (network) => {
        if (network) {
            this.apiProvider = this.getAPIProvider(network)
        }
        
        await this.refreshNetwork()

        if (this.isZksyncChain(network)) {
            const web3Provider = ((await this.web3Modal.connect()) || window.ethereum)
            this.web3.setProvider(web3Provider)
            this.ethersProvider = new ethers.providers.Web3Provider(web3Provider)
        }
        let accountState;
        try {
            accountState = await this.apiProvider.signIn(network)
        } catch (e) {
            console.error(e);
            toast.error(e);
            return false;
        }

        if (accountState) {
            this.send('login', [
                network,
                accountState.id.toString(),
            ])

            this.emit('signIn', accountState)
        }

        return accountState
    }

    signOut = () => {
        this.emit('signOut')
    }
    
    getNetworkName = (network) => {
        const keys = Object.keys(this.networks)
        return keys[keys.findIndex(key => network === this.networks[key][0])]
    }

    subscribeToMarket = (market) => {
        this.send('subscribemarket', [this.apiProvider.network, market])
    }
    
    unsubscribeToMarket = (market) => {
        this.send('unsubscribemarket', [this.apiProvider.network, market])
    }

    isZksyncChain = () => {
        return [1000, 1].includes(this.apiProvider.network)
    }

    cancelOrder = async (orderId) => {
        await this.send('cancelorder', [this.apiProvider.network, orderId])
        return true
    }

    depositL2 = (amount, token) => {
        return this.apiProvider.depositL2(amount, token)
    }

    withdrawL2 = (amount, token) => {
        return this.apiProvider.withdrawL2(amount, token)
    }

    cancelAllOrders = async () => {
        const { id: userId } = await this.getAccountState()
        await this.send('cancelall', [this.apiProvider.network, userId])
        return true
    }
    
    isImplemented = (method) => {
        return this.apiProvider[method] && !this.apiProvider[method].notImplemented
    }

    getBalanceOfCurrency = async (currency) => {
        try {
            const [account] = await this.web3.eth.getAccounts()
            if (currency === 'ETH') return this.web3.eth.getBalance(account)
            const { contractAddress } = this.currencies[currency].chain[this.apiProvider.network]
            const contract = new this.web3.eth.Contract(erc20ContractABI, contractAddress)
            const result = await contract.methods.balanceOf(account).call()
            return result
        } catch (e) {
            return 0
        }
    }

    getWalletBalances = async () => {
        const balances = {}
        
        for (const [ticker, currency] of Object.entries(this.currencies)) {
            const value = await this.getBalanceOfCurrency(ticker)
            balances[ticker] = {
                value,
                valueReadable: parseFloat(value / Math.pow(10, currency.decimals)).toFixed(8),
            }
        }

        return balances
    }

    getBalances = async () => {
        return this.apiProvider.getBalances()
    }

    getOrderDetailsWithoutFee = (order) => {
        const side = order[3]
        const baseQuantity = order[5]
        const quoteQuantity = order[4] * order[5]
        const remaining = isNaN(Number(order[11])) ? order[5] : order[11]
        const [baseCurrency, quoteCurrency] = order[2].split('-')
        let baseQuantityWithoutFee, quoteQuantityWithoutFee, priceWithoutFee, remainingWithoutFee
        if (side === "s") {
            const fee = this.currencies[baseCurrency].gasFee;
            baseQuantityWithoutFee = baseQuantity - fee;
            remainingWithoutFee = Math.max(0, remaining - fee);
            priceWithoutFee = quoteQuantity / baseQuantityWithoutFee;
            quoteQuantityWithoutFee = priceWithoutFee * baseQuantityWithoutFee;
        } else {
            const fee = this.currencies[quoteCurrency].gasFee;
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
    }

    getFillDetailsWithoutFee(fill) {
        const side = fill[3];
        const baseQuantity = fill[5];
        const quoteQuantity = fill[4] * fill[5];
        const baseCurrency = fill[2].split("-")[0];
        const quoteCurrency = fill[2].split("-")[1];
        let baseQuantityWithoutFee, quoteQuantityWithoutFee, priceWithoutFee;
        if (side === "s") {
            const fee = this.currencies[baseCurrency].gasFee;
            baseQuantityWithoutFee = baseQuantity - fee;
            priceWithoutFee = quoteQuantity / baseQuantityWithoutFee;
            quoteQuantityWithoutFee = priceWithoutFee * baseQuantityWithoutFee;
        } else {
            const fee = this.currencies[quoteCurrency].gasFee;
            quoteQuantityWithoutFee = quoteQuantity - fee;
            priceWithoutFee = quoteQuantityWithoutFee / baseQuantity;
            baseQuantityWithoutFee = quoteQuantityWithoutFee / priceWithoutFee;
        }
        return {
            price: priceWithoutFee,
            quoteQuantity: quoteQuantityWithoutFee,
            baseQuantity: baseQuantityWithoutFee,
        };
    }

    submitOrder = async (product, side, price, amount) => {
        await this.apiProvider.submitOrder(product, side, price, amount)
    }
}
