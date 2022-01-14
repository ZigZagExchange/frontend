import API from "./API";
// import APIStarknetProvider from './providers/APIStarknetProvider'
import APIZKProvider from "./providers/APIZKProvider";

const api = new API({
  infuraId: process.env.REACT_APP_INFURA_ID,
  websocketUrl: process.env.REACT_APP_ZIGZAG_WS,
  networks: {
    mainnet: [1, APIZKProvider, "0xaBEA9132b05A70803a4E85094fD0e1800777fBEF"],
    rinkeby: [
      1000,
      APIZKProvider,
      "0x82f67958a5474e40e1485742d648c0b0686b6e5d",
    ],
    // starknet: [1001, APIStarknetProvider],
  },
  currencies: {
    ETH: {
      image: require("assets/images/currency/ETH.svg"),
      name: "Ethereum",
      decimals: 18,
      chain: {
        1: {
          tokenId: 0,
          contractAddress: "0x0000000000000000000000000000000000000000",
        },
        1000: {
          tokenId: 0,
          contractAddress: "0x0000000000000000000000000000000000000000",
        },
        1001: {
          contractAddress:
            "0x06a75fdd9c9e376aebf43ece91ffb315dbaa753f9c0ddfeb8d7f3af0124cd0b6",
        },
      },
      gasFee: 0.0003,
    },
    USDC: {
      image: require("assets/images/currency/USDC.svg"),
      name: "USDC",
      decimals: 6,
      chain: {
        1: {
          tokenId: 2,
          contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        },
        1000: {
          tokenId: 2,
          contractAddress: "0xeb8f08a975ab53e34d8a0330e0d34de942c95926",
        },
        1001: {
          contractAddress:
            "0x0545d006f9f53169a94b568e031a3e16f0ea00e9563dc0255f15c2a1323d6811",
        },
      },
      gasFee: 1,
    },
    USDT: {
      image: require("assets/images/currency/USDT.svg"),
      name: "USDT",
      decimals: 6,
      chain: {
        1: {
          tokenId: 4,
          contractAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        },
        1000: {
          tokenId: 1,
          contractAddress: "0x3b00ef435fa4fcff5c209a37d1f3dcff37c705ad",
        },
        1001: {
          contractAddress:
            "0x03d3af6e3567c48173ff9b9ae7efc1816562e558ee0cc9abc0fe1862b2931d9a",
        },
      },
      gasFee: 1,
    },
    DAI: {
      image: require("assets/images/currency/DAI.svg"),
      name: "DAI",
      decimals: 18,
      chain: {
        1: {
          tokenId: 1,
          contractAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
        },
        1000: {
          tokenId: 19,
          contractAddress: "0x2e055eee18284513b993db7568a592679ab13188",
        },
      },
      gasFee: 1,
    },
    WBTC: {
      image: require("assets/images/currency/WBTC.svg"),
      name: "Bitcoin",
      decimals: 8,
      chain: {
        1: {
          tokenId: 15,
          contractAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        },
      },
      gasFee: 0.00003,
    },
    FXS: {
      image: require("assets/images/currency/WBTC.svg"),
      name: "Frax Shares",
      decimals: 18,
      chain: {
        1: {
          tokenId: 120,
          contractAddress: "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0",
        },
      },
      gasFee: 0.1,
    },
    FRAX: {
      image: require("assets/images/currency/WBTC.svg"),
      name: "Frax",
      decimals: 18,
      chain: {
        1: {
          tokenId: 92,
          contractAddress: "0x853d955acef822db058eb8505911ed77f175b99e",
        },
      },
      gasFee: 1,
    },
    WETH: {
      image: require("assets/images/currency/ETH.svg"),
      name: "Wrapped Ether",
      decimals: 18,
      chain: {
        1: {
          tokenId: 61,
          contractAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        },
      },
      gasFee: 0.0003,
    },
  },
  validMarkets: {
    // zkSync Mainnet
    1: [
      "ETH-USDT",
      "ETH-USDC",
      "ETH-DAI",
      "ETH-WBTC",
      "USDC-USDT",
      "WBTC-USDT",
      "WBTC-USDC",
      "WBTC-DAI",
      "DAI-USDT",
      "DAI-USDC",
      "WETH-ETH",
      "FXS-FRAX",
      "ETH-FRAX",
    ],
    // zkSync Rinkeby
    1000: [
      "ETH-USDT",
      "ETH-USDC",
      "USDC-USDT",
      "ETH-DAI",
      "DAI-USDT",
      "DAI-USDC",
    ],

    // Starknet Alpha
    1001: ["ETH-USDT", "ETH-USDC"],
  },
});

if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  window.api = api;
}

export { API };
export default api;
