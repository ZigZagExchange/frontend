export const ftxFetcher = async (pair, interval) => {
    var url = `https://ftx.com/api/markets/${pair}/candles?resolution=${interval}`
    return fetch('http://localhost:3005/', {
        headers: {
            'Target-Endpoint': url,
        }
    })
    .then((rsp) => rsp.json())
    .then((json) => {
        if(!json.success) throw new Error("invalid symbol received for FTX");
        return json.result;
    });
}
