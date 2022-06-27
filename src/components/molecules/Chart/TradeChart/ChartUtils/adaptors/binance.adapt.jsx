//binance candle adaptor
export const candleAdaptor = (data) => {
    if(data.length !== 12) throw new Error("invalid candle received");

    const [
        openTime,
        open,
        high,
        low,
        close,
        volume,
        //closeTime,
        //quoteAssetVolume,
        //numberOfTrades,
        //takerBuyBaseAssetVolume,
        //takerBuyQuotessetVolume,
        //ignore,
      ] = data;

    return {
        time: openTime / 1000,
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
        value: parseFloat(volume),
        color: undefined,
        // closeTime,
        // quoteAssetVolume,
        // numberOfTrades,
        // takerBuyBaseAssetVolume,
        // takerBuyQuotessetVolume,
        // ignore,
    };
};

//binance socket candle adaptor
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
