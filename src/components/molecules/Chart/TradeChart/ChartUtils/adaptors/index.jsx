import { candleAdaptor as binance, socketAdaptor as binanceSocket } from "./binance.adapt";
import { candleAdaptor as coinbase } from "./coinbase.adapt";
import { candleAdaptor as coinex } from "./coinex.adapt";

export const binanceAdaptor = binance;
export const binanceSocketAdaptor = binanceSocket;
export const coinbaseAdaptor = coinbase;
export const coinexAdaptor = coinex;