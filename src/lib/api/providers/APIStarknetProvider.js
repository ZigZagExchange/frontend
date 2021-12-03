import * as starknet from 'starknet'
import { toast } from 'react-toastify'
import bigInt from 'big-integer'
import starknetAccountContract from 'lib/contracts/Account.json'
import APIProvider from './APIProvider'

export default class APIStarknetProvider extends APIProvider {
    static STARKNET_CONTRACT_ADDRESS = '0x074f861a79865af1fb77af6197042e8c73147e28c55ac61e385ac756f89b33d6'
    _accountState = {}

    getAccountState = () => {
        return this._accountState
    }

    submitOrder = async (product, side, price, amount) => {
        const expiration = Date.now() + 86400
        const orderhash = this._createOrderHash(product, side, price, amount, expiration)
        const keypair = starknet.ec.ec.keyFromPrivate(localStorage.getItem('starknet:privkey'), 'hex')
        const sig = starknet.ec.sign(keypair, orderhash.hash)
    
        const starknetOrder = [...orderhash.order, sig.r, sig.s]
        this.api.send('submitorder', [this.network, starknetOrder])
    }

    signIn = async () => {
        let userWalletContractAddress
        let keypair

        if (localStorage.getItem('starknet:privkey')) {
            keypair = starknet.ec.ec.keyFromPrivate(localStorage.getItem('starknet:privkey'), 'hex')
        }
        else {
            keypair = starknet.ec.genKeyPair()
            localStorage.setItem('starknet:privkey', keypair.getPrivate('hex'))
        }
        if (localStorage.getItem('starknet:account')) {
            userWalletContractAddress = localStorage.getItem('starknet:account')
        }
        else {
            const starkkey = starknet.ec.getStarkKey(keypair)
            const starkkeyint = bigInt(starkkey.slice(2), 16)
            const deployContractToast = toast.info('First time using Zigzag Starknet. Deploying account contract...', { autoClose: false })
            const deployContractResponse = await starknet.defaultProvider.deployContract(starknetAccountContract, [starkkeyint.toString()])
            toast.dismiss(deployContractToast)
            userWalletContractAddress = deployContractResponse.address
            console.log(deployContractResponse)
            toast.success('Account contract deployed')
            localStorage.setItem('starknet:account', userWalletContractAddress)
        }
    
        // Check account initialized
        const initialized = await this._checkAccountInitialized(userWalletContractAddress)
        if (!initialized) {
            await this._initializeAccount(userWalletContractAddress)
        }
    
        this.api.send('login', [this.network, userWalletContractAddress])
    
        const balanceWaitToast = toast.info('Waiting on balances to load...', { autoClose: false })
        const committedBalances = await this._getBalances(userWalletContractAddress)
        toast.dismiss(balanceWaitToast)
    
        // Mint some tokens if the account is blank
        for (let currency in committedBalances) {
            if (committedBalances[currency].compare(0) === 0) {
                toast.info(`No ${currency} found. Minting you some`)
                let amount
                if (currency === 'ETH') {
                    amount = bigInt(1e18).toString()
                }
                else {
                    amount = bigInt(5e9).toString()
                }
                await this._mintBalance(this.api.currencies[currency].chain[this.network].contractAddress, userWalletContractAddress, amount)
                committedBalances[currency] = amount
            }
        }
    
        // Check allowances
        const allowanceToast = toast.info('Checking and setting allowances on tokens', { autoClose: false })
        const allowances = await this._getAllowances(userWalletContractAddress, APIStarknetProvider.STARKNET_CONTRACT_ADDRESS)
        toast.dismiss(allowanceToast)
    
        // Set allowances if not set
        for (let currency in allowances) {
            let amount = bigInt(1e21)
            if (allowances[currency].compare(amount) === -1) {
                const setApprovalResult = await this._setTokenApproval(
                    this.api.currencies[currency].chain[this.network].contractAddress,
                    userWalletContractAddress,
                    APIStarknetProvider.STARKNET_CONTRACT_ADDRESS,
                    amount.toString()
                )
                console.log({ setApprovalResult })
            }
        }
    
        this._accountState = {
            address: userWalletContractAddress,
            id: userWalletContractAddress,
            committed: {
                balances: committedBalances,
            },
        }
        
        return this._accountState    
    }

    _checkAccountInitialized = async (userWalletContractAddress) => {
        try {
            await starknet.defaultProvider.callContract({
                contract_address: userWalletContractAddress,
                entry_point_selector: starknet.stark.getSelectorFromName('assert_initialized'),
                calldata: []
            })
            return true
        } catch (e) {
            return false
        }
    }

    _initializeAccount = async (userAddress) => {
        const userAddressInt = bigInt(userAddress.slice(2), 16)
        const result = await starknet.defaultProvider.addTransaction({
            type: 'INVOKE_FUNCTION',
            contract_address: userAddress,
            entry_point_selector: starknet.stark.getSelectorFromName('initialize'),
            calldata: [userAddressInt.toString()]
        })

        return result
    }

    _getBalances = async (userAddress) => {
        const balances = {}
        for (let currency in this.api.currencies) {
            let balance = await this._getBalance(
                this.api.currencies[currency].chain[this.network].contractAddress,
                userAddress,
            )
            balances[currency] = balance
        }
        return balances
    }

    _getBalance = async (contractAddress, userAddress) => {
        const userAddressInt = bigInt(userAddress.slice(2), 16)
        const balanceJson = await starknet.defaultProvider.callContract({
            contract_address: contractAddress,
            entry_point_selector: starknet.stark.getSelectorFromName('balance_of'),
            calldata: [userAddressInt.toString()]
        })
        const balance = bigInt(balanceJson.result[0].slice(2), 16)
        return balance
    }

    _mintBalance = async (contractAddress, userAddress, amount) => {
        const userAddressInt = bigInt(userAddress.slice(2), 16)
        await starknet.defaultProvider.addTransaction({
            type: 'INVOKE_FUNCTION',
            contract_address: contractAddress,
            entry_point_selector: starknet.stark.getSelectorFromName('mint'),
            calldata: [userAddressInt.toString(), amount, '0']
        })
        return true    
    }

    _getAllowances = async (userAddress, spender) => {
        const allowances = {}
        for (let currency in this.api.currencies) {
            let allowance = await this._getTokenAllowance(
                this.api.currencies[currency].chain[this.network].contractAddress,
                userAddress,
                spender,
            )
            allowances[currency] = allowance
        }
        return allowances    
    }

    _getTokenAllowance = async (tokenAddress, userAddress, spender) => {
        const contractAddressInt = bigInt(spender.slice(2), 16)
        const userAddressInt = bigInt(userAddress.slice(2), 16)
        const allowanceJson = await starknet.defaultProvider.callContract({
            contract_address: tokenAddress,
            entry_point_selector: starknet.stark.getSelectorFromName('allowance'),
            calldata: [userAddressInt.toString(), contractAddressInt]
        })
        const allowance = bigInt(allowanceJson.result[0].slice(2), 16)
        return allowance
    }

    _setTokenApproval = async (tokenAddress, userAddress, spender, amount) => {
        const keypair = starknet.ec.ec.keyFromPrivate(localStorage.getItem('starknet:privkey'), 'hex')
        const spenderInt = bigInt(spender.slice(2), 16)
        const localSigner = new starknet.Signer(starknet.defaultProvider, userAddress, keypair)
        return localSigner.addTransaction({
            type: 'INVOKE_FUNCTION',
            contract_address: tokenAddress,
            entry_point_selector: starknet.stark.getSelectorFromName('approve'),
            calldata: [spenderInt.toString(), amount, '0']
        })    
    }

    _createOrderHash = (product, side, price, amount, expiration) => {
        const baseCurrency = product.split('-')[0]
        const quoteCurrency = product.split('-')[1]
        const baseAsset = this.api.currencies[baseCurrency].chain[this.network].contractAddress
        const quoteAsset = this.api.currencies[quoteCurrency].chain[this.network].contractAddress
        const priceInt = (price * 1e6).toFixed(0)
        const sideInt = side === 'b' ? 0 : 1
        const baseQuantityInt = (amount * 10 ** (this.api.currencies[baseCurrency].decimals)).toFixed(0)
        let orderhash = starknet.hash.pedersen([this.network, this._accountState.address])
        orderhash = starknet.hash.pedersen([orderhash, baseAsset])
        orderhash = starknet.hash.pedersen([orderhash, quoteAsset])
        orderhash = starknet.hash.pedersen([orderhash, sideInt])
        orderhash = starknet.hash.pedersen([orderhash, baseQuantityInt])
        orderhash = starknet.hash.pedersen([orderhash, priceInt])
        orderhash = starknet.hash.pedersen([orderhash, expiration])
        const starknetOrder = [this.network, this._accountState.address, baseAsset, quoteAsset, sideInt, baseQuantityInt, priceInt, expiration]
        return { hash: orderhash, order: starknetOrder }
    
    }
}