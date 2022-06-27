//kucoin candle adaptor
export const candleAdaptor = (data) => {
    if(data.length !== 7) throw new Error("invalid candle received");

    const [
        time,
        open,
        close,
        high,
        low,
        volume,
      ] = data;

    return {
        time: parseFloat(time) / 1000,
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
        value: parseFloat(volume),
        color: undefined,

    };
};

//kucoin socket candle adaptor
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
