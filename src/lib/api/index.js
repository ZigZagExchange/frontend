import API from "./API";
// import APIStarknetProvider from './providers/APIStarknetProvider'
import APIZKProvider from "./providers/APIZKProvider/APIZKProvider";

const api = new API({
  infuraId: process.env.REACT_APP_INFURA_ID,
  networks: {
    zksync: [
      1,
      APIZKProvider,
      "0xaBEA9132b05A70803a4E85094fD0e1800777fBEF" // L1 contract
    ],
    "zksync-goerli": [
      1002,
      APIZKProvider,
      "0x82f67958a5474e40e1485742d648c0b0686b6e5d", // L1 contract
    ],
  },
});

if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  window.api = api;
}

export { API };
export default api;
