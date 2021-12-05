import * as zksync from "zksync";
import Web3 from 'web3'
import Web3Modal from 'web3modal'
import Emitter from 'tiny-emitter'
import { ethers } from 'ethers'
import { toast } from 'react-toastify';
// //import { getStarknet } from '@argent/get-starknet'
// import * as starknet from 'starknet'
// import bigInt from 'big-integer'
// import starknetAccountContract from './contracts/Account.json'
import WalletConnectProvider from '@walletconnect/web3-provider'

export default class API extends Emitter {
    networks = {}
    ws = null
    apiProvider = null
    syncProvider = null
    ethersProvider = null
    currencies = null
    websocketUrl = null
    ethWallet = null
    syncWallet = null

    constructor({ infuraId, websocketUrl, networks, currencies }) {
        super()

        this.web3 = new Web3(
            window.ethereum || new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${infuraId}`)
        )

        this.web3Modal = new Web3Modal({
            cacheProvider: false,
            providerOptions: {
                walletconnect: {
                    package: WalletConnectProvider,
                    options: {
                        infuraId,
                    }
                }
            }
        })
        
        if (networks) {
            Object.keys(networks).forEach(k => {
                this.networks[k] = [
                    networks[k][0],
                    new networks[k][1](this, networks[k][0]),
                ]
            })
        }
        
        this.apiProvider = this.networks[Object.keys(this.networks)[0]][1]
        this.websocketUrl = websocketUrl
        this.currencies = currencies

        this.emit('providerChange', this.apiProvider.network)
    }

    getAPIProvider = (network) => {
        return this.networks[this.getNetworkName(network)][1]
    }

    setAPIProvider = (network) => {
        this.apiProvider = this.getAPIProvider(network)
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

    signIn = async (network) => {
        if (network) {
            this.apiProvider = this.getAPIProvider(network)
        }

        const web3Provider = await this.web3Modal.connect()
        this.web3.setProvider(web3Provider || window.ethereum)

        let ethereumChainId;
        let ethereumChainName;
        switch (network) {
            case 1:
                ethereumChainId = "0x1";
                ethereumChainName = "mainnet";
                break;
            case 1000:
            default:
                ethereumChainId = "0x4";
                ethereumChainName = "rinkeby";
        }
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: ethereumChainId }],
            });
        } catch (e) {
            toast.error("Wrong chain. Cannot sign in.");
            return false;
        }

        this.ethersProvider = new ethers.providers.Web3Provider(web3Provider || window.ethereum)
        try {
            this.syncProvider = await zksync.getDefaultProvider(ethereumChainName);
        } catch (e) {
            toast.error("Zksync is down. Try again later");
            throw e;
        }
        this.ethWallet = this.ethersProvider.getSigner();
        this.syncWallet = await zksync.Wallet.fromEthSigner(this.ethWallet, this.syncProvider);

        const accountState = await this.apiProvider.signIn(network)

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

    getDetailsWithoutFee = (order) => {
        const side = order[3]
        const baseQuantity = order[5]
        const quoteQuantity = order[4] * order[5]
        const remaining = isNaN(Number(order[11])) ? order[5] : order[11]
        const baseCurrency = order[2].split('-')[0]
        const quoteCurrency = order[2].split('-')[1]
        let baseQuantityWithoutFee, quoteQuantityWithoutFee, priceWithoutFee, remainingWithoutFee
        if (side === 's') {
            const fee = this.currencies[baseCurrency].gasFee
            baseQuantityWithoutFee = baseQuantity - fee
            remainingWithoutFee = Math.max(0, remaining - fee)
            priceWithoutFee = quoteQuantity / baseQuantityWithoutFee
            quoteQuantityWithoutFee = priceWithoutFee * baseQuantityWithoutFee
        }
        else if (side === 'b') {
            const fee = this.currencies[quoteCurrency].gasFee
            quoteQuantityWithoutFee = quoteQuantity - fee
            priceWithoutFee = quoteQuantityWithoutFee / baseQuantity
            baseQuantityWithoutFee = quoteQuantityWithoutFee / priceWithoutFee
            remainingWithoutFee = Math.min(baseQuantityWithoutFee, remaining)
        }
        
        return { price: priceWithoutFee, quoteQuantity: quoteQuantityWithoutFee, baseQuantity: baseQuantityWithoutFee, remaining: remainingWithoutFee }
    }

    submitOrder = async (product, side, price, amount) => {
        const order = await this.apiProvider.submitOrder(product, side, price, amount)
        this.send('submitorder', [this.apiProvider.network, order])
    }
}
