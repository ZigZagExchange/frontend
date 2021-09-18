import * as zksync from "zksync";
import { ethers } from "ethers";

//globals
let ethWallet;
let syncWallet;

// Websocket
const zigzagws = new WebSocket('ws://localhost:3004');
zigzagws.onopen = function () {
    const msg = JSON.stringify({op:'ping'})
    zigzagws.send(msg);
}
zigzagws.onmessage = function (e) {
  console.log('received: %s', e.data);
}

export async function signinzksync() {
    await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4' }],
    });

    const ethersProvider = new ethers.providers.Web3Provider(window.ethereum)
    const syncProvider = await zksync.getDefaultProvider("rinkeby");

    ethWallet = ethersProvider.getSigner()
    syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);
    
    // TODO: Display user's address after signin

    const syncAccountState = await syncWallet.getAccountState();
    
    // TODO: Use account info to display balances
    console.log("account state", syncAccountState)

    const signingKeySet = await syncWallet.isSigningKeySet();

    // TODO: Change text on Connect Wallet button to Set Signing Key if signing key is not set
    // TODO: Display Buy / Sell buttons if Signing Key is set
    console.log("Signing Key Set?", signingKeySet);

    // TODO: Delete this. It's only for testing
    await submitorder("ETH-USDT", "buy", 3700, 0.001)
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
    const validsides = ["buy","sell"];
    if (!validsides.includes(side)) {
        throw new Error("Invalid side");
    }
    const currencies = product.split('-');
    const tokenBuy = (side === "buy") ? currencies[0] : currencies[1];
    const tokenSell = (side === "sell") ? currencies[0] : currencies[1];
    const tokenRatio = {}
    tokenRatio[currencies[0]] = amount;
    tokenRatio[currencies[1]] = price*amount;
    const order = await syncWallet.getLimitOrder({
        tokenSell,
        tokenBuy,
        ratio: zksync.utils.tokenRatio(tokenRatio)
    });
    console.log("sending limit order", order);
    const msg = {op:"neworder", args: [order]};
    zigzagws.send(JSON.stringify(msg));
}
