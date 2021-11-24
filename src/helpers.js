import * as zksync from "zksync";
import { ethers } from "ethers";
import { toast } from 'react-toastify';
//import { getStarknet } from "@argent/get-starknet"
import * as starknet from "starknet"
import bigInt from "big-integer";

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

export const currencyInfo = {
    "ETH": { 
        decimals: 18, 
        chain: { 
            1: { tokenId: 0 },
            1000: { tokenId: 0 },
            1001: { contractAddress: "0x06a75fdd9c9e376aebf43ece91ffb315dbaa753f9c0ddfeb8d7f3af0124cd0b6" },
        }
    },
    "USDC": { 
        decimals: 6, 
        chain: { 
            1: { tokenId: 2 },
            1000: { tokenId: 2 },
            1001: { contractAddress: "0x0545d006f9f53169a94b568e031a3e16f0ea00e9563dc0255f15c2a1323d6811" },
        }
    },
    "USDT": { 
        decimals: 6, 
        chain: { 
            1: { tokenId: 4 },
            1000: { tokenId: 1 },
            1001: { contractAddress: "0x03d3af6e3567c48173ff9b9ae7efc1816562e558ee0cc9abc0fe1862b2931d9a" },
        }
    },
}

//globals
let ethersProvider;
let syncProvider;
let ethWallet;
let syncWallet;
let accountState;

// Websocket
const zigzagws_url = process.env.REACT_APP_ZIGZAG_WS;
export const zigzagws = new WebSocket(zigzagws_url);

function pingServer() {
    zigzagws.send(JSON.stringify({op:"ping"}));
}
zigzagws.addEventListener("open", function () {
    setInterval(pingServer, 5000);
});
zigzagws.addEventListener("close", function () {
    toast.error("Connection to server closed. Please refresh the page", { autoClose: false });
});

export async function getAccountState() {
  const accountState = await syncWallet.getAccountState();
  return accountState;
}

export async function signin(chainid) {
    if (chainid === 1 || chainid === 1000) {
        return await signinzksync(chainid);
    }
    else if (chainid === 1001) {
        return await signinstarknet(chainid);
    }
}

export async function signinstarknet(chainid) {
    // check if wallet extension is installed and initialized. Shows a modal prompting the user to download ArgentX otherwise.
    // const starknet = getStarknet({ showModal: true })
    // const [userWalletContractAddress] = await starknet.enable() // may throws when no extension is detected
    // const userAddressInt = bigInt(userWalletContractAddress.slice(2), 16);
    const keypair = starknet.ec.genKeyPair();
    localStorage.setItem("starknet-priv", keypair.getPrivate('hex'));
    const pubkey = keypair.getPublic();
    //const starknetAccountContract = fs.readFileSync

    //const balanceWaitToast = toast.info("Waiting on balances to load...", { autoClose: false });
    //const committedBalances = await getStarknetBalances(chainid, userWalletContractAddress);
    //toast.dismiss(balanceWaitToast);

    //// check if connection was successful
    //if(starknet.isConnected) {
    //    // If the extension was installed and successfully connected, you have access to a starknet.js Signer object to do all kind of requests through the users wallet contract.
    //    //starknet.signer.invokeFunction({ ... })
    //    console.log("starknet connected")
    //} else {
    //    // In case the extension wasn't successfully connected you still have access to a starknet.js Provider to read starknet states and sent anonymous transactions
    //    //starknet.provider.callContract( ... )
    //    console.error("starknet not connected")
    //}
    //accountState = { 
    //    address: userWalletContractAddress, 
    //    id: userAddressInt, 
    //    committed: {
    //        balances: committedBalances
    //    }
    //}
    //return accountState;
}

export async function getStarknetBalances(chainid, userAddress) {
    const balances = {};
    for (let currency in currencyInfo) {
        const balance = await getStarknetBalance(currencyInfo[currency].chain[chainid].contractAddress, userAddress);
        balances[currency] = balance;
    }
    return balances;
}

export async function getStarknetBalance(contractAddress, userAddress) {
    const userAddressInt = bigInt(userAddress.slice(2), 16);
    const url = `https://voyager.online/api/contract/${contractAddress}/function/balance_of`;
    const balancesReq = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "calldata":{
                "account": userAddressInt.toString()
            },
            "signature":[]
        })
    })
    let balance;
    try {
        const balanceJson = await balancesReq.json()
        balance = bigInt(balanceJson.result.res.slice(2), 16);
    }
    catch (e) {
        console.error(e);
        balance = bigInt(0);
    }
    return balance;
}

export async function signinzksync(chainid) {
  if (!window.ethereum) {
    // TODO: Display a message that says Please download and unlock Metamask to continue
    window.open("https://metamask.io", "_blank");
    return;
  }

  await window.ethereum.enable();

  let ethereumChainId;
  let ethereumChainName;
  switch (chainid) {
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
      toast.warn("Your version of Metamask doesn't support automated chain switching. Please switch to the required chain manually")
  }

  ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
  syncProvider = await zksync.getDefaultProvider(ethereumChainName);

  ethWallet = ethersProvider.getSigner();
  syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);

  accountState = await syncWallet.getAccountState();
  console.log("account state", accountState);
  if (!accountState.id) {
    throw new Error(
      "Account not found. Please use the Wallet to deposit funds before trying again."
    );
  }

  const signingKeySet = await syncWallet.isSigningKeySet();
  if (!signingKeySet) {
    if (chainid === 1) {
        toast.info("You need to sign a one-time transaction to activate your zksync account. The fee for this tx will be ~0.003 ETH (~$15)");
    }
    else if (chainid === 1000) {
        toast.info("You need to sign a one-time transaction to activate your zksync account.");
    }
    await changepubkeyzksync();
  }
  const msg = { op: "login", args: [chainid, accountState.id.toString()] };
  zigzagws.send(JSON.stringify(msg));

  return accountState;
}

export async function changepubkeyzksync() {
  const changePubkey = await syncWallet.setSigningKey({
    feeToken: "ETH",
    ethAuthType: "ECDSALegacyMessage",
  });
  const receipt = await changePubkey.awaitReceipt();
  console.log(receipt);
}

export async function submitorder(chainId, product, side, price, amount) {
    if (chainId === 1 || chainId === 1000) {
        return await submitorderzksync(chainId, product, side, price, amount);
    }
    else if (chainId === 1001) {
        return await submitorderstarknet(chainId, product, side, price, amount);
    }
}

export async function submitorderstarknet(chainId, product, side, price, amount) {
    const expiration = Date.now() + 86400;
    const orderhash = starknetOrderHash(chainId, product, side, price, amount, expiration);
    console.log(orderhash);
    const sig = starknet.ec.sign(orderhash);

    const baseCurrency = product.split("-")[0];
    const quoteCurrency = product.split("-")[0];
    const baseAsset = currencyInfo[baseCurrency].chain[chainId].contractAddress;
    const quoteAsset = currencyInfo[quoteCurrency].chain[chainId].contractAddress;

    const starknetOrder = [chainId, accountState.address, baseAsset, quoteAsset, side, amount, price, expiration, sig.r, sig.s];
    const msg = { op: "submitorder", args: [chainId, starknetOrder] };
    zigzagws.send(JSON.stringify(msg));
}

export async function starknetOrderHash(chainId, product, side, price, amount, expiration) {
    const baseCurrency = product.split("-")[0];
    const quoteCurrency = product.split("-")[0];
    const baseAssetInt = bigInt(currencyInfo[baseCurrency].chain[chainId].contractAddress.slice(2), 16);
    const quoteAssetInt = bigInt(currencyInfo[quoteCurrency].chain[chainId].contractAddress.slice(2), 16);
    const priceInt = bigInt(price);
    const sideInt = bigInt(side === 'b' ? 0: 1);
    const baseQuantityInt = bigInt(amount * Math.pow(currencyInfo[baseCurrency].decimals, 10));
    let orderhash = starknet.hash.pedersen([bigInt(chainId), accountState.id]);
    orderhash = starknet.hash.pedersen([orderhash, baseAssetInt]);
    orderhash = starknet.hash.pedersen([orderhash, quoteAssetInt]);
    orderhash = starknet.hash.pedersen([orderhash, sideInt]);
    orderhash = starknet.hash.pedersen([orderhash, baseQuantityInt]);
    orderhash = starknet.hash.pedersen([orderhash, priceInt]);
    orderhash = starknet.hash.pedersen([orderhash, expiration]);
    return orderhash;
}

export async function submitorderzksync(chainId, product, side, price, amount) {
  const currencies = product.split("-");
  const baseCurrency = currencies[0];
  const quoteCurrency = currencies[1];
  if (baseCurrency === "USDC" || baseCurrency === "USDT") {
      amount = parseFloat(amount).toFixed(7).slice(0,-1);
  }
  price = parseFloat(price).toPrecision(8);
  const validsides = ["b", "s"];
  if (!validsides.includes(side)) {
    throw new Error("Invalid side");
  }
  if (amount < 0.0001) {
    throw new Error("Quantity must be atleast 0.0001");
  }
  let tokenBuy, tokenSell, sellQuantity;
  if (side === "b") {
    tokenBuy = currencies[0];
    tokenSell = currencies[1];
    sellQuantity = (amount * price).toPrecision(6);
  } else if (side === "s") {
    tokenBuy = currencies[1];
    tokenSell = currencies[0];
    sellQuantity = parseFloat(amount).toPrecision(6);
  }
  const tokenRatio = {};
  tokenRatio[baseCurrency] = 1;
  tokenRatio[quoteCurrency] = price;
  const now_unix = Date.now() / 1000 | 0;
  const three_minute_expiry = now_unix + 180;
  const order = await syncWallet.getOrder({
    tokenSell,
    tokenBuy,
    amount: syncProvider.tokenSet.parseToken(
      tokenSell,
      sellQuantity
    ),
    ratio: zksync.utils.tokenRatio(tokenRatio),
    validUntil: three_minute_expiry
  });
  console.log("sending limit order", order);
  const msg = { op: "submitorder", args: [chainId, order] };
  zigzagws.send(JSON.stringify(msg));
}

export async function sendfillrequest(orderreceipt) {
  const chainId = orderreceipt[0];
  const orderId = orderreceipt[1];
  const market = orderreceipt[2];
  const baseCurrency = market.split("-")[0];
  const quoteCurrency = market.split("-")[1];
  const side = orderreceipt[3];
  let price = orderreceipt[4];
  const baseQuantity = orderreceipt[5];
  const quoteQuantity = orderreceipt[6];
  let tokenSell, tokenBuy, sellQuantity;
  if (side === "b") {
    price = price * 0.9997; // Add a margin of error to price
    tokenSell = baseCurrency;
    tokenBuy = quoteCurrency;
    sellQuantity = baseQuantity.toPrecision(8);
  } else if (side === "s") {
    price = price * 1.0003; // Add a margin of error to price
    tokenSell = quoteCurrency;
    tokenBuy = baseCurrency;
    sellQuantity = (quoteQuantity * 1.0001).toFixed(6); // Add a margin of error to sellQuantity
  }
  const tokenRatio = {};
  tokenRatio[baseCurrency] = 1;
  tokenRatio[quoteCurrency] = parseFloat(price.toFixed(6));
  console.log(sellQuantity, tokenRatio);
  const fillOrder = await syncWallet.getOrder({
    tokenSell,
    tokenBuy,
    amount: syncProvider.tokenSet.parseToken(
      tokenSell,
      sellQuantity
    ),
    ratio: zksync.utils.tokenRatio(tokenRatio),
  });
  const resp = { op: "fillrequest", args: [chainId, orderId, fillOrder] };
  zigzagws.send(JSON.stringify(resp));
}

export async function broadcastfill(swapOffer, fillOrder) {
  const swap = await syncWallet.syncSwap({
    orders: [swapOffer, fillOrder],
    feeToken: "ETH",
  });
  let receipt;
  try {
    receipt = await swap.awaitReceipt();
  } catch (e) {
    return { success: false, swap, receipt: null };
  }
  console.log(receipt);
  return { success: true, swap, receipt };
}

export async function cancelallorders(chainid, userid) {
  // TODO: Send an on-chain transaction to cancel orders
  const msg = { op: "cancelall", args: [chainid, userid.toString()] };
  zigzagws.send(JSON.stringify(msg));
  return true;
}

export async function cancelorder(chainid, orderid) {
  // TODO: Send an on-chain transaction to cancel orders
  const msg = { op: "cancelorder", args: [chainid, orderid] };
  zigzagws.send(JSON.stringify(msg));
  return true;
}
