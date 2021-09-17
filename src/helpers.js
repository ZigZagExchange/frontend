import * as zksync from "zksync";
import { ethers } from "ethers";

const zigzagws = new WebSocket('ws://localhost:3004');

zigzagws.onopen = function () {
    const msg = JSON.stringify({op:'ping'})
    zigzagws.send(msg);
}

zigzagws.onmessage = function (e) {
  console.log('received: %s', e.data);
}

//globals
let ethWallet;
let syncWallet;

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
    await submitorder()
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


export async function submitorder() {
    const order = await syncWallet.getLimitOrder({
        tokenSell: 'ETH',
        tokenBuy: 'USDT',
        ratio: zksync.utils.tokenRatio({
            ETH: 0.01,
            USDT: 35,
        })
    });
    console.log("limit order", order);
}
