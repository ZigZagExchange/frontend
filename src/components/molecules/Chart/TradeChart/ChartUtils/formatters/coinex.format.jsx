import { candleAdaptor } from '../adaptors/coinex.adapt';

export const coinexFormatter = (transformedData) => {
    if(!Array.isArray(transformedData)) {
        if(typeof transformedData === "object"){
            if(transformedData.code === 2){
                console.error("coinex: pair not found");
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
    return accus;
}
