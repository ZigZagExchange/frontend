import * as zksync from "zksync";
import { ethers } from "ethers";
import { toast } from 'react-toastify';

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
        }
    },
    "USDC": { 
        decimals: 6, 
        chain: { 
            1: { tokenId: 2 },
            1000: { tokenId: 2 },
        }
    },
    "USDT": { 
        decimals: 6, 
        chain: { 
            1: { tokenId: 4 },
            1000: { tokenId: 1 },
        }
    },
}

//globals
let ethersProvider;
let syncProvider;
let ethWallet;
let syncWallet;
let syncAccountState;

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
  const syncAccountState = await syncWallet.getAccountState();
  return syncAccountState;
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

  syncAccountState = await syncWallet.getAccountState();
  console.log("account state", syncAccountState);
  if (!syncAccountState.id) {
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
  const msg = { op: "login", args: [chainid, syncAccountState.id.toString()] };
  zigzagws.send(JSON.stringify(msg));

  return syncAccountState;
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
