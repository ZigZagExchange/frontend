import API from "./API";
// import APIStarknetProvider from './providers/APIStarknetProvider'
<<<<<<< HEAD
import APIZKProvider from "./providers/APIZKProvider";
=======
import APIZKProvider from './providers/APIZKProvider/APIZKProvider'
>>>>>>> 908b0b93f469d573ee049cf8eef2e5d168be01e6

const api = new API({
  infuraId: process.env.REACT_APP_INFURA_ID,
  networks: {
    mainnet: [1, APIZKProvider, "0xaBEA9132b05A70803a4E85094fD0e1800777fBEF"],
    rinkeby: [
      1000,
      APIZKProvider,
      "0x82f67958a5474e40e1485742d648c0b0686b6e5d",
    ],
    // starknet: [1001, APIStarknetProvider],
  },
});

if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  window.api = api;
}

export { API };
export default api;
