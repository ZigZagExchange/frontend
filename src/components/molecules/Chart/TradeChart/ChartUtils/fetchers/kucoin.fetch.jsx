//https://api.kucoin.com/api/v1/market/candles?type=1min&symbol=BTC-USDT&startAt=1566703297&endAt=1566789757

export const kucoinFetcher = async (pair, interval) => {
    var url = `https://api.kucoin.com/api/v1/market/candles?type=${interval}&symbol=${pair}`
    return fetch('http://localhost:3005/', {
        headers: {
            'Target-Endpoint': url,
        }
    })
    .then((rsp) => rsp.json())
    .then((json) => {
        if(!json.success) throw new Error("invalid symbol received for KuCoin");
        return json.result;
    });
}
