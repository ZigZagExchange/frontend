import ftxIntervals from '../intervals/ftx';
import binanceIntervals from '../intervals/binance';
import coinbaseIntervals from '../intervals/coinbase';
import coinexIntervals from '../intervals/coinex';

//get intervals formatted to the corresponding exchange's usage
const getIntervals = (exchange) => {
    let intervals = [];
    switch (exchange.toLowerCase()) {
        case "ftx":
            intervals = ftxIntervals;
            break;
        case "coinbase":
            intervals = coinbaseIntervals;
            break;
        case "coinex":
            intervals = coinexIntervals;
            break;
        case "binance":
        default:
            intervals = binanceIntervals;
            break;
    }
    return intervals;
}

export default getIntervals;