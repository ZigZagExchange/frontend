import * as zksync from "zksync";
import { ethers } from "ethers";

// Data
//const zkTokenIds = {
//    0: {name:'ETH',decimals:18},
//    1: {name:'USDT',decimals:6}
//}
//const validMarkets = {
//    "ETH-BTC": 1,
//    "ETH-USDT": 1,
//    "BTC-USDT": 1
//}

//globals
let ethersProvider;
let syncProvider;
let ethWallet;
let syncWallet;
let syncAccountState;

// Websocket
const zigzagws_url = process.env.REACT_APP_ZIGZAG_WS;
export const zigzagws = new WebSocket(zigzagws_url);

zigzagws.addEventListener('open', function () {
    // TODO: Subscribe to the current active market instead of ETH-USDT
    //zigzagws.send(JSON.stringify({op:"subscribemarket", args: ["ETH-USDT"]}))
});

export async function getAccountState() {
    const syncAccountState = await syncWallet.getAccountState();
    return syncAccountState;
}

export async function signinzksync() {
    if (!window.ethereum) {
        // TODO: Display a message that says Please download and unlock Metamask to continue
        window.open("https://metamask.io", '_blank');
        return
    }

    await window.ethereum.enable();

    await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4' }],
    });

    ethersProvider = new ethers.providers.Web3Provider(window.ethereum)
    syncProvider = await zksync.getDefaultProvider("rinkeby");

    ethWallet = ethersProvider.getSigner()
    syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);
    
    syncAccountState = await syncWallet.getAccountState();
    console.log("account state", syncAccountState)
    if (!syncAccountState.id) {
        throw new Error("Account not found. Please use the Wallet to deposit funds before trying again.");
    }

    const signingKeySet = await syncWallet.isSigningKeySet();
    if (!signingKeySet) {
        await changepubkeyzksync();
    }
    const msg = {op:"login", args:[syncAccountState.id]}
    zigzagws.send(JSON.stringify(msg));

    return syncAccountState;
}

export async function changepubkeyzksync() {
    const changePubkey = await syncWallet.setSigningKey({
        feeToken: "ETH",
        fee: ethers.utils.parseEther("0.0001"),
        ethAuthType: "ECDSA"
    });
    const receipt = await changePubkey.awaitReceipt();
    console.log(receipt)
}


export async function submitorder(product, side, price, amount) {
    const validsides = ['b', 's'];
    if (!validsides.includes(side)) {
        throw new Error("Invalid side");
    }
    if (amount < 0.0001) {
        throw new Error("Quantity must be atleast 0.0001");
    }
    const currencies = product.split('-');
    const baseCurrency = currencies[0];
    const quoteCurrency = currencies[1];
    let tokenBuy, tokenSell, sellQuantity;
    if (side === 'b') {
        tokenBuy = currencies[0];
        tokenSell = currencies[1];
        sellQuantity = amount*price;
    }
    else if (side === 's') {
        tokenBuy = currencies[1];
        tokenSell = currencies[0];
        sellQuantity = amount;
    }
    const tokenRatio = {}
    tokenRatio[baseCurrency] = 1;
    tokenRatio[quoteCurrency] = price;
    const order = await syncWallet.getOrder({
        tokenSell,
        tokenBuy,
        amount: syncProvider.tokenSet.parseToken(tokenSell, sellQuantity.toString()),
        ratio: zksync.utils.tokenRatio(tokenRatio)
    });
    console.log("sending limit order", order);
    const msg = {op:"submitorder", args: [order]};
    zigzagws.send(JSON.stringify(msg));
}


export async function sendfillrequest(orderreceipt) {
    const orderId = orderreceipt[0];
    const market = orderreceipt[1];
    const baseCurrency = market.split('-')[0];
    const quoteCurrency = market.split('-')[1];
    const side = orderreceipt[2];
    const price = orderreceipt[3];
    const baseQuantity = orderreceipt[4];
    const quoteQuantity = orderreceipt[5];
    let tokenSell, tokenBuy, sellQuantity;
    if (side === 'b') {
        tokenSell = baseCurrency;
        tokenBuy = quoteCurrency;
        sellQuantity = baseQuantity;
    }
    else if (side === 's') {
        tokenSell = quoteCurrency;
        tokenBuy = baseCurrency;
        sellQuantity = quoteQuantity;
    }
    const tokenRatio = {};
    tokenRatio[baseCurrency] = 1;
    tokenRatio[quoteCurrency] = price;
    const fillOrder = await syncWallet.getOrder({
        tokenSell,
        tokenBuy,
        amount: syncProvider.tokenSet.parseToken(tokenSell, sellQuantity.toString()),
        ratio: zksync.utils.tokenRatio(tokenRatio)
    });
    const resp = {op:"fillrequest",args: [orderId, fillOrder]}
    zigzagws.send(JSON.stringify(resp));
}

export async function broadcastfill(swapOffer, fillOrder) {
    const swap = await syncWallet.syncSwap({
        orders: [swapOffer, fillOrder],
        feeToken: 'ETH',
    });
    let receipt;
    try {
        receipt = await swap.awaitReceipt();
    } catch (e) {
        return {success: false, swap, receipt: null};
    }
    console.log(receipt);
    return {success: true, swap, receipt};
}

export async function cancelallorders() {
    // TODO: Send an on-chain transaction to cancel orders
    const msg = {op:"cancelall", args: [syncAccountState.id]};
    zigzagws.send(JSON.stringify(msg));
    return true;
}

export async function cancelorder(orderid) {
    // TODO: Send an on-chain transaction to cancel orders
    const msg = {op:"cancelorder", args: [orderid]};
    zigzagws.send(JSON.stringify(msg));
    return true;
}
