import { candleAdaptor as binance, socketAdaptor as binanceSocket } from "./binance.adapt";
import { candleAdaptor as ftx, socketAdaptor as ftxSocket } from "./ftx.adapt";
import { candleAdaptor as coinbase, socketAdaptor as coinbaseSocket } from "./coinbase.adapt";
import { candleAdaptor as coinex } from "./coinex.adapt";

export const binanceAdaptor = binance;
export const binanceSocketAdaptor = binanceSocket;

export const coinbaseAdaptor = coinbase;
export const coinbaseSocketAdaptor = coinbaseSocket;

export const ftxAdaptor = ftx;
export const ftxSocketAdaptor = ftxSocket;

export const coinexAdaptor  = coinex;