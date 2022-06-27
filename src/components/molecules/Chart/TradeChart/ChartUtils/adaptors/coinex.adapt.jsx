//coinex candle adaptor
export const candleAdaptor = (currCandle) => {
    var time = currCandle[0],
    open = currCandle[1],
    close = currCandle[2],
    high = currCandle[3],
    low = currCandle[4],
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