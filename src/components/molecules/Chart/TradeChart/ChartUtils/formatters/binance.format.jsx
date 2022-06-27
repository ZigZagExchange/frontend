import { candleAdaptor } from '../adaptors/binance.adapt';

export const binanceFormatter = (transformedData) => {
    if(!Array.isArray(transformedData)) {
        if(typeof transformedData === "object"){
            if(transformedData.code === -1121){
                throw new Error("Invalid symbol");
            }
        }
        throw new Error("Data received was not typeof Array");
    }

    let accus = [];
    transformedData.reduce((accu, curr) => {
        const candle = candleAdaptor(curr);
        accus.push(candle);
        return accu;
    }, []);

    return accus;
}
