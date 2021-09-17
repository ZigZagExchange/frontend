import * as zksync from "zksync";
import { ethers } from "ethers";

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

    const syncAccountState = await syncWallet.getAccountState();
    
    // TODO: Use account info to display balances
    console.log("account state", syncAccountState)


    if (! await syncWallet.isSigningKeySet()) {
        const changePubkey = await syncWallet.setSigningKey({
            feeToken: "ETH",
            fee: ethers.utils.parseEther("0.001"),
            ethAuthType: "ECDSA"
        });
        const receipt = await changePubkey.awaitReceipt();
        console.log(receipt)
    }

    await submitorder()
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
