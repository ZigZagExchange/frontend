export const binanceFetcher = async (pair, interval) => {
    var url = "".concat("https://api.binance.com/api/v3/klines?symbol=", pair).concat("&interval=", interval);
    return fetch(url, {
        mode: 'cors',
    })
    .then((rsp) => rsp.json())
    .then((data) => data);
}
