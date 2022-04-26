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

  _accountState = {
    committed: {}
  };
  marketInfo = {};
  lastPrices = {};

  getAccountState = async () => {
    console.log(this._accountState);
    return this._accountState;
  };

  getProfile = async () => {
    return {};
  };

  submitOrder = async (
    market,
    side,
    price,
    baseAmount,
    quoteAmount,
    orderType
  ) => {
    const marketInfo = this.marketInfo[market];
    let amount;
    if (!baseAmount && quoteAmount) {
      amount = quoteAmount / price;
    } else if (baseAmount) {
      amount = baseAmount;
    } else {
      throw new Error("Invalid amount");
    }
    const amountBN = ethers.utils.parseUnits(
      amount.toString(),
      marketInfo.baseAsset.decimals
    );
    // check allowance first
    const tokenInfo = (side === "s") ? marketInfo.baseAsset : marketInfo.quoteAsset;
    price = Number(price);
    if (!price) throw new Error("Invalid price");

    if (!APIStarknetProvider.VALID_SIDES.includes(side)) {
      throw new Error("Invalid side");
    }

    // check account balance
    let balance = await this._accountState.committed.balances[tokenInfo.symbol];
    if (!balance) {
      balance = await this.getBalances()[tokenInfo.symbol];
      if (!balance) throw new Error("Can't get token balance")
    }
    const balanceBN = ethers.BigNumber.from(balance.value);
    if (balanceBN.lt(amountBN)) throw new Error("Can't sell more than account balance")

    let allowancesToast;
    try {
      allowancesToast = toast.info("Checking and setting allowances...", {
        autoClose: false,
        toastId: "Checking and setting allowances...",
      });

      const allowanceBN = ethers.BigNumber.from(balance.allowance);
      if (allowanceBN.lt(amountBN)) {
        const success = await this._setTokenApproval(
          tokenInfo.address,
          APIStarknetProvider.STARKNET_CONTRACT_ADDRESS,
          MAX_ALLOWANCE.toString()
        );
        if (!success) throw new Error("Error approving contract");
      }
      toast.dismiss(allowancesToast);
    } catch (e) {
      console.log(e)
      toast.dismiss(allowancesToast);
      throw new Error('Failed to set allowance')
    }

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
    let expiration; // starknet format unix * 100
    if (orderType === "limit") {
      expiration = ((Date.now() / 10) + 7 * 24 * 3600).toFixed(0);
    } else {
      expiration = ((Date.now() / 10) + 30).toFixed(0);
    }

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
        expiration: expiration
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

    let privateKey = this._accountState.privkey;
    if (!privateKey) {
      privateKey = localStorage.getItem("starknet:privkey");
      this._accountState.privkey = privateKey;
    }
    const keypair = starknet.ec.getKeyPair(privateKey);
    const signature = starknet.ec.sign(keypair, hash)
    ZZMessage.sig_r = signature[0]
    ZZMessage.sig_s = signature[1]

    this.api.send("submitorder2", [
      this.network,
      market,
      JSON.stringify(ZZMessage)
    ]);
  };

  signIn = async () => {
    let userWalletContractAddress;
    let keypair;
    let privateKey = localStorage.getItem("starknet:privkey")
    if (privateKey) {
      keypair = starknet.ec.getKeyPair(privateKey);
    } else {
      keypair = starknet.ec.genKeyPair();
      privateKey = keypair.getPrivate().toString()
      localStorage.setItem("starknet:privkey", privateKey);
    }
    this._accountState.privkey = privateKey;
    if (localStorage.getItem("starknet:account")) {
      userWalletContractAddress = localStorage.getItem("starknet:account");
      this._accountState.address = userWalletContractAddress;
      this._accountState.id = userWalletContractAddress;
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
      this._accountState.address = userWalletContractAddress.toString();
      this._accountState.id = userWalletContractAddress.toString();
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
      committedBalances = await this.getBalances();
    } catch (e) {
      toast.dismiss(balanceWaitToast);
      throw new Error(e);
    }
    toast.dismiss(balanceWaitToast);

    // Mint some tokens if the account is blank
    const results = Object.keys(committedBalances).map(async (currency) => {
      const minAmount = (currency === "ETH") ? 1 : 3000;
      const currentBalance = committedBalances[currency].valueReadable;

      if (Number(currentBalance) < minAmount) {
        const mintWaitToast = toast.info(
          `No ${currency} found. Minting you some...`,
          {
            autoClose: false,
            toastId: `No ${currency} found. Minting you some...`,
          }
        );
        try {
          const currencyInfo = this.getCurrencyInfo(currency);
          const newAmountBN = ethers.utils.parseUnits(
            minAmount.toString(),
            currencyInfo.decimals
          ).mul(25);
          await this._mintBalance(
            currencyInfo.address.toString(),
            newAmountBN.toString()
          );
          committedBalances[currency].valueReadable += minAmount * 25;
          const oldAmount = ethers.BigNumber.from(committedBalances[currency].balance);
          committedBalances[currency].balance = oldAmount.add(newAmountBN).toString();
        } catch (e) {
          console.log(`Error while minting tokens: ${e}`)
        }
        toast.dismiss(mintWaitToast);
      }
    });
    await Promise.all(results);

    this._accountState.address = userWalletContractAddress.toString();
    this._accountState.id = userWalletContractAddress.toString();
    this._accountState.committed = {
      balances: committedBalances
    }
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
    let privateKey = this._accountState.privkey;
    if (!privateKey) {
      privateKey = localStorage.getItem("starknet:privkey");
      this._accountState.privkey = privateKey;
    }
    const keypair = starknet.ec.getKeyPair(privateKey);
    const accountContract = new starknet.Account(
      starknet.defaultProvider,
      userWalletAddress,
      keypair
    );
    return accountContract;
  };

  _checkAccountInitialized = async () => {
    const userWalletAddress = this._accountState.address;
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

  getBalances = async () => {
    const balances = {};
    if (!this._accountState.address) return balances;

    const currencies = this.getCurrencies();
    const results = currencies.map(async (currency) => {
      const currencyInfo = this.getCurrencyInfo(currency);
      if (currencyInfo.address) {
        const [
          balance,
          allowance
        ] = await Promise.all([
          this._getBalance(currencyInfo.address),
          this._getTokenAllowance(currencyInfo.address)
        ]);
        balances[currency] = {
          value: balance,
          valueReadable: (
            balance &&
            currencyInfo &&
            balance / 10 ** currencyInfo.decimals
          ) || 0,
          allowance,
        };
      }
    })
    await Promise.all(results);

    // update accountState
    this._accountState.committed = {
      balances: balances,
    };
    return balances;
  };

  _getBalance = async (contractAddress) => {
    const userWalletAddress = this._accountState.address;
    if (!userWalletAddress) return '0';
    const erc20 = new starknet.Contract(starknetERC20ContractABI_test, contractAddress);
    const result = await erc20.balanceOf(userWalletAddress);
    const balance = starknet.uint256.uint256ToBN(result[0]);
    return balance.toString();
  };

  _mintBalance = async (contractAddress, amount) => {
    const userWalletAddress = this._accountState.address;
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
    if (!this._accountState.address) return allowances;

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
    if (!userWalletAddress) return '0';

    const erc20 = new starknet.Contract(starknetERC20ContractABI_test, erc20Address);
    const result = await erc20.allowance(
      userWalletAddress,
      spenderContractAddress
    );
    const allowance = starknet.uint256.uint256ToBN(result[0]);
    return allowance.toString();
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
