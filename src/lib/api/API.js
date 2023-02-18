import { createIcon } from "@download/blockies";
import Web3Modal from "web3modal";
import Emitter from "tiny-emitter";
import { ethers, constants as ethersConstants } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { getENSName, reverseUnstoppabledomainsAddress } from "lib/ens";
import { formatAmount } from "lib/utils";
import erc20ContractABI from "lib/contracts/ERC20.json";
import { MAX_ALLOWANCE } from "./constants";
import { toast } from "react-toastify";

import axios from "axios";
import { isMobile } from "react-device-detect";
import get from "lodash/get";

import i18next from "../i18next";

const chainMap = {
  "0x1": 1,
};

class API extends Emitter {
  networks = {};
  ws = null;
  apiProvider = null;
  mainnetProvider = null;
  rollupProvider = null;
  currencies = null;
  isArgent = false;
  marketInfo = {};
  lastPrices = {};
  balances = {};
  _signInProgress = null;
  _profiles = {};
  _pendingOrders = [];
  _pendingFills = [];
  serverDelta = 0;

  constructor({ infuraId, networks, currencies, validMarkets }) {
    super();

    if (networks) {
      Object.keys(networks).forEach((k) => {
        this.networks[k] = [
          networks[k][0],
          new networks[k][1](this, networks[k][0]),
          networks[k][2],
        ];
      });
    }

    this.infuraId = infuraId;
    this.currencies = currencies;
    this.validMarkets = validMarkets;

    this.setAPIProvider(this.networks.zksync[0]);
  }

  getAPIProvider = (network) => {
    return this.networks[this.getNetworkName(network)][1];
  };

  setAPIProvider = (network, networkChanged = true) => {
    const chainName = this.getChainName(network);

    if (!chainName) {
      console.error(`Can't get chainName for ${network}`);
      this.signOut();
      return;
    }
    const oldNetwork = this.apiProvider?.network;
    const apiProvider = this.getAPIProvider(network);
    this.apiProvider = apiProvider;

    // Change WebSocket if necessary
    if (this.ws) {
      const oldUrl = new URL(this.ws.url);
      const newUrl = new URL(this.apiProvider.websocketUrl);
      if (oldUrl.host !== newUrl.host) {
        this.start();
      }
      if (oldNetwork !== this.apiProvider.network) {
        // get initial marketinfos, returns lastprice and marketinfo2
        this.send("marketsreq", [this.apiProvider.network, true]);
      }
    }

    this.rollupProvider = window.ethereum
      ? new ethers.providers.Web3Provider(window.ethereum, "any")
      : new ethers.providers.JsonRpcProvider(
        `https://${chainName}.infura.io/v3/${this.infuraId}`
      );

    switch (chainName) {
      case "zksync-goerli":
      case "zksync":
        this.web3Modal = new Web3Modal({
          network: this.getChainNameL1(network),
          cacheProvider: false,
          theme: "dark",
          providerOptions: {
            injected: {
              display: {
                logo: "data:image/svg+xml;utf8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMTIiIGhlaWdodD0iMTg5IiB2aWV3Qm94PSIwIDAgMjEyIDE4OSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cG9seWdvbiBmaWxsPSIjQ0RCREIyIiBwb2ludHM9IjYwLjc1IDE3My4yNSA4OC4zMTMgMTgwLjU2MyA4OC4zMTMgMTcxIDkwLjU2MyAxNjguNzUgMTA2LjMxMyAxNjguNzUgMTA2LjMxMyAxODAgMTA2LjMxMyAxODcuODc1IDg5LjQzOCAxODcuODc1IDY4LjYyNSAxNzguODc1Ii8+PHBvbHlnb24gZmlsbD0iI0NEQkRCMiIgcG9pbnRzPSIxMDUuNzUgMTczLjI1IDEzMi43NSAxODAuNTYzIDEzMi43NSAxNzEgMTM1IDE2OC43NSAxNTAuNzUgMTY4Ljc1IDE1MC43NSAxODAgMTUwLjc1IDE4Ny44NzUgMTMzLjg3NSAxODcuODc1IDExMy4wNjMgMTc4Ljg3NSIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMjU2LjUgMCkiLz48cG9seWdvbiBmaWxsPSIjMzkzOTM5IiBwb2ludHM9IjkwLjU2MyAxNTIuNDM4IDg4LjMxMyAxNzEgOTEuMTI1IDE2OC43NSAxMjAuMzc1IDE2OC43NSAxMjMuNzUgMTcxIDEyMS41IDE1Mi40MzggMTE3IDE0OS42MjUgOTQuNSAxNTAuMTg4Ii8+PHBvbHlnb24gZmlsbD0iI0Y4OUMzNSIgcG9pbnRzPSI3NS4zNzUgMjcgODguODc1IDU4LjUgOTUuMDYzIDE1MC4xODggMTE3IDE1MC4xODggMTIzLjc1IDU4LjUgMTM2LjEyNSAyNyIvPjxwb2x5Z29uIGZpbGw9IiNGODlEMzUiIHBvaW50cz0iMTYuMzEzIDk2LjE4OCAuNTYzIDE0MS43NSAzOS45MzggMTM5LjUgNjUuMjUgMTM5LjUgNjUuMjUgMTE5LjgxMyA2NC4xMjUgNzkuMzEzIDU4LjUgODMuODEzIi8+PHBvbHlnb24gZmlsbD0iI0Q4N0MzMCIgcG9pbnRzPSI0Ni4xMjUgMTAxLjI1IDkyLjI1IDEwMi4zNzUgODcuMTg4IDEyNiA2NS4yNSAxMjAuMzc1Ii8+PHBvbHlnb24gZmlsbD0iI0VBOEQzQSIgcG9pbnRzPSI0Ni4xMjUgMTAxLjgxMyA2NS4yNSAxMTkuODEzIDY1LjI1IDEzNy44MTMiLz48cG9seWdvbiBmaWxsPSIjRjg5RDM1IiBwb2ludHM9IjY1LjI1IDEyMC4zNzUgODcuNzUgMTI2IDk1LjA2MyAxNTAuMTg4IDkwIDE1MyA2NS4yNSAxMzguMzc1Ii8+PHBvbHlnb24gZmlsbD0iI0VCOEYzNSIgcG9pbnRzPSI2NS4yNSAxMzguMzc1IDYwLjc1IDE3My4yNSA5MC41NjMgMTUyLjQzOCIvPjxwb2x5Z29uIGZpbGw9IiNFQThFM0EiIHBvaW50cz0iOTIuMjUgMTAyLjM3NSA5NS4wNjMgMTUwLjE4OCA4Ni42MjUgMTI1LjcxOSIvPjxwb2x5Z29uIGZpbGw9IiNEODdDMzAiIHBvaW50cz0iMzkuMzc1IDEzOC45MzggNjUuMjUgMTM4LjM3NSA2MC43NSAxNzMuMjUiLz48cG9seWdvbiBmaWxsPSIjRUI4RjM1IiBwb2ludHM9IjEyLjkzOCAxODguNDM4IDYwLjc1IDE3My4yNSAzOS4zNzUgMTM4LjkzOCAuNTYzIDE0MS43NSIvPjxwb2x5Z29uIGZpbGw9IiNFODgyMUUiIHBvaW50cz0iODguODc1IDU4LjUgNjQuNjg4IDc4Ljc1IDQ2LjEyNSAxMDEuMjUgOTIuMjUgMTAyLjkzOCIvPjxwb2x5Z29uIGZpbGw9IiNERkNFQzMiIHBvaW50cz0iNjAuNzUgMTczLjI1IDkwLjU2MyAxNTIuNDM4IDg4LjMxMyAxNzAuNDM4IDg4LjMxMyAxODAuNTYzIDY4LjA2MyAxNzYuNjI1Ii8+PHBvbHlnb24gZmlsbD0iI0RGQ0VDMyIgcG9pbnRzPSIxMjEuNSAxNzMuMjUgMTUwLjc1IDE1Mi40MzggMTQ4LjUgMTcwLjQzOCAxNDguNSAxODAuNTYzIDEyOC4yNSAxNzYuNjI1IiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAyNzIuMjUgMCkiLz48cG9seWdvbiBmaWxsPSIjMzkzOTM5IiBwb2ludHM9IjcwLjMxMyAxMTIuNSA2NC4xMjUgMTI1LjQzOCA4Ni4wNjMgMTE5LjgxMyIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMTUwLjE4OCAwKSIvPjxwb2x5Z29uIGZpbGw9IiNFODhGMzUiIHBvaW50cz0iMTIuMzc1IC41NjMgODguODc1IDU4LjUgNzUuOTM4IDI3Ii8+PHBhdGggZmlsbD0iIzhFNUEzMCIgZD0iTTEyLjM3NTAwMDIsMC41NjI1MDAwMDggTDIuMjUwMDAwMDMsMzEuNTAwMDAwNSBMNy44NzUwMDAxMiw2NS4yNTAwMDEgTDMuOTM3NTAwMDYsNjcuNTAwMDAxIEw5LjU2MjUwMDE0LDcyLjU2MjUgTDUuMDYyNTAwMDgsNzYuNTAwMDAxMSBMMTEuMjUsODIuMTI1MDAxMiBMNy4zMTI1MDAxMSw4NS41MDAwMDEzIEwxNi4zMTI1MDAyLDk2Ljc1MDAwMTQgTDU4LjUwMDAwMDksODMuODEyNTAxMiBDNzkuMTI1MDAxMiw2Ny4zMTI1MDA0IDg5LjI1MDAwMTMsNTguODc1MDAwMyA4OC44NzUwMDEzLDU4LjUwMDAwMDkgQzg4LjUwMDAwMTMsNTguMTI1MDAwOSA2My4wMDAwMDA5LDM4LjgxMjUwMDYgMTIuMzc1MDAwMiwwLjU2MjUwMDAwOCBaIi8+PGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMjExLjUgMCkiPjxwb2x5Z29uIGZpbGw9IiNGODlEMzUiIHBvaW50cz0iMTYuMzEzIDk2LjE4OCAuNTYzIDE0MS43NSAzOS45MzggMTM5LjUgNjUuMjUgMTM5LjUgNjUuMjUgMTE5LjgxMyA2NC4xMjUgNzkuMzEzIDU4LjUgODMuODEzIi8+PHBvbHlnb24gZmlsbD0iI0Q4N0MzMCIgcG9pbnRzPSI0Ni4xMjUgMTAxLjI1IDkyLjI1IDEwMi4zNzUgODcuMTg4IDEyNiA2NS4yNSAxMjAuMzc1Ii8+PHBvbHlnb24gZmlsbD0iI0VBOEQzQSIgcG9pbnRzPSI0Ni4xMjUgMTAxLjgxMyA2NS4yNSAxMTkuODEzIDY1LjI1IDEzNy44MTMiLz48cG9seWdvbiBmaWxsPSIjRjg5RDM1IiBwb2ludHM9IjY1LjI1IDEyMC4zNzUgODcuNzUgMTI2IDk1LjA2MyAxNTAuMTg4IDkwIDE1MyA2NS4yNSAxMzguMzc1Ii8+PHBvbHlnb24gZmlsbD0iI0VCOEYzNSIgcG9pbnRzPSI2NS4yNSAxMzguMzc1IDYwLjc1IDE3My4yNSA5MCAxNTMiLz48cG9seWdvbiBmaWxsPSIjRUE4RTNBIiBwb2ludHM9IjkyLjI1IDEwMi4zNzUgOTUuMDYzIDE1MC4xODggODYuNjI1IDEyNS43MTkiLz48cG9seWdvbiBmaWxsPSIjRDg3QzMwIiBwb2ludHM9IjM5LjM3NSAxMzguOTM4IDY1LjI1IDEzOC4zNzUgNjAuNzUgMTczLjI1Ii8+PHBvbHlnb24gZmlsbD0iI0VCOEYzNSIgcG9pbnRzPSIxMi45MzggMTg4LjQzOCA2MC43NSAxNzMuMjUgMzkuMzc1IDEzOC45MzggLjU2MyAxNDEuNzUiLz48cG9seWdvbiBmaWxsPSIjRTg4MjFFIiBwb2ludHM9Ijg4Ljg3NSA1OC41IDY0LjY4OCA3OC43NSA0Ni4xMjUgMTAxLjI1IDkyLjI1IDEwMi45MzgiLz48cG9seWdvbiBmaWxsPSIjMzkzOTM5IiBwb2ludHM9IjcwLjMxMyAxMTIuNSA2NC4xMjUgMTI1LjQzOCA4Ni4wNjMgMTE5LjgxMyIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMTUwLjE4OCAwKSIvPjxwb2x5Z29uIGZpbGw9IiNFODhGMzUiIHBvaW50cz0iMTIuMzc1IC41NjMgODguODc1IDU4LjUgNzUuOTM4IDI3Ii8+PHBhdGggZmlsbD0iIzhFNUEzMCIgZD0iTTEyLjM3NTAwMDIsMC41NjI1MDAwMDggTDIuMjUwMDAwMDMsMzEuNTAwMDAwNSBMNy44NzUwMDAxMiw2NS4yNTAwMDEgTDMuOTM3NTAwMDYsNjcuNTAwMDAxIEw5LjU2MjUwMDE0LDcyLjU2MjUgTDUuMDYyNTAwMDgsNzYuNTAwMDAxMSBMMTEuMjUsODIuMTI1MDAxMiBMNy4zMTI1MDAxMSw4NS41MDAwMDEzIEwxNi4zMTI1MDAyLDk2Ljc1MDAwMTQgTDU4LjUwMDAwMDksODMuODEyNTAxMiBDNzkuMTI1MDAxMiw2Ny4zMTI1MDA0IDg5LjI1MDAwMTMsNTguODc1MDAwMyA4OC44NzUwMDEzLDU4LjUwMDAwMDkgQzg4LjUwMDAwMTMsNTguMTI1MDAwOSA2My4wMDAwMDA5LDM4LjgxMjUwMDYgMTIuMzc1MDAwMiwwLjU2MjUwMDAwOCBaIi8+PC9nPjwvZz48L3N2Zz4=",
                name: "MetaMask",
                description: "Connect to your MetaMask Wallet",
              },
              package: null,
            },
            walletconnect: {
              package: WalletConnectProvider,
              options: {
                infuraId: this.infuraId,
              },
            },
            coinbasewallet: {
              package: CoinbaseWalletSDK,
              options: {
                appName: "Web 3 Modal Demo",
                infuraId: this.infuraId,
              },
            },
            "custom-argent": {
              display: {
                logo: "https://images.prismic.io/argentwebsite/313db37e-055d-42ee-9476-a92bda64e61d_logo.svg?auto=format%2Ccompress&fit=max&q=50",
                name: "Argent zkSync",
                description: "Connect to your Argent zkSync wallet",
              },
              package: WalletConnectProvider,
              options: {
                infuraId: this.infuraId,
              },
              connector: async (ProviderPackage, options) => {
                const provider = new ProviderPackage(options);
                await provider.enable();
                this.isArgent = true;
                return provider;
              },
            },
          },
        });
        break;
      default:
        throw new Error(`Cant find provider for ${chainName}`);
    }

    this.getAccountState().catch((err) => {
      console.log("Failed to switch providers", err);
    });

    if (networkChanged) this.emit("providerChange", network);
  };

  getProfile = async (address) => {
    const getProfileFromIPFS = async (address) => {
      try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 1500);

        const { data } = await axios.get(
          `https://ipfs.3box.io/profile?address=${address}`,
          {
            signal: controller.signal,
          }
        );
        const profile = {
          coverPhoto: get(data, "coverPhoto.0.contentUrl./"),
          image: get(data, "image.0.contentUrl./"),
          description: data.description,
          emoji: data.emoji,
          website: data.website,
          location: data.location,
          twitter_proof: data.twitter_proof,
        };

        if (data.name) {
          profile.name = data.name;
        }

        if (profile.image) {
          profile.image = `https://gateway.ipfs.io/ipfs/${profile.image}`;
        }

        return profile;
      } catch (err) {
        console.warn(`Failed to get profile from IPFS: ${err}`);
      }
      return {};
    };

    const fetchAddressName = async (address) => {
      const [ensName, unstoppabledomainsName] = await Promise.all([
        getENSName(address),
        reverseUnstoppabledomainsAddress(address),
      ]);
      if (ensName) return { name: ensName };
      if (unstoppabledomainsName) return { name: unstoppabledomainsName };

      return {};
    };

    if (!this._profiles[address]) {
      const profile = (this._profiles[address] = {
        description: null,
        website: null,
        image: null,
        address,
      });

      if (!address) {
        return profile;
      }

      profile.name = `${address.substr(0, 6)}…${address.substr(-6)}`;
      Object.assign(
        profile,
        ...(await Promise.all([
          fetchAddressName(address),
          getProfileFromIPFS(address),
        ]))
      );

      if (!profile.image) {
        profile.image = createIcon({ seed: address }).toDataURL();
      }
    }

    return this._profiles[address];
  };

  _socketOpen = () => {
    this.emit("open");

    // get initial marketinfos, returns lastprice and marketinfo2
    this.send("marketsreq", [this.apiProvider.network, true]);
  };

  _socketClose = () => {
    console.warn("Websocket dropped. Restarting");
    this.ws = null;
    setTimeout(() => {
      this.start();
    }, 3000);
    this.emit("close");
  };

  _socketMsg = (e) => {
    if (!e.data && e.data.length <= 0) return;
    const msg = JSON.parse(e.data);
    this.emit("message", msg.op, msg.args);

    // Is there a better way to do this? Not sure.
    if (msg.op === "marketinfo") {
      const marketInfo = msg.args[0];
      if (!marketInfo) return;
      this.marketInfo[`${marketInfo.zigzagChainId}:${marketInfo.alias}`] =
        marketInfo;
    }
    if (msg.op === "marketinfo2") {
      const marketInfos = msg.args[0];
      marketInfos.forEach((marketInfo) => {
        if (!marketInfo) return;
        this.marketInfo[`${marketInfo.zigzagChainId}:${marketInfo.alias}`] =
          marketInfo;
      });
    }
    if (msg.op === "lastprice") {
      const lastPricesUpdate = msg.args[0];
      const chainId = msg.args[1];
      lastPricesUpdate.forEach((l) => {
        if (!this.lastPrices[chainId]) this.lastPrices[chainId] = {};
        this.lastPrices[chainId][l[0]] = l;
      });
    }
  };

  refreshNetwork = async () => {
    if (!window.ethereum) return;
    let ethereumChainId, ethereumChainInfo;

    // await this.signOut();

    switch (this.apiProvider.network) {
      case 1:
        ethereumChainId = "0x1";
        ethereumChainInfo = {
          chainId: "0x1",
        };
        break;
      case 1002:
        ethereumChainId = "0x5";
        ethereumChainInfo = {
          chainId: "0x5",
        };
        break;
      case 42161:
        window.location("https://swap.zigzag.exchange");
        break;
      default:
        return;
    }

    await window.ethereum.request({
      method: "eth_requestAccounts",
      params: [{ eth_accounts: {} }],
    });

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ethereumChainId }],
      });
    } catch (switchError) {
      try {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [ethereumChainInfo],
          });
        }
      } catch (addError) {
        console.error(addError);
        throw addError;
      }
    }
  };

  _socketError = (e) => {
    console.log(e);
    console.warn("Zigzag websocket connection failed");
  };

  calculateServerDelta = async () => {
    const url = this.apiProvider.websocketUrl.replace("wss", "https");
    let serverTime, res;
    try {
      res = await axios.get(`${url}/api/v1/time`);
      serverTime = res.data.serverTimestamp;
    } catch (e) {
      console.log(e);
      console.log(res);
      serverTime = Date.now();
    }
    const clientTime = Date.now();
    this.serverDelta = Math.floor((serverTime - clientTime) / 1000);
    if (this.serverDelta < -5 || this.serverDelta > 5) {
      console.warn(
        `Your PC clock is not synced (delta: ${this.serverDelta / 60
        } min). Please sync it via settings > date/time > sync now`
      );
    }
    this.emit("serverDeltaUpdate", this.serverDelta);
  };

  start = () => {
    if (this.ws) this.stop();
    this.ws = new WebSocket(this.apiProvider.websocketUrl);
    this.ws.addEventListener("open", this._socketOpen);
    this.ws.addEventListener("close", this._socketClose);
    this.ws.addEventListener("message", this._socketMsg);
    this.ws.addEventListener("error", this._socketError);
    this.emit("start");

    // login after reconnect
    const accountState = this.getAccountState();
    if (accountState && accountState.id) {
      this.send("login", [
        this.apiProvider.network,
        accountState.id && accountState.id.toString(),
      ]);
    }

    if (!this.serverDelta) this.calculateServerDelta();
  };

  stop = () => {
    if (!this.ws) return;
    this.ws.close();
    this.emit("stop");
  };

  getAccountState = async () => {
    const accountState = { ...(await this.apiProvider.getAccountState()) };
    accountState.profile = await this.getProfile(accountState.address);
    this.emit("accountState", accountState);
    return accountState;
  };

  send = (op, args) => {
    if (!this.ws) return;
    if (this.ws.readyState === 1) {
      return this.ws.send(JSON.stringify({ op, args }));
    } else {
      setTimeout(this.send, 500, op, args);
    }
  };

  sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  signIn = async (network, ...args) => {
    if (!this._signInProgress) {
      this._signInProgress = Promise.resolve()
        .then(async () => {
          if (network) {
            this.apiProvider = this.getAPIProvider(network);
          }

          await this.refreshNetwork();
          await this.sleep(1000);

          const web3Provider = await this.web3Modal.connect();

          this.rollupProvider = new ethers.providers.Web3Provider(web3Provider);

          this.mainnetProvider = new ethers.providers.InfuraProvider(
            this.getChainNameL1(network),
            this.infuraId
          );

          let accountState;
          try {
            accountState = await this.apiProvider.signIn(...args);
          } catch (err) {
            await this.signOut();
            throw err;
          }

          if (accountState.err === 4001) {
            await this.signOut();
            return;
          }

          try {
            accountState.profile = await this.getProfile(accountState.address);
          } catch (e) {
            accountState.profile = {};
          }

          this.emit("signIn", accountState);

          if (accountState && accountState.id) {
            this.send("login", [
              network,
              accountState.id && accountState.id.toString(),
            ]);
          }

          // fetch blances
          await this.getBalances();
          await this.getWalletBalances();

          return accountState;
        })
        .catch((err) => {
          console.log(err);
          if (!err.includes('Modal closed by user')) {
            if (this.apiProvider.zksyncCompatible) {
              toast.error(
                i18next.t("click_here_to_bridge_funds"),
                {
                  toastId: "zksync account does not exist",
                  onClick: () => window.open("https://wallet.zksync.io", "_blank"),
                  autoClose: false
                }
              );
            }
            throw err;
          }

        })
        .finally(() => {
          this._signInProgress = null;
        });
    }

    return this._signInProgress;
  };

  signOut = async (clearCatch = false) => {
    if (!this.apiProvider) {
      return;
    } else if (this.web3Modal && clearCatch) {
      this.web3Modal.clearCachedProvider();
    }

    if (isMobile) window.localStorage?.clear();
    else window.localStorage?.removeItem("walletconnect");

    this.balances = {};
    this._profiles = {};
    this._pendingOrders = [];
    this._pendingFills = [];

    this.web3Modal = null;
    this.rollupProvider = null;
    this.mainnetProvider = null;
    this.isArgent = false;
    this.emit("signOut");
    this.setAPIProvider(this.apiProvider.network, false);
    this.emit("balanceUpdate", "wallet", {});
    this.emit("balanceUpdate", this.apiProvider.network, {});
    this.emit("accountState", {});
  };

  getNetworkName = (network) => {
    const keys = Object.keys(this.networks);
    return keys[keys.findIndex((key) => network === this.networks[key][0])];
  };

  getChainName = (chainId) => {
    switch (chainId) {
      case 1:
        return "zksync";
      case 1002:
        return "zksync-goerli";
      default:
        return;
    }
  };

  getChainNameL1 = (chainId) => {
    switch (chainId) {
      case 1:
        return "mainnet";
      case 1002:
        return "goerli";
      default:
        return;
    }
  };

  getChainIdFromName = (name) => {
    return this.networks?.[name]?.[0] || 1;
  };

  getNetworkDisplayName = (network) => {
    switch (network) {
      case 1:
        return "zkSync";
      case 1002:
        return "zkSync-Goerli";
      default:
        return "ZigZag";
    }
  };

  subscribeToMarket = (market, showNightPriceChange = false) => {
    if (!market) return;

    // allow all valid pairs, also allow default market all the time
    // default market is guaranteed to be up
    const allPairs = this.getPairs();
    if (
      !allPairs.includes(market) &&
      market !== this.apiProvider.getDefaultMarket()
    )
      return false;

    this.send("subscribemarket", [
      this.apiProvider.network,
      market,
      showNightPriceChange,
    ]);
    return true;
  };

  unsubscribeToMarket = (market) => {
    this.send("unsubscribemarket", [this.apiProvider.network, market]);
  };

  isZksyncChain = () => {
    return !!this.apiProvider.zksyncCompatible;
  };

  isEVMChain = () => {
    return !!this.apiProvider.evmCompatible;
  };

  cancelOrder = async (orderId) => {
    const token = localStorage?.getItem(orderId);
    // token is used to cancel the order - otherwiese the user is asked to sign a msg
    if (token) {
      await this.send("cancelorder3", [
        this.apiProvider.network,
        orderId,
        token,
      ]);
    } else {
      const toastMsg = toast.info(
        i18next.t("sign_the_message_to_cancel_your_order"),
        {
          toastId: "Sign the message to cancel your order...'",
        }
      );

      const message = `cancelorder2:${this.apiProvider.network}:${orderId}`;
      const signedMessage = await this.apiProvider.signMessage(message);
      try {
        await this.send("cancelorder2", [
          this.apiProvider.network,
          orderId,
          signedMessage,
        ]);
      } finally {
        toast.dismiss(toastMsg);
      }
    }

    return true;
  };

  depositL2 = async (amount, token, address) => {
    return await this.apiProvider.depositL2(amount, token, address);
  };

  getEthereumFee = async () => {
    if (this.mainnetProvider) {
      const feeData = await this.mainnetProvider.getFeeData();
      return feeData;
    }
  };

  withdrawL2 = async (amount, token) => {
    return await this.apiProvider.withdrawL2(amount, token);
  };

  transferToBridge = (amount, token, address, userAddress) => {
    return this.apiProvider.transferToBridge(
      amount,
      token,
      address,
      userAddress
    );
  };

  depositL2Fee = async (token) => {
    return await this.apiProvider.depositL2Fee(token);
  };

  withdrawL2GasFee = async (token) => {
    try {
      return await this.apiProvider.withdrawL2GasFee(token);
    } catch (err) {
      console.log(err);
      return { amount: 0, feeToken: "ETH" };
    }
  };

  transferL2GasFee = async (token) => {
    try {
      return await this.apiProvider.transferL2GasFee(token);
    } catch (err) {
      console.log(err);
      return { amount: 0, feeToken: "ETH" };
    }
  };

  withdrawL2FastBridgeFee = async (token) => {
    try {
      return await this.apiProvider.withdrawL2FastBridgeFee(token);
    } catch (err) {
      console.log(err);
      return 0;
    }
  };

  isImplemented = (method) => {
    return this.apiProvider[method] && !this.apiProvider[method].notImplemented;
  };

  getNetworkContract = () => {
    return this.networks[this.getNetworkName(this.apiProvider.network)][2];
  };

  approveSpendOfCurrency = async (currency) => {
    await this.apiProvider.approveTransferToBridge(currency);

    // update allowances after successfull approve
    this.getWalletBalances();
  };

  getBalanceOfCurrency = async (currencyInfo, currency) => {
    let result = { balance: 0, allowance: ethersConstants.Zero };
    if (!this.mainnetProvider) return result;

    try {
      const netContract = this.getNetworkContract();
      const address = await this.rollupProvider.getSigner().getAddress();
      if (!address || address === "0x") return result;

      if (currency === "ETH") {
        result.balance = await this.mainnetProvider.getBalance(address);
        result.allowance = ethersConstants.MaxUint256;
        return result;
      }

      if (!currencyInfo || !currencyInfo.address) return result;

      const contract = new ethers.Contract(
        currencyInfo.address,
        erc20ContractABI,
        this.mainnetProvider
      );
      result.balance = await contract.balanceOf(address);
      if (netContract) {
        result.allowance = ethers.BigNumber.from(
          await contract.allowance(address, netContract)
        );
      }
      return result;
    } catch (e) {
      console.log(e);
      return result;
    }
  };

  getWalletBalances = async () => {
    const balances = {};

    const getBalance = async (ticker) => {
      const currencyInfo = this.getCurrencyInfo(ticker);
      const { balance, allowance } = await this.getBalanceOfCurrency(currencyInfo, ticker);
      balances[ticker] = {
        value: balance,
        allowance,
        valueReadable: "0",
      };
      if (balance && currencyInfo) {
        balances[ticker].valueReadable = formatAmount(balance, currencyInfo);
      } else if (ticker === "ETH") {
        balances[ticker].valueReadable = formatAmount(balance, {
          decimals: 18,
        });
      }

      this.emit("balanceUpdate", "wallet", { ...balances });
    };

    const tickers = this.getCurrencies();
    // allways fetch ETH for Etherum wallet
    if (!tickers.includes("ETH")) {
      tickers.push("ETH");
    }

    await Promise.all(tickers.map((ticker) => getBalance(ticker)));

    return balances;
  };

  getBalances = async () => {
    const balances = await this.apiProvider.getBalances();
    this.balances[this.apiProvider.network] = balances;
    this.emit("balanceUpdate", this.apiProvider.network, balances);
    return balances;
  };

  getOrderDetailsWithoutFee = (order) => {
    const side = order[3];
    const baseQuantity = order[5];
    const quoteQuantity = order[4] * order[5];
    const remaining = Number(order[11]) !== null ? order[5] : order[11];
    const market = order[2];
    const marketInfo = this.marketInfo[`${this.apiProvider.network}:${market}`];
    let baseQuantityWithoutFee,
      quoteQuantityWithoutFee,
      priceWithoutFee,
      remainingWithoutFee;
    if (side === "s") {
      const fee = marketInfo ? marketInfo.baseFee : 0;
      baseQuantityWithoutFee = baseQuantity - fee;
      remainingWithoutFee = Math.max(0, remaining - fee);
      priceWithoutFee = quoteQuantity / baseQuantityWithoutFee;
      quoteQuantityWithoutFee = priceWithoutFee * baseQuantityWithoutFee;
    } else {
      const fee = marketInfo ? marketInfo.quoteFee : 0;
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
  };

  submitOrder = async (market, side, baseAmount, quoteAmount, orderType) => {
    if (!quoteAmount || !baseAmount) {
      throw new Error("Set base or quote amount");
    }

    const marketInfo = this.marketInfo[`${this.apiProvider.network}:${market}`];
    let baseAmountBN = ethers.utils.parseUnits(
      Number(baseAmount).toFixed(marketInfo.baseAsset.decimals),
      marketInfo.baseAsset.decimals
    );
    let quoteAmountBN = ethers.utils.parseUnits(
      Number(quoteAmount).toFixed(marketInfo.quoteAsset.decimals),
      marketInfo.quoteAsset.decimals
    );

    const expirationTimeSeconds =
      orderType === "market"
        ? Date.now() / 1000 + 60 * 2 // two minutes
        : Date.now() / 1000 + 60 * 60 * 24 * 7; // one week

    await this.apiProvider.submitOrder(
      market,
      side,
      baseAmountBN,
      quoteAmountBN,
      Math.floor(expirationTimeSeconds + this.serverDelta)
    );
  };

  calculatePriceFromLiquidity = (quantity, spotPrice, side, liquidity) => {
    //let availableLiquidity;
    //if (side === 's') {
    //    availableLiquidity = liquidity.filter(l => (['d','s']).includes(l[2]));
    //} else if (side === 'b') {
    //    availableLiquidity = liquidity.filter(l => (['d','b']).includes(l[2]));
    //}
    //availableLiquidity.sort((a,b) => a[1] - b[1]);
    //const avgSpread = 0;
    //for (let i in availableLiquidity) {
    //    const spread = availableLiquidity[2];
    //    const amount = availableLiquidity[2];
    //}
  };

  refreshArweaveAllocation = async (address) => {
    return this.apiProvider.refreshArweaveAllocation(address);
  };

  purchaseArweaveBytes = (bytes) => {
    return this.apiProvider.purchaseArweaveBytes(bytes);
  };

  signMessage = async (message) => {
    return this.apiProvider.signMessage(message);
  };

  approveExchangeContract = async (token, amount) => {
    return this.apiProvider.approveExchangeContract(token, amount);
  };

  checkAccountActivated = async () => {
    if (!this.isZksyncChain()) return true;
    return this.apiProvider.checkAccountActivated();
  };

  warpETH = async (amount) => {
    if (!amount) throw new Error("No amount set");
    let amountBN = ethers.utils.parseEther(amount.toFixed(18));

    return this.apiProvider.warpETH(amountBN);
  };

  unWarpETH = async (amount) => {
    if (!amount) throw new Error("No amount set");
    let amountBN = ethers.utils.parseEther(amount.toFixed(18));

    return this.apiProvider.unWarpETH(amountBN);
  };

  getWrapFees = async () => {
    return this.apiProvider.getWrapFees();
  };

  uploadArweaveFile = async (sender, timestamp, signature, file) => {
    const formData = new FormData();
    formData.append("sender", sender);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("file", file);

    const url = "https://zigzag-arweave-bridge.herokuapp.com/arweave/upload";
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    }).then((r) => r.json());
    return response;
  };

  getCurrencyLogo(currency) {
    try {
      return require(`assets/images/currency/${currency}.svg`).default;
    } catch (e) {
      try {
        return require(`assets/images/currency/${currency}.png`).default;
      } catch (e) {
        try {
          return require(`assets/images/currency/${currency}.webp`).default;
        } catch (e) {
          return require(`assets/images/currency/ZZ.webp`).default;
        }
      }
    }
  }

  get fastWithdrawTokenAddresses() {
    if (this.apiProvider.network === 1) {
      return {
        USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      };
    } else if (this.apiProvider.network === 1002) {
      return {};
    } else {
      throw Error("Network unknown");
    }
  }

  async getL2FastWithdrawLiquidity() {
    console.log(this.mainnetProvider);
    if (this.mainnetProvider) {
      const currencyMaxes = {};
      if (!this.apiProvider.eligibleFastWithdrawTokens) return currencyMaxes;
      for (const currency of this.apiProvider.eligibleFastWithdrawTokens) {
        let max = 0;
        try {
          if (currency === "ETH") {
            max = await this.mainnetProvider.getBalance(
              this.apiProvider.fastWithdrawContractAddress
            );
          } else {
            console.log(this.fastWithdrawTokenAddresses);
            const contract = new ethers.Contract(
              this.fastWithdrawTokenAddresses[currency],
              erc20ContractABI,
              this.mainnetProvider
            );
            max = await contract.balanceOf(
              this.apiProvider.fastWithdrawContractAddress
            );
          }
        } catch (e) {
          console.error(e);
        }
        const currencyInfo = this.getCurrencyInfo(currency);
        if (!currencyInfo) {
          return {};
        }
        currencyMaxes[currency] = max / 10 ** currencyInfo.decimals;
      }
      return currencyMaxes;
    } else {
      console.error("Ethers provider null or undefined");
      return {};
    }
  }

  updatePendingOrders = (userOrders) => {
    Object.keys(userOrders).forEach((orderId) => {
      const orderStatus = userOrders[orderId][9];
      if (["b", "m", "pm"].includes(orderStatus)) {
        // _pendingOrders is used to only request on the 2nd time
        const index = this._pendingOrders.indexOf(orderId);
        if (index > -1) {
          this._pendingOrders.splice(index, 1);
          // request status update
          this.send("orderreceiptreq", [
            this.apiProvider.network,
            Number(orderId),
          ]);
        } else {
          this._pendingOrders.push(orderId);
        }
      }
    });
  };

  updatePendingFills = (userFills) => {
    const fillRequestIds = [];
    Object.keys(userFills).forEach((fillId) => {
      if (!fillId) return;

      const fillStatus = userFills[fillId][6];
      if (["b", "m", "pm"].includes(fillStatus)) {
        // _pendingFills is used to only request on the 2nd time
        const index = this._pendingFills.indexOf(fillId);
        if (index > -1) {
          this._pendingFills.splice(index, 1);
          fillRequestIds.push(fillId);
        } else {
          this._pendingFills.push(fillId);
        }
      }
    });
    // request status update
    if (fillRequestIds.length > 0) {
      for (let i in fillRequestIds) {
        this.send("fillreceiptreq", [
          this.apiProvider.network,
          Number(fillRequestIds[i]),
        ]);
      }
    }
  };

  getPairs = (chainId = this.apiProvider.network) => {
    if (!this.lastPrices[chainId]) return [];
    return Object.keys(this.lastPrices[chainId]);
  };

  getCurrencyInfo = (currency) => {
    const pairs = this.getPairs();
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const marketInfo = this.marketInfo[`${this.apiProvider.network}:${pair}`];
      const baseCurrency = pair.split("-")[0];
      const quoteCurrency = pair.split("-")[1];
      if (baseCurrency === currency && marketInfo) {
        return marketInfo.baseAsset;
      } else if (quoteCurrency === currency && marketInfo) {
        return marketInfo.quoteAsset;
      }
    }
    return null;
  };

  getCurrencies = (chainId = this.apiProvider.network) => {
    const tickers = new Set();
    for (let market in this.lastPrices[chainId]) {
      tickers.add(this.lastPrices[chainId][market][0].split("-")[0]);
      tickers.add(this.lastPrices[chainId][market][0].split("-")[1]);
    }
    return [...tickers];
  };

  getExplorerTxLink = (chainId, txhash) => {
    switch (Number(chainId)) {
      case 1:
        return "https://zkscan.io/explorer/transactions/" + txhash;
      case 1002:
        return "https://goerli.zkscan.io/explorer/transactions/" + txhash;
      case 42161:
        return "https://arbiscan.io/tx/" + txhash;
      case 421613:
        return "https://goerli.arbiscan.io/tx/" + txhash;
      default:
        throw Error("Chain ID not understood");
    }
  };

  getExplorerAccountLink = (chainId, address, layer = 2) => {
    if (layer === 1) {
      switch (Number(chainId)) {
        case 1:
        case 42161:
          return "https://etherscan.io/address/" + address;
        case 1002:
        case 421613:
          return "https://goerli.etherscan.io/address/" + address;
        default:
          throw Error("Chain ID not understood");
      }
    } else {
      switch (Number(chainId)) {
        case 1:
          return "https://zkscan.io/explorer/accounts/" + address;
        case 1002:
          return "https://goerli.zkscan.io/explorer/accounts/" + address;
        case 42161:
          return "https://arbiscan.io/address/" + address;
        case 421613:
          return (
            "https://goerli.arbiscan.io/address/" + address
          );
        default:
          throw Error("Chain ID not understood");
      }
    }
  };
}

export default API;
