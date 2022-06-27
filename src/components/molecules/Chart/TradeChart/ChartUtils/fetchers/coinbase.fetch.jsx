export const coinbaseFetcher = async (pair, interval) => {
    var url = `https://api.exchange.coinbase.com/products/${pair.toLowerCase()}/candles?granularity=${interval}`
    return fetch(url)
    .then((rsp) => rsp.json())
    .then((json) => json);
}
