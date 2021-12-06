import { toast } from 'react-toastify'
//import { getStarknet } from '@argent/get-starknet'
import * as starknet from 'starknet'
import bigInt from 'big-integer'
import starknetAccountContract from 'lib/contracts/Account.json'
import api from 'lib/api'

// Data
//const zkTokenIds = {
//    0: {name:'ETH',decimals:18},
//    1: {name:'USDT',decimals:6}
//}
//const validMarkets = {
//    'ETH-BTC': 1,
//    'ETH-USDT': 1,
//    'BTC-USDT': 1
//}


// export const web3 = new Web3(
//     window.ethereum || new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/475c945f527f4dc5aae8ae2173b8661a')
// )

// export const web3Modal = new Web3Modal({
//     network: 'mainnet',
//     cacheProvider: false,
//     providerOptions: {
//         walletconnect: {
//             package: WalletConnectProvider,
//             options: {
//                 infuraId: '475c945f527f4dc5aae8ae2173b8661a'
//             }
//         }
//     }
// })

export const STARKNET_CONTRACT_ADDRESS = '0x074f861a79865af1fb77af6197042e8c73147e28c55ac61e385ac756f89b33d6'
export const currencyInfo = {
    ETH: {
        decimals: 18,
        name: "Ethereum",
        chain: {
            1: { tokenId: 0 },
            1000: { tokenId: 0 },
            1001: {
                contractAddress:
                    "0x06a75fdd9c9e376aebf43ece91ffb315dbaa753f9c0ddfeb8d7f3af0124cd0b6",
            },
        },
        gasFee: 0.0003,
    },
    USDC: {
        decimals: 6,
        name: "USD Coin",
        chain: {
            1: { tokenId: 2 },
            1000: { tokenId: 2 },
            1001: {
                contractAddress:
                    "0x0545d006f9f53169a94b568e031a3e16f0ea00e9563dc0255f15c2a1323d6811",
            },
        },
        gasFee: 1,
    },
    USDT: {
        decimals: 6,
        name: "Tether",
        chain: {
            1: { tokenId: 4 },
            1000: { tokenId: 1 },
            1001: {
                contractAddress:
                    "0x03d3af6e3567c48173ff9b9ae7efc1816562e558ee0cc9abc0fe1862b2931d9a",
            },
        },
        gasFee: 1,
    },
    DAI: {
        decimals: 18,
        name: "Dai",
        chain: {
            1: { tokenId: 1 },
            1000: { tokenId: 19 },
            1001: {
                contractAddress: null
            },
        },
        gasFee: 1,
    },
    WBTC: {
        decimals: 8,
        name: "Bitcoin",
        chain: {
            1: { tokenId: 15 },
            1000: { tokenId: null },
            1001: {
                contractAddress: null
            },
        },
        gasFee: 0.00003,
    },
};


export const validMarkets = {
    // zkSync Mainnet
    1: [
        "ETH-USDT",
        "ETH-USDC",
        "ETH-DAI",
        "USDC-USDT",
        //"WBTC-USDT",
        //"FRAX-USDC",
    ],
    // zkSync Rinkeby
    1000: [
        "ETH-USDT",
        "ETH-USDC",
        "USDC-USDT",
        "ETH-DAI"
    ],

    // Starknet Alpha
    1001: [
        "ETH-USDT",
        "ETH-USDC",
    ]
}

//globals
let syncWallet
let accountState

export async function signin(chainid) {
    return api.signIn(chainid)
}

export async function signinstarknet(chainid) {
    let userWalletContractAddress
    // check if wallet extension is installed and initialized. Shows a modal prompting the user to download ArgentX otherwise.
    // const starknet = getStarknet({ showModal: true })
    // const [userWalletContractAddress] = await starknet.enable() // may throws when no extension is detected
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
    const initialized = await checkAccountInitializedStarknet(userWalletContractAddress)
    if (!initialized) {
        await initializeAccountStarknet(userWalletContractAddress)
    }

    const msg = { op: 'login', args: [chainid, userWalletContractAddress] }
    api.ws.send(JSON.stringify(msg))

    const balanceWaitToast = toast.info('Waiting on balances to load...', { autoClose: false })
    const committedBalances = await getStarknetBalances(chainid, userWalletContractAddress)
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
            await mintStarknetBalance(currencyInfo[currency].chain[chainid].contractAddress, userWalletContractAddress, amount)
            committedBalances[currency] = amount
        }
    }

    // Check allowances
    const allowanceToast = toast.info('Checking and setting allowances on tokens', { autoClose: false })
    const allowances = await getStarknetAllowances(chainid, userWalletContractAddress, STARKNET_CONTRACT_ADDRESS)
    console.log(allowances)
    toast.dismiss(allowanceToast)

    // Set allowances if not set
    for (let currency in allowances) {
        let amount = bigInt(1e21)
        if (allowances[currency].compare(amount) === -1) {
            const setApprovalResult = await setTokenApprovalStarknet(currencyInfo[currency].chain[chainid].contractAddress, userWalletContractAddress, STARKNET_CONTRACT_ADDRESS, amount.toString())
            console.log(setApprovalResult)
        }
    }


    //// check if connection was successful
    //if(starknet.isConnected) {
    //    // If the extension was installed and successfully connected, you have access to a starknet.js Signer object to do all kind of requests through the users wallet contract.
    //    //starknet.signer.invokeFunction({ ... })
    //    console.log('starknet connected')
    //} else {
    //    // In case the extension wasn't successfully connected you still have access to a starknet.js Provider to read starknet states and sent anonymous transactions
    //    //starknet.provider.callContract( ... )
    //    console.error('starknet not connected')
    //}
    accountState = {
        address: userWalletContractAddress,
        id: userWalletContractAddress,
        committed: {
            balances: committedBalances
        }
    }
    return accountState
}

export async function checkAccountInitializedStarknet(userAddress) {
    try {
        await starknet.defaultProvider.callContract({
            contract_address: userAddress,
            entry_point_selector: starknet.stark.getSelectorFromName('assert_initialized'),
            calldata: []
        })
        return true
    } catch (e) {
        return false
    }
}

export async function initializeAccountStarknet(userAddress) {
    const userAddressInt = bigInt(userAddress.slice(2), 16)
    const result = await starknet.defaultProvider.addTransaction({
        type: 'INVOKE_FUNCTION',
        contract_address: userAddress,
        entry_point_selector: starknet.stark.getSelectorFromName('initialize'),
        calldata: [userAddressInt.toString()]
    })
    return result
}

export async function getStarknetBalances(chainid, userAddress) {
    const balances = {};
    for (let i in validMarkets[1001]) {
        const market = validMarkets[1001][i];
        const baseCurrency = market.split("-")[0];
        const quoteCurrency = market.split("-")[1];
        console.log(market, baseCurrency, quoteCurrency);
        if (!balances[baseCurrency]) {
            balances[baseCurrency] = await getStarknetBalance(
                currencyInfo[baseCurrency].chain[chainid].contractAddress,
                userAddress
            );
        }
        if (!balances[quoteCurrency]) {
            balances[quoteCurrency] = await getStarknetBalance(
                currencyInfo[quoteCurrency].chain[chainid].contractAddress,
                userAddress
            );
        }
    }
    return balances
}

export async function getStarknetAllowances(chainid, userAddress, spender) {
    const allowances = {}
    for (let currency in currencyInfo) {
        let allowance = await getTokenAllowanceStarknet(currencyInfo[currency].chain[chainid].contractAddress, userAddress, spender)
        allowances[currency] = allowance
    }
    return allowances
}

export async function getTokenAllowanceStarknet(tokenAddress, userAddress, spender) {
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

export async function setTokenApprovalStarknet(tokenAddress, userAddress, spender, amount) {
    const keypair = starknet.ec.ec.keyFromPrivate(localStorage.getItem('starknet:privkey'), 'hex')
    const spenderInt = bigInt(spender.slice(2), 16)
    const localSigner = new starknet.Signer(starknet.defaultProvider, userAddress, keypair)
    return await localSigner.addTransaction({
        type: 'INVOKE_FUNCTION',
        contract_address: tokenAddress,
        entry_point_selector: starknet.stark.getSelectorFromName('approve'),
        calldata: [spenderInt.toString(), amount, '0']
    })
}


export async function getStarknetBalance(contractAddress, userAddress) {
    const userAddressInt = bigInt(userAddress.slice(2), 16)
    const balanceJson = await starknet.defaultProvider.callContract({
        contract_address: contractAddress,
        entry_point_selector: starknet.stark.getSelectorFromName('balance_of'),
        calldata: [userAddressInt.toString()]
    })
    const balance = bigInt(balanceJson.result[0].slice(2), 16)
    return balance
}

export async function mintStarknetBalance(contractAddress, userAddress, amount) {
    const userAddressInt = bigInt(userAddress.slice(2), 16)
    await starknet.defaultProvider.addTransaction({
        type: 'INVOKE_FUNCTION',
        contract_address: contractAddress,
        entry_point_selector: starknet.stark.getSelectorFromName('mint'),
        calldata: [userAddressInt.toString(), amount, '0']
    })
    return true
}

export async function submitorder(chainId, product, side, price, amount) {
    return api.submitOrder(product, side, price, amount)
}

export async function submitorderstarknet(chainId, product, side, price, amount) {
    const expiration = Date.now() + 86400
    const orderhash = starknetOrderHash(chainId, product, side, price, amount, expiration)
    const keypair = starknet.ec.ec.keyFromPrivate(localStorage.getItem('starknet:privkey'), 'hex')
    const sig = starknet.ec.sign(keypair, orderhash.hash)

    const starknetOrder = [...orderhash.order, sig.r, sig.s]
    const msg = { op: 'submitorder', args: [chainId, starknetOrder] }
    api.ws.send(JSON.stringify(msg))
}

export function starknetOrderHash(chainId, product, side, price, amount, expiration) {
    const baseCurrency = product.split('-')[0]
    const quoteCurrency = product.split('-')[1]
    const baseAsset = currencyInfo[baseCurrency].chain[chainId].contractAddress
    const quoteAsset = currencyInfo[quoteCurrency].chain[chainId].contractAddress
    const priceInt = (price * 1e6).toFixed(0)
    const sideInt = side === 'b' ? 0 : 1
    const baseQuantityInt = (amount * 10 ** (currencyInfo[baseCurrency].decimals)).toFixed(0)
    let orderhash = starknet.hash.pedersen([chainId, accountState.address])
    orderhash = starknet.hash.pedersen([orderhash, baseAsset])
    orderhash = starknet.hash.pedersen([orderhash, quoteAsset])
    orderhash = starknet.hash.pedersen([orderhash, sideInt])
    orderhash = starknet.hash.pedersen([orderhash, baseQuantityInt])
    orderhash = starknet.hash.pedersen([orderhash, priceInt])
    orderhash = starknet.hash.pedersen([orderhash, expiration])
    const starknetOrder = [chainId, accountState.address, baseAsset, quoteAsset, sideInt, baseQuantityInt, priceInt, expiration]
    return { hash: orderhash, order: starknetOrder }
}

export async function broadcastfill(swapOffer, fillOrder) {
    const swap = await syncWallet.syncSwap({
        orders: [swapOffer, fillOrder],
        feeToken: 'ETH',
    })
    let receipt
    try {
        receipt = await swap.awaitReceipt()
    } catch (e) {
        return { success: false, swap, receipt: null }
    }
    console.log(receipt)
    return { success: true, swap, receipt }
}

export async function cancelallorders(chainid, userid) {
    // TODO: Send an on-chain transaction to cancel orders
    const msg = { op: 'cancelall', args: [chainid, userid.toString()] }
    api.ws.send(JSON.stringify(msg))
    return true
}

export async function cancelorder(chainid, orderid) {
    // TODO: Send an on-chain transaction to cancel orders
    const msg = { op: 'cancelorder', args: [chainid, orderid] }
    api.ws.send(JSON.stringify(msg))
    return true
}



export function getOrderDetailsWithoutFee(order) {
    const side = order[3];
    const baseQuantity = order[5];
    const quoteQuantity = order[4] * order[5];
    const remaining = isNaN(Number(order[11])) ? order[5] : order[11];
    const baseCurrency = order[2].split("-")[0];
    const quoteCurrency = order[2].split("-")[1];
    let baseQuantityWithoutFee,
        quoteQuantityWithoutFee,
        priceWithoutFee,
        remainingWithoutFee;
    if (side === "s") {
        const fee = currencyInfo[baseCurrency].gasFee;
        baseQuantityWithoutFee = baseQuantity - fee;
        remainingWithoutFee = Math.max(0, remaining - fee);
        priceWithoutFee = quoteQuantity / baseQuantityWithoutFee;
        quoteQuantityWithoutFee = priceWithoutFee * baseQuantityWithoutFee;
    } else {
        const fee = currencyInfo[quoteCurrency].gasFee;
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

export function getFillDetailsWithoutFee(fill) {
    const side = fill[3];
    const baseQuantity = fill[5];
    const quoteQuantity = fill[4] * fill[5];
    const baseCurrency = fill[2].split("-")[0];
    const quoteCurrency = fill[2].split("-")[1];
    let baseQuantityWithoutFee, quoteQuantityWithoutFee, priceWithoutFee;
    if (side === "s") {
        const fee = currencyInfo[baseCurrency].gasFee;
        baseQuantityWithoutFee = baseQuantity - fee;
        priceWithoutFee = quoteQuantity / baseQuantityWithoutFee;
        quoteQuantityWithoutFee = priceWithoutFee * baseQuantityWithoutFee;
    } else {
        const fee = currencyInfo[quoteCurrency].gasFee;
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

export function isZksyncChain(chainid) {
    return ([1, 1000]).includes(chainid)
}

