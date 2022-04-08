import * as starknet from "starknet";
import { toast } from "react-toastify";
import bigInt from "big-integer";
import starknetAccountContract from "lib/contracts/Account.json";
import APIProvider from "./APIProvider";

export default class APIStarknetProvider extends APIProvider {
  static STARKNET_CONTRACT_ADDRESS =
    "0x074f861a79865af1fb77af6197042e8c73147e28c55ac61e385ac756f89b33d6";
  _accountState = {};
  _marketInfo = {};

  getAccountState = async () => {
    return this._accountState;
  };

  getProfile = async () => {
    return {};
  };

  getBalances = async () => {
    return {};
  };

  submitOrder = async (market, side, price, baseAmount, quoteAmount) => {
    const marketInfo = this._marketInfo[market];
    // check allowance first
    const tokenInfo = side === "s" ? marketInfo.baseAsset : marketInfo.quoteAsset;
    const allowancesToast = toast.info("Checking and setting allowances", {
      autoClose: false,
      toastId: "Checking and setting allowances",
    });
    const allowance = await this._getTokenAllowance(
      tokenInfo.address,
      this._accountState.address,
      APIStarknetProvider.STARKNET_CONTRACT_ADDRESS
    );
    let minAmountInt = bigInt(1e20 * 10 ** tokenInfo.decimals);
    let amountInt = bigInt(1e21 * 10 ** tokenInfo.decimals);
    if (allowance.compare(minAmountInt) === -1) {
      await this._setTokenApproval(
        tokenInfo.address,
        this._accountState.address,
        APIStarknetProvider.STARKNET_CONTRACT_ADDRESS,
        amountInt.toString()
      );
    }
    toast.dismiss(allowancesToast);

    if (!baseAmount && quoteAmount) {
      baseAmount = quoteAmount / price;
    }
    const expiration = Date.now() + 86400;
    const domainPrefix = this._createStarkNetDomainHash();
    const order = this._createOrderHash(
      marketInfo,
      side,
      price,
      amount,
      expiration
    );
    const ZZMessage = _createZZMessageHash(
      domainPrefix,
      order
    );

    const keypair = starknet.ec.ec.keyFromPrivate(
      localStorage.getItem("starknet:privkey"),
      "hex"
    );
    const sig = starknet.ec.sign(keypair, ZZMessage.hash);

    ZZMessage.push(sig.r.toString(), sig.s.toString());

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
    } else {
      const starkkey = starknet.ec.getStarkKey(keypair);
      const starkkeyint = bigInt(starkkey.slice(2), 16);
      const deployContractToast = toast.info(
        "First time using Zigzag Starknet. Deploying account contract...",
        {
          autoClose: false,
          toastId:
            "First time using Zigzag Starknet. Deploying account contract...",
        }
      );
      const deployContractResponse =
        await starknet.defaultProvider.deployContract(starknetAccountContract, [
          starkkeyint.toString(),
        ]);
      toast.dismiss(deployContractToast);
      userWalletContractAddress = deployContractResponse.address;
      toast.success("Account contract deployed");
      localStorage.setItem("starknet:account", userWalletContractAddress);
    }

    // Check account initialized
    const initialized = await this._checkAccountInitialized(
      userWalletContractAddress
    );
    if (!initialized) {
      await this._initializeAccount(userWalletContractAddress);
    }

    this.api.send("login", [this.network, userWalletContractAddress]);

    const balanceWaitToast = toast.info("Waiting on balances to load...", {
      autoClose: false,
      toastId: "Waiting on balances to load...",
    });
    let committedBalances;
    try {
      committedBalances = await this._getBalances(userWalletContractAddress);
    } catch (e) {
      toast.dismiss(balanceWaitToast);
      throw new Error(e);
    }
    toast.dismiss(balanceWaitToast);

    // Mint some tokens if the account is blank
    for (let currency in committedBalances) {
      if (committedBalances[currency].compare(0) === 0) {
        toast.info(`No ${currency} found. Minting you some`, {
          toastId: `No ${currency} found. Minting you some`,
        });
        let amount;
        if (currency === "ETH") {
          amount = bigInt(1e18).toString();
        } else {
          amount = bigInt(5e9).toString();
        }
        await this._mintBalance(
          this.getCurrencyInfo().contractAddress,
          userWalletContractAddress,
          amount
        );
        committedBalances[currency] = amount;
      }
    }

    this._accountState = {
      address: userWalletContractAddress,
      id: userWalletContractAddress,
      committed: {
        balances: committedBalances,
      },
    };

    return this._accountState;
  };

  getPairs = () => {
    return Object.keys(this.lastPrices);
  };

  cacheMarketInfoFromNetwork = async (pairs) => {
    if (pairs.length === 0) return;
    if (!this.network) return;
    const pairText = pairs.join(",");
    const url = `https://zigzag-markets.herokuapp.com/markets?id=${pairText}&chainid=${this.network}`;
    const marketInfoArray = await fetch(url).then((r) => r.json());
    if (!(marketInfoArray instanceof Array)) return;
    marketInfoArray.forEach((info) => (this._marketInfo[info.alias] = info));
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

  getCurrencyInfo(currency) {
    const pairs = this.getPairs();
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const baseCurrency = pair.split("-")[0];
      const quoteCurrency = pair.split("-")[1];
      if (baseCurrency === currency && this._marketInfo[pair]) {
        return this._marketInfo[pair].baseAsset;
      } else if (quoteCurrency === currency && this._marketInfo[pair]) {
        return this._marketInfo[pair].quoteAsset;
      }
    }
    return null;
  }

  _checkAccountInitialized = async (userWalletContractAddress) => {
    try {
      await starknet.defaultProvider.callContract({
        contract_address: userWalletContractAddress,
        entry_point_selector:
          starknet.stark.getSelectorFromName("assert_initialized"),
        calldata: [],
      });
      return true;
    } catch (e) {
      return false;
    }
  };

  _initializeAccount = async (userAddress) => {
    const userAddressInt = bigInt(userAddress.slice(2), 16);
    const result = await starknet.defaultProvider.addTransaction({
      type: "INVOKE_FUNCTION",
      contract_address: userAddress,
      entry_point_selector: starknet.stark.getSelectorFromName("initialize"),
      calldata: [userAddressInt.toString()],
    });

    return result;
  };

  _getBalances = async (userAddress) => {
    const balances = {};
    const currencies = this.getCurrencies();
    for (let currency in currencies) {
      const contractAddress = this.getCurrencyInfo().address;
      if (contractAddress) {
        let balance = await this._getBalance(contractAddress, userAddress);
        balances[currency] = balance;
      }
    }
    return balances;
  };

  _getBalance = async (contractAddress, userAddress) => {
    const userAddressInt = bigInt(userAddress.slice(2), 16);
    const balanceJson = await starknet.defaultProvider.callContract({
      contract_address: contractAddress,
      entry_point_selector: starknet.stark.getSelectorFromName("balance_of"),
      calldata: [userAddressInt.toString()],
    });
    const balance = bigInt(balanceJson.result[0].slice(2), 16);
    return balance;
  };

  _mintBalance = async (contractAddress, userAddress, amount) => {
    const userAddressInt = bigInt(userAddress.slice(2), 16);
    await starknet.defaultProvider.addTransaction({
      type: "INVOKE_FUNCTION",
      contract_address: contractAddress,
      entry_point_selector: starknet.stark.getSelectorFromName("mint"),
      calldata: [userAddressInt.toString(), amount, "0"],
    });
    return true;
  };

  _getAllowances = async (userAddress, spender) => {
    const allowances = {};
    const currencies = this.getCurrencies();
    for (let currency in currencies) {
      const contractAddress = this.getCurrencyInfo().address;
      let allowance = await this._getTokenAllowance(
        contractAddress,
        userAddress,
        spender
      );
      allowances[currency] = allowance;
    }
    return allowances;
  };

  _getTokenAllowance = async (tokenAddress, userAddress, spender) => {
    const contractAddressInt = bigInt(spender.slice(2), 16);
    const userAddressInt = bigInt(userAddress.slice(2), 16);
    const allowanceJson = await starknet.defaultProvider.callContract({
      contract_address: tokenAddress,
      entry_point_selector: starknet.stark.getSelectorFromName("allowance"),
      calldata: [userAddressInt.toString(), contractAddressInt],
    });
    const allowance = bigInt(allowanceJson.result[0].slice(2), 16);
    return allowance;
  };

  _setTokenApproval = async (tokenAddress, userAddress, spender, amount) => {
    const keypair = starknet.ec.ec.keyFromPrivate(
      localStorage.getItem("starknet:privkey"),
      "hex"
    );
    const spenderInt = bigInt(spender.slice(2), 16);
    const localSigner = new starknet.Signer(
      starknet.defaultProvider,
      userAddress,
      keypair
    );
    return localSigner.addTransaction({
      type: "INVOKE_FUNCTION",
      contract_address: tokenAddress,
      entry_point_selector: starknet.stark.getSelectorFromName("approve"),
      calldata: [spenderInt.toString(), amount, "0"],
    });
  };

  _createStarkNetDomainHash = () => {
    const name = "zigzag.exchange";
    const veriosn = 1;
    const chianId = "SN_GOERLI";

    let orderhash = starknet.hash.pedersen(name);
    orderhash = starknet.hash.pedersen([orderhash, veriosn]);
    orderhash = starknet.hash.pedersen([orderhash, chianId]);

    const starkNet_Domain = [
      name,
      veriosn,
      chianId
    ]
    return { hash: orderhash, starkNet_Domain: starkNet_Domain };
  }

  _createOrderHash = (marketInfo, side, price, amount, expiration) => {
    const baseAssetAddress = marketInfo.baseAsset.address;
    const quoteAssetAddress = marketInfo.quoteAsset.address;

    const getFraction = (decimals) => {
      let denominator = 1;
      for (; (decimals * denominator) % 1 !== 0; denominator++);
      return { numerator: decimals * denominator, denominator }
    }
    const priceRatio = getFraction(price);

    const sideInt = side === "b" ? 0 : 1;
    const baseQuantityInt = (
      amount * (10 ** marketInfo.baseAsset.decimals)
    ).toFixed(0);

    let orderhash = starknet.hash.pedersen(baseAssetAddress);
    orderhash = starknet.hash.pedersen([orderhash, quoteAssetAddress]);
    orderhash = starknet.hash.pedersen([orderhash, sideInt]);
    orderhash = starknet.hash.pedersen([orderhash, baseQuantityInt]);
    orderhash = starknet.hash.pedersen([orderhash, priceRatio.numerator]);
    orderhash = starknet.hash.pedersen([orderhash, priceRatio.denominator]);
    orderhash = starknet.hash.pedersen([orderhash, expiration]);

    const starknetOrder = [
      baseAssetAddress,
      quoteAssetAddress,
      sideInt.toString(),
      baseQuantityInt.toString(),
      priceRatio.numerator.toString(),
      priceRatio.denominator.toString(),
      expiration.toString(),
    ];
    return { hash: orderhash, order: starknetOrder };
  };

  _createZZMessageHash = (domainPrefix, order) => {
    const sender = this._accountState.address;

    let orderhash = starknet.hash.pedersen("StarkNet Message"); // message_prefix
    orderhash = starknet.hash.pedersen([orderhash, domainPrefix.hash]);
    orderhash = starknet.hash.pedersen([orderhash, sender]);
    orderhash = starknet.hash.pedersen([orderhash, order.hash]);

    const ZZMessage = [
      "StarkNet Message",
      ...domainPrefix.starkNet_Domain,
      sender,
      ...order.order
    ]
    return { hash: orderhash, ZZMessage: ZZMessage };
  }
}
