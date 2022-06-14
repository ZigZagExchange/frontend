import zksyncLogo from "assets/images/logo.svg";
import ethLogo from "assets/images/currency/ETH.svg";
import polygonLogo from "assets/images/polygon.png";

export const POLYGON_MUMBAI_WETH_ADDRESS =
  "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa";
export const POLYGON_MAINNET_WETH_ADDRESS =
  "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";

export const ZKSYNC_POLYGON_BRIDGE = {
  address: "0xbb256f544b8087596e8e6cdd7fe9726cc98cb400",
  key: "zksync_polygon",
  eligibleTokensZkSync: ["ETH"],
  eligibleTokensPolygon: ["WETH"],
  zkSyncToPolygon: "zkSync_to_polygon",
  polygonToZkSync: "polygon_to_zkSync",
};

export const ETH_ZKSYNC_BRIDGE = {
  ethTozkSync: "eth_to_zksync",
};

export const ZKSYNC_ETHEREUM_FAST_BRIDGE = {
  address: "0xCC9557F04633d82Fb6A1741dcec96986cD8689AE",
  key: "zksync_ethereum",
  eligibleTokensZkSync: ["ETH", "FRAX", "UST"],
  eligibleTokensEthereum: [],
  receiptKeyZkSync: "withdraw_fast",
};

export const NETWORKS = [
  {
    from: {
      network: "Ethereum",
      key: "ethereum",
      icon: ethLogo,
    },
    to: [{ network: "zkSync", key: "zksync", icon: zksyncLogo }],
  },
  {
    from: {
      network: "zkSync",
      key: "zksync",
      icon: zksyncLogo,
    },
    to: [
      { network: "Ethereum", key: "ethereum", icon: ethLogo },
      { network: "Polygon", key: "polygon", icon: polygonLogo },
    ],
  },
  {
    from: {
      network: "Polygon",
      key: "polygon",
      icon: polygonLogo,
    },
    to: [{ network: "zkSync", key: "zksync", icon: zksyncLogo }],
  },
];
