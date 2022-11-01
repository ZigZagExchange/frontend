import zksyncLogo from "assets/images/logo.svg";
import ethLogo from "assets/images/currency/ETH.svg";

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
    to: [{ network: "Ethereum", key: "ethereum", icon: ethLogo }],
  },
];
