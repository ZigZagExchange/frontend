import { formatCoinbaseInterval, formatCoinexInterval } from "../helpers";
import { binanceFetcher } from "./binance.fetch";
import { coinbaseFetcher } from "./coinbase.fetch";
import { coinexFetcher } from "./coinex.fetch";

//fetchers, do any pair manipulating inside of here
export const fetcher = async (pair, interval, exchange) => {
    var fnc, formattedPair, formattedInterval;

    switch(exchange.toLowerCase()){
        case "coinbase":
            formattedPair = pair;
            formattedInterval = formatCoinbaseInterval(interval);
            fnc = coinbaseFetcher;
            break;
        case "coinex":
            formattedPair = pair;
            formattedInterval = formatCoinexInterval(interval);
            fnc = coinexFetcher;
            break;
        case "binance":
        default:
            formattedPair = pair;
            formattedInterval = interval;
            fnc = binanceFetcher;
            break;
    }
    //request data
    var transformedData = await fnc(formattedPair, formattedInterval);
    return transformedData;
}
