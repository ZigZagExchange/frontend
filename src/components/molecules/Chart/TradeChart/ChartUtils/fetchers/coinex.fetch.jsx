export const coinexFetcher = async (pair, interval) => {
    var url = `https://api.coinex.com/v1/market/kline?market=${pair}&type=${interval}&limit=1000`;
    return fetch('http://localhost:3005/', {
        headers: {
            'Target-Endpoint': url,
        }
    })
    .then((rsp) => rsp.json())
    .then((json) => {
        console.log(json);
        if(json.code) throw new Error(json.message);
        return json.data;
    });
}
