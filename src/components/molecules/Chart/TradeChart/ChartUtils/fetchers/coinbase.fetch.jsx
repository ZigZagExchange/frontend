export const coinbaseFetcher = async (pair, interval, setError) => {
    const url = `https://api.exchange.coinbase.com/products/${pair.toLowerCase()}/candles?granularity=${interval}`
    const data = await fetch(url)
    .then((rsp) => rsp.json())
    .then((json) => {
        if(json.message === "Unsupported granularity") {
            setError("Unsupported time interval.");
        }

        return json
    })
    return data;
}
