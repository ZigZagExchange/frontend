//coinbase candle adaptor
export const candleAdaptor = (currCandle) => {
    var time = currCandle[0],
    low = currCandle[1],
    high = currCandle[2],
    open = currCandle[3],
    close = currCandle[4],
    volume = currCandle[5];

    const candle = {
        time: time,
        open: open,
        high: high,
        low: low,
        close: close,
        value: volume,
    };

    return candle;
}

//coinbase socket adaptor
export const socketAdaptor = (
    data, 
    resolution=60 //interval in seconds
) => {
    var {time, price, size} = data;

    let roundedTime = Math.floor(new Date(time) / 60000) * resolution;
    price = parseFloat(price);
    size = parseFloat(size);

    // we parse the prices at 
    // a later point where we have access to candle history
    const candle = {
        time: roundedTime,
        open: price,
        high: price,
        low: price,
        close: price,
        value: size,
    };

    return candle;
}