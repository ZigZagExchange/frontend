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