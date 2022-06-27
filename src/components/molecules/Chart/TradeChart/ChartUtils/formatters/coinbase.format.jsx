import { candleAdaptor } from '../adaptors/coinbase.adapt';

export const coinbaseFormatter = (transformedData) => {
    if(!Array.isArray(transformedData)) {
        if(typeof transformedData === "object"){
            if(transformedData.message === "NotFound"){
                console.error("binance: pair not found");
                throw new Error("Invalid Symbol");
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

    //reverse data
    const formattedData = accus.reverse();

    return formattedData;
}
