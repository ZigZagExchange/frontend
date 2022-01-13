import Web3 from 'web3'
import { createIcon } from '@download/blockies'
import { toast } from 'react-toastify'
import Web3Modal from 'web3modal'
import Emitter from 'tiny-emitter'
import { ethers } from 'ethers'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { getENSName } from 'lib/ens'
import { formatAmount } from 'lib/utils'
import erc20ContractABI from 'lib/contracts/ERC20.json'
import { MAX_ALLOWANCE } from './constants'

const chainMap = {
    '0x1': 1,
    '0x4': 1000,
}
export default class API extends Emitter {
    networks = {}
    ws = null
    apiProvider = null
    ethersProvider = null
    currencies = null
    websocketUrl = null
    _signInProgress = null
    _profiles = {}
    
    constructor({ infuraId, websocketUrl, networks, currencies, validMarkets }) {
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
        this.websocketUrl = websocketUrl
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
        
        if (this.isZksyncChain()) {
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
    }

    _fetchENSName = async (address) => {
        let name = await getENSName(address)
        if (name) return { name }
        return {}
    }

    _socketOpen = () => {
        this.emit('open')
    }
    
    _socketClose = () => {
        toast.error("Connection to server closed. Please refresh page");
        this.emit('close')
    }

    _socketMsg = (e) => {
        if (!e.data && e.data.length <= 0) return
        console.log(e.data.toString());
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
        const accountState = { ...(await this.apiProvider.getAccountState()) }
        accountState.profile = await this.getProfile(accountState.address)
        this.emit('accountState', accountState)
        return accountState
    }

    send = (op, args) => {
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
    }

    signIn = async (network, ...args) => {
        if (!this._signInProgress) {
            this._signInProgress = Promise.resolve().then(async () => {
                const apiProvider = this.apiProvider

                if (network) {
                    this.apiProvider = this.getAPIProvider(network)
                }
                
                await this.refreshNetwork()
                if (this.isZksyncChain()) {
                    const web3Provider = await this.web3Modal.connect()
                    this.web3.setProvider(web3Provider)
                    this.ethersProvider = new ethers.providers.Web3Provider(web3Provider)
                }
                
                let accountState
                try {
                    accountState = await apiProvider.signIn(...args)
                } catch (err) {
                    await this.signOut()
                    throw err
                }
        
                if (accountState && accountState.id) {
                    this.send('login', [
                        network,
                        accountState.id && accountState.id.toString(),
                    ])
                }
        
                this.emit('signIn', accountState)
                return accountState
            }).finally(() => {
                this._signInProgress = null
            })
        }
        
        return this._signInProgress
    }

    signOut = async () => {
        if (this._signInProgress) {
            return
        } else if (!this.apiProvider) {
            return
        } else if (this.web3Modal) {
            this.web3Modal.clearCachedProvider()
        }

        this.web3 = null
        this.web3Modal = null
        this.ethersProvider = null
        this.setAPIProvider(this.apiProvider.network)
        this.emit('balanceUpdate', 'wallet', {})
        this.emit('balanceUpdate', this.apiProvider.network, {})
        this.emit('accountState', {})
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
        return !!this.apiProvider.zksyncCompatible
    }

    cancelOrder = async (orderId) => {
        await this.send('cancelorder', [this.apiProvider.network, orderId])
        return true
    }

    depositL2 = async (amount, token) => {
        return this.apiProvider.depositL2(amount, token)
    }

    withdrawL2 = async (amount, token) => {
        return this.apiProvider.withdrawL2(amount, token)
    }

    depositL2Fee = async (token) => {
        return this.apiProvider.depositL2Fee(token)
    }

    withdrawL2Fee = async (token) => {
        return this.apiProvider.withdrawL2Fee(token)
    }

    cancelAllOrders = async () => {
        const { id: userId } = await this.getAccountState()
        await this.send('cancelall', [this.apiProvider.network, userId])
        return true
    }
    
    isImplemented = (method) => {
        return this.apiProvider[method] && !this.apiProvider[method].notImplemented
    }

    getNetworkContract = () => {
        return this.networks[this.getNetworkName(this.apiProvider.network)][2]
    }

    approveSpendOfCurrency = async (currency) => {
        const netContract = this.getNetworkContract()
        if (netContract) {
            const [account] = await this.web3.eth.getAccounts()
            const { contractAddress } = this.currencies[currency].chain[this.apiProvider.network]
            const contract = new this.web3.eth.Contract(erc20ContractABI, contractAddress)
            await contract.methods.approve(netContract, MAX_ALLOWANCE).send({ from: account })
        }
    }

    getBalanceOfCurrency = async (currency) => {
        const { contractAddress } = this.currencies[currency].chain[this.apiProvider.network]
        let result = { balance: 0, allowance: MAX_ALLOWANCE }
        if (!this.ethersProvider || !contractAddress) return result
        
        try {
            const netContract = this.getNetworkContract()
            const [account] = await this.web3.eth.getAccounts()
            if (currency === 'ETH') {
                result.balance = await this.web3.eth.getBalance(account)
                return result
            }
            const contract = new this.web3.eth.Contract(erc20ContractABI, contractAddress)
            result.balance = await contract.methods.balanceOf(account).call()
            if (netContract) {
                result.allowance = ethers.BigNumber.from(
                    await contract.methods.allowance(account, netContract).call()
                )
            }
            return result
        } catch (e) {
            console.log(e)
            return result
        }
    }

    getWalletBalances = async () => {
        const balances = {}
        
        const getBalance = async (ticker) => {
            const { balance, allowance } = await this.getBalanceOfCurrency(ticker)
            balances[ticker] = {
                value: balance,
                allowance,
                valueReadable: formatAmount(balance, this.currencies[ticker]),
            }

            this.emit('balanceUpdate', 'wallet', { ...balances })
        }

        const tickers = Object.keys(this.currencies)
            .filter(ticker => this.currencies[ticker].chain[this.apiProvider.network])
            
        await Promise.all(tickers.map(ticker => getBalance(ticker)))

        return balances
    }

    getBalances = async () => {
        const balances = await this.apiProvider.getBalances()
        this.emit('balanceUpdate', this.apiProvider.network, balances)
        return balances
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

    getMarketInfo = async (market) => {
        await this.apiProvider.getMarketInfo(market);
    }

    submitOrder = async (product, side, price, amount, orderType) => {
        await this.apiProvider.submitOrder(product, side, price, amount, orderType)
    }

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

    }

    refreshArweaveAllocation = async (address) => {
        return this.apiProvider.refreshArweaveAllocation(address);
    }

    purchaseArweaveBytes = (currency, bytes) => {
        return this.apiProvider.purchaseArweaveBytes(currency, bytes);
    }

    signMessage = async (message) => {
        return this.apiProvider.signMessage(message);
    }

    uploadArweaveFile = async (sender, timestamp, signature, file) => {
        const formData = new FormData();
        formData.append("sender", sender);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);
        formData.append("file", file);

        const url = "https://zigzag-arweave-bridge.herokuapp.com/arweave/upload";
        const response = await fetch(url, {
          method: 'POST',
          body: formData
        }).then(r => r.json());
        return response;
    }
}
