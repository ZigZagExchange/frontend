import { formatCoinbaseInterval, formatCoinexInterval } from "../helpers";
import { binanceFetcher } from "./binance.fetch";
import { coinbaseFetcher } from "./coinbase.fetch";
import { coinexFetcher } from "./coinex.fetch";
import { ftxFetcher } from "./ftx.fetch";
import { kucoinFetcher } from "./kucoin.fetch";

// fetchers, do any pair manipulating inside of here
export const fetcher = async (pair, interval, exchange) => {
    var fnc, formattedPair, formattedInterval;
    var _p;

    switch(exchange.toLowerCase()){
        case "coinbase":
            if(pair.length === 8) _p = pair.match(/.{1,4}/g);
            if(pair.length === 6) _p = pair.match(/.{1,3}/g);
            
            formattedPair = _p[0] + "-" + _p[1];
            formattedInterval = formatCoinbaseInterval(interval);
            fnc = coinbaseFetcher;
            break;
        case "coinex":
            formattedPair = pair;
            formattedInterval = formatCoinexInterval(interval);
            fnc = coinexFetcher;
            break;
        case "ftx":
            // https://ftx.com/api/markets/btc/usd/candles?resolution=3600
            // has to be split
            if(pair.length === 8) _p = pair.match(/.{1,4}/g);
            if(pair.length === 6) _p = pair.match(/.{1,3}/g);
            
            formattedPair = _p[0] + "/" + _p[1];
            formattedInterval = formatCoinbaseInterval(interval);
            fnc = ftxFetcher;
            break;
        case "kucoin":
            if(pair.length === 8) _p = pair.match(/.{1,4}/g);
            if(pair.length === 6) _p = pair.match(/.{1,3}/g);

            formattedPair = _p[0] + "/" + _p[1];
            formattedInterval = formatCoinexInterval(interval);
            fnc = kucoinFetcher;
            break;
        case "binance":
        default:
            formattedPair = pair.toUpperCase();
            formattedInterval = interval;
            fnc = binanceFetcher;
            break;
    }
    //request data
    var transformedData = await fnc(formattedPair, formattedInterval);
    return transformedData;
}
