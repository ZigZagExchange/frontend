//FTX candle adaptor
export const candleAdaptor = (data) => {
    const {
        time,
        open,
        high,
        low,
        close,
        volume
     } = data;

    return {
        time: time / 1000,
        open: open,
        high: high,
        low: low,
        close: close,
        value: volume,
        color: undefined,
    };
};

//ftx socket candle adaptor
export const socketAdaptor = (data) => {
    var candle = data.k;
    var time, open, high, low, close, volume;

    time = candle.t;
    open = candle.o;
    high = candle.h;
    low = candle.l;
    close = candle.c;
    volume = candle.v;

    return {
        time: time / 1000,
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
        value: parseFloat(volume),
        color: undefined,
    };
}; 