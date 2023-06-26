import zksyncLogo from "assets/images/zksynclogo.svg";
import ethLogo from "assets/images/ethlogo.svg";

export const ETH_ZKSYNC_BRIDGE = {
  ethTozkSync: "eth_to_zksync",
};

export const ZKSYNC_ETHEREUM_FAST_BRIDGE = {
  address: "0xCC9557F04633d82Fb6A1741dcec96986cD8689AE",
  key: "zksync_ethereum",
  eligibleTokensZkSync: ["ETH"],
  eligibleTokensEthereum: [],
  receiptKeyZkSync: "withdraw_fast",
};

export const NETWORKS = [
  {
    from: {
      name: "Ethereum",
      id: "ethereum",
      icon: ethLogo,
    },
    to: [{ name: "zkSync Lite", id: "zksync", icon: zksyncLogo }],
  },
  {
    from: {
      name: "zkSync Lite",
      id: "zksync",
      icon: zksyncLogo,
    },
    to: [{ name: "Ethereum", id: "ethereum", icon: ethLogo }],
  },
];
