export const coinexFetcher = async (pair, interval) => {
    var url = `https://api.coinex.com/v1/market/kline?market=${pair}&type=${interval}&limit=1000`;
    return fetch(url, { method: "GET", headers: { 'Content-Type': 'application/json',}})
    .then((rsp) => rsp)
    .then((data) => {
        return data;
    });
}
