const notImplemented = function (method) {
  const x = () => {
    throw new Error(`APIProvider method not implemented: ${method}`);
  };
  x.notImplemented = true;
  return x;
};

export default class APIProvider {
  // Methods required to be implemented
  signIn = notImplemented("signIn");
  signOut = notImplemented("signOut");
  getAccountState = notImplemented("getAccountState");
  submitOrder = notImplemented("submitOrder");
  depositL2 = notImplemented("depositL2");
  withdrawL2Normal = notImplemented("withdrawL2Normal");
  withdrawL2Fast = notImplemented("withdrawL2Fast");
  withdrawL2GasFee = notImplemented("withdrawL2GasFee");
  withdrawL2FastBridgeFee = notImplemented("withdrawL2FastBridgeFee");
  getBalances = notImplemented("getBalances");

  constructor(api, network) {
    this.api = api;
    this.network = network;
    this.websocketUrl = process.env.REACT_APP_ZIGZAG_WS;

    // set ws URL to staging server for test networks
    if ([1002].includes(network) && process.env.REACT_APP_ZIGZAG_WS_STAGING) {
      this.websocketUrl = process.env.REACT_APP_ZIGZAG_WS_STAGING;
    }
  }
}
