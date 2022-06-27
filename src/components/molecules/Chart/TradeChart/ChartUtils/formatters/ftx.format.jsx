import { candleAdaptor } from '../adaptors/ftx.adapt';

export const ftxFormatter = (transformedData) => {
    let accus = [];
    transformedData.reduce((accu, curr) => {
        const candle = candleAdaptor(curr);
        accus.push(candle);
        return accu;
    }, 0);
    return accus;
}