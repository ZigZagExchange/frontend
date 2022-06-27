import { binanceFormatter } from "./binance.format";
import { coinbaseFormatter } from "./coinbase.format";
import { coinexFormatter } from "./coinex.format";
import { ftxFormatter } from "./ftx.format";

//formatters
export const candleStickFormatter = (transformedData, exchange) => {
    var formattedData = [];

    switch(exchange.toLowerCase()){
        case 'coinbase':
            formattedData = coinbaseFormatter(transformedData);
            break;
        case 'coinex':
            formattedData = coinexFormatter(transformedData);
            break;
        case 'ftx':
            formattedData = ftxFormatter(transformedData);
            return transformedData;
        case 'binance':
        default:
            formattedData = binanceFormatter(transformedData);
            break;
    }
    return formattedData;

}