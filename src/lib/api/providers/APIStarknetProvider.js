import * as starknet from "starknet";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import starknetAccountContractV1 from "lib/contracts/StarkNet_Account_v1.json";
import starknetERC20ContractABI_test from "lib/contracts/StarkNet_ERC20_test.json";
import APIProvider from "./APIProvider";
import {
  STARKNET_DOMAIN_TYPE_HASH,
  ORDER_TYPE_HASH,
  MAX_ALLOWANCE
} from "../constants";

export default class APIStarknetProvider extends APIProvider {
  static VALID_SIDES = ["b", "s"];
  static STARKNET_CONTRACT_ADDRESS =
    "0x02aa8af6fb8e6ab7d07ad94d0b3b9bb6010fe7258b8d23eced19ba0ccbb68d1a";

  _accountState = {};
  marketInfo = {};
  lastPrices = {};

  getAccountState = async () => {
    return this._accountState;
  };

  getProfile = async () => {
    return {};
  };

  getBalances = async () => {
    const state = await this.getAccountState();
    return (state?.committed?.balance) ? state.committed.balance : {};
  };

  submitOrder = async (market, side, price, baseAmount, quoteAmount) => {
    if (!APIStarknetProvider.VALID_SIDES.includes(side)) {
      throw new Error("Invalid side");
    }
    if (!baseAmount && quoteAmount) {
      baseAmount = quoteAmount / price;
    }

    const marketInfo = this.marketInfo[market];
    // check allowance first
    const tokenInfo = side === "s" ? marketInfo.baseAsset : marketInfo.quoteAsset;
    const allowancesToast = toast.info("Checking and setting allowances", {
      autoClose: false,
      toastId: "Checking and setting allowances",
    });
    const allowance = await this._getTokenAllowance(
      tokenInfo.address,
      APIStarknetProvider.STARKNET_CONTRACT_ADDRESS
    );

    let amountBN = ethers.BigNumber.from(baseAmount)
      .mul((10 ** tokenInfo.decimals).toFixed(0))
      .mul('1.01');

    if (allowance.lt(amountBN)) {
      const success = await this._setTokenApproval(
        tokenInfo.address,
        APIStarknetProvider.STARKNET_CONTRACT_ADDRESS,
        MAX_ALLOWANCE.toString()
      );
      if (!success) throw new Error("Error approving contract");
    }
    toast.dismiss(allowancesToast);

    // get values
    const baseAssetAddress = marketInfo.baseAsset.address;
    const quoteAssetAddress = marketInfo.quoteAsset.address;
    const sideInt = (side === "b") ? '0' : '1';
    const getFraction = (decimals) => {
      let denominator = 1;
      for (; (decimals * denominator) % 1 !== 0; denominator++);
      return { numerator: decimals * denominator, denominator }
    }
    const priceRatio = getFraction(price);
    const expiration = Date.now() + 86400;

    // build order msg
    const ZZMessage = {
      message_prefix: "StarkNet Message",
      domain_prefix: {
        name: 'zigzag.exchange',
        version: '1',
        chain_id: 'SN_GOERLI'
      },
      sender: this._accountState.address.toString(),
      order: {
        base_asset: baseAssetAddress.toString(),
        quote_asset: quoteAssetAddress.toString(),
        side: sideInt,
        base_quantity: amountBN.toString(),
        price: {
          numerator: priceRatio.numerator.toString(),
          denominator: priceRatio.denominator.toString()
        },
        expiration: expiration.toString()
      }
    }

    const stringToFelt = (text) => {
      const bufferText = Buffer.from(text, 'utf8');
      const hexString = '0x' + bufferText.toString('hex');
      return starknet.number.toFelt(hexString)
    }

    let hash = starknet.hash.pedersen([
      stringToFelt(ZZMessage.message_prefix),
      STARKNET_DOMAIN_TYPE_HASH
    ])
    hash = starknet.hash.pedersen([hash, stringToFelt(ZZMessage.domain_prefix.name)])
    hash = starknet.hash.pedersen([hash, ZZMessage.domain_prefix.version])
    hash = starknet.hash.pedersen([hash, stringToFelt(ZZMessage.domain_prefix.chain_id)])
    hash = starknet.hash.pedersen([hash, ZZMessage.sender])
    hash = starknet.hash.pedersen([hash, ORDER_TYPE_HASH])
    hash = starknet.hash.pedersen([hash, ZZMessage.order.base_asset])
    hash = starknet.hash.pedersen([hash, ZZMessage.order.quote_asset])
    hash = starknet.hash.pedersen([hash, ZZMessage.order.side])
    hash = starknet.hash.pedersen([hash, ZZMessage.order.base_quantity])
    hash = starknet.hash.pedersen([hash, ZZMessage.order.price.numerator])
    hash = starknet.hash.pedersen([hash, ZZMessage.order.price.denominator])
    hash = starknet.hash.pedersen([hash, ZZMessage.order.expiration])

    const privateKey = starknet.ec.ec.keyFromPrivate(
      localStorage.getItem("starknet:privkey"),
      "hex"
    );
    const starkKey = starknet.ec.ec.keyFromPrivate(privateKey.toString(), 'hex');
    const signature = starknet.ec.sign(starkKey, hash)
    ZZMessage.sig_r = signature[0]
    ZZMessage.sig_s = signature[1]

    this.api.send("submitorder2", [this.network, market, ZZMessage]);
  };

  signIn = async () => {
    let userWalletContractAddress;
    let keypair;

    if (localStorage.getItem("starknet:privkey")) {
      keypair = starknet.ec.ec.keyFromPrivate(
        localStorage.getItem("starknet:privkey"),
        "hex"
      );
    } else {
      keypair = starknet.ec.genKeyPair();
      localStorage.setItem("starknet:privkey", keypair.getPrivate("hex"));
    }
    if (localStorage.getItem("starknet:account")) {
      userWalletContractAddress = localStorage.getItem("starknet:account");
      this._accountState = {
        address: userWalletContractAddress,
        id: userWalletContractAddress
      }
    } else {
      const starkkey = starknet.ec.getStarkKey(keypair);
      const deployContractToast = toast.info(
        "First time using Zigzag Starknet. Deploying account contract...",
        {
          autoClose: false,
          toastId:
            "First time using Zigzag Starknet. Deploying account contract...",
        }
      );
      const deployContractResponse = await starknet.defaultProvider.deployContract({
        contract: starknetAccountContractV1,
        addressSalt: starkkey,
      });
      await starknet.defaultProvider.waitForTransaction(deployContractResponse.transaction_hash);
      toast.dismiss(deployContractToast);
      userWalletContractAddress = deployContractResponse.address;
      toast.success("Account contract deployed");
      localStorage.setItem("starknet:account", userWalletContractAddress);
      this._accountState = {
        address: userWalletContractAddress.toString(),
        id: userWalletContractAddress.toString()
      }
    }

    // Check account initialized
    const initialized = await this._checkAccountInitialized();
    if (!initialized) {
      const initializeContractToast = toast.info(
        "Your account contract is not yet initialized. Initializing account contract...",
        {
          autoClose: false,
          toastId:
            "Your account contract is not yet initialized. Initializing account contract...",
        }
      );
      await this._initializeAccount(starknet.ec.getStarkKey(keypair));
      toast.dismiss(initializeContractToast);
    }

    const balanceWaitToast = toast.info("Waiting on balances to load...", {
      autoClose: false,
      toastId: "Waiting on balances to load...",
    });
    let committedBalances;
    try {
      committedBalances = await this._getBalances();
    } catch (e) {
      toast.dismiss(balanceWaitToast);
      throw new Error(e);
    }
    toast.dismiss(balanceWaitToast);

    console.log(committedBalances)
    // Mint some tokens if the account is blank
    const results = Object.keys(committedBalances).map(async (currency) => {
      const minAmount = (currency === "ETH")
        ? ethers.BigNumber.from(1).mul((10 ** 18).toString())
        : ethers.BigNumber.from(3000).mul((10 ** 6).toString())

      const currentBalance = ethers.BigNumber.from(committedBalances[currency])

      console.log(minAmount.toString())
      console.log(currentBalance.toString())
      if (minAmount.lte(currentBalance)) {
        const mintWaitToast = toast.info(
          `No ${currency} found. Minting you some...`,
          {
            autoClose: false,
            toastId: `No ${currency} found. Minting you some...`,
          }
        );
        try {
          await this._mintBalance(
            this.getCurrencyInfo(currency).address.toString(),
            minAmount.mul(25)
          );
          committedBalances[currency] = currentBalance.add(minAmount).toString();
        } catch (e) {
          console.log(`Error while minting tokens: ${e.message}`)
        }
        toast.dismiss(mintWaitToast);
      }
    });
    await Promise.all(results);

    this._accountState = {
      address: userWalletContractAddress.toString(),
      id: userWalletContractAddress.toString(),
      committed: {
        balances: committedBalances,
      },
    };

    return await this.api.getAccountState();
  };

  getPairs = () => {
    return Object.keys(this.lastPrices);
  };

  cacheMarketInfoFromNetwork = async (pairs) => {
    if (pairs.length === 0) return;
    if (!this.network) return;
    const pairText = pairs.join(",");
    const url = `https://secret-thicket-93345.herokuapp.com/api/v1/marketinfos?chain_id=${this.network}&market=${pairText}`;
    const marketInfoArray = await fetch(url).then((r) => r.json());
    if (!(marketInfoArray instanceof Array)) return;
    marketInfoArray.forEach((info) => (this.marketInfo[info.alias] = info));
    return;
  };

  getCurrencies = () => {
    const tickers = new Set();
    for (let market in this.lastPrices) {
      tickers.add(this.lastPrices[market][0].split("-")[0]);
      tickers.add(this.lastPrices[market][0].split("-")[1]);
    }
    return [...tickers];
  };

  getCurrencyInfo = (currency) => {
    const pairs = this.getPairs();
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const baseCurrency = pair.split("-")[0];
      const quoteCurrency = pair.split("-")[1];
      if (baseCurrency === currency && this.marketInfo[pair]) {
        return this.marketInfo[pair].baseAsset;
      } else if (quoteCurrency === currency && this.marketInfo[pair]) {
        return this.marketInfo[pair].quoteAsset;
      }
    }
    return null;
  }

  _getUserAccount = async () => {
    const userWalletAddress = this._accountState.address;
    const privateKey = starknet.ec.ec.keyFromPrivate(
      localStorage.getItem("starknet:privkey"),
      "hex"
    );
    const starkKey = starknet.ec.ec.keyFromPrivate(privateKey.toString(), 'hex');
    const accountContract = new starknet.Account(
      starknet.defaultProvider,
      userWalletAddress,
      starkKey
    );
    return accountContract;
  };

  _checkAccountInitialized = async () => {
    const userWalletAddress = this._accountState.address;
    console.log(`userWalletAddress: ${userWalletAddress}`)
    const accountContract = new starknet.Contract(
      starknetAccountContractV1.abi,
      userWalletAddress
    );
    const signer = await accountContract.get_signer();
    return (signer.toString() !== '0');
  };

  _initializeAccount = async (starkKey) => {
    const userWalletAddress = this._accountState.address;
    const accountContract = new starknet.Contract(
      starknetAccountContractV1.abi,
      userWalletAddress
    );
    const { transaction_hash: txHash } = await accountContract.initialize(
      starkKey,
      "0"
    );
    return starknet.defaultProvider.waitForTransaction(txHash);
  };

  _getBalances = async () => {
    const balances = {};
    const currencies = this.getCurrencies();
    console.log(currencies)
    const results = currencies.map(async (currency) => {
      const contractAddress = this.getCurrencyInfo(currency).address;
      if (contractAddress) {
        let balance = await this._getBalance(contractAddress);
        console.log(`Balance for ${currency} is ${balance}`);
        balances[currency] = balance;
      }
    })
    await Promise.all(results);

    // update accountState
    this._accountState = {
      committed: {
        balances: balances,
      },
    };
    return balances;
  };

  _getBalance = async (contractAddress) => {
    const userWalletAddress = this._accountState.address;
    console.log(userWalletAddress)
    console.log(contractAddress)
    const erc20 = new starknet.Contract(starknetERC20ContractABI_test, contractAddress);
    const balance = await erc20.balanceOf(userWalletAddress);
    return starknet.number.toBN(balance.res, 16).toString();
  };

  _mintBalance = async (contractAddress, amount) => {
    const userWalletAddress = this._accountState.address;
    console.log(userWalletAddress)
    console.log(amount)
    const erc20 = new starknet.Contract(starknetERC20ContractABI_test, contractAddress);
    const { transaction_hash: mintTxHash } = await erc20.mint(
      userWalletAddress,
      starknet.uint256.bnToUint256(amount)
    );
    await starknet.defaultProvider.waitForTransaction(mintTxHash);
  };

  _getAllowances = async (
    spenderContractAddress = APIStarknetProvider.STARKNET_CONTRACT_ADDRESS
  ) => {
    const allowances = {};
    const currencies = this.getCurrencies();
    const results = currencies.map(async (currency) => {
      const contractAddress = this.getCurrencyInfo(currency).address;
      let allowance = await this._getTokenAllowance(
        contractAddress,
        spenderContractAddress
      );
      allowances[currency] = allowance.toString();
    })
    await Promise.all(results);
    return allowances;
  };

  _getTokenAllowance = async (
    erc20Address,
    spenderContractAddress = APIStarknetProvider.STARKNET_CONTRACT_ADDRESS
  ) => {
    const userWalletAddress = this._accountState.address;
    const erc20 = new starknet.Contract(starknetERC20ContractABI_test, erc20Address);
    const allowance = await erc20.allowance(
      userWalletAddress,
      spenderContractAddress
    );
    return starknet.number.toBN(allowance.res, 16);
  };

  _setTokenApproval = async (
    erc20Address,
    spenderContractAddress = APIStarknetProvider.STARKNET_CONTRACT_ADDRESS,
    amount
  ) => {
    const userAccount = await this._getUserAccount();
    const { code, transaction_hash } = await userAccount.execute(
      {
        contractAddress: erc20Address,
        entrypoint: 'approve',
        calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
          starknet.number.toBN(spenderContractAddress.toString()), // address decimal
          Object.values(starknet.uint256.bnToUint256(amount.toString())),
        ].flatMap((x) => x)),
      },
      undefined,
      { maxFee: '0' }
    );

    if (code !== 'TRANSACTION_RECEIVED') return false;
    await starknet.defaultProvider.waitForTransaction(transaction_hash);
    return true;
  };
}
