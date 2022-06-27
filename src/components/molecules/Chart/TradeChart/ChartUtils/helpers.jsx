const { useEffect } = require("react");

export function useHandleClickOutside(ref, fnc) {
    useEffect(() => {
        const mouseAway = (e) => {
            if(ref.current && !ref.current.contains(e.target)){
                fnc();
            }
        }

        document.addEventListener('mousedown', mouseAway)
        return () => {
            document.removeEventListener('mousedown', mouseAway);
        }
    }, [ref]);
}

//format interval from string to seconds
export const formatCoinbaseInterval = (interval) => {
    switch(interval.toLowerCase()){
        case '1m': 
            return 60;
        case '5m':
            return 300;
        case '15m':
            return 900;
        case "1h":
            return 3600;
        case "1d":
            return 86400;
        case "1w":
            return 604800;
        default:
            return 86400;
    }
}

export const formatCoinexInterval = (interval) => {
    switch(interval.toLowerCase()){
        case '1m':
            return "1min";
        case '5m':
            return "5min";
        case '15m':
            return "15min";
        case "30m":
            return "30min";
        case "1h":
            return "1hour";
        case "4h":
            return "4hour";
        case "1d":
            return "1day";
        case "1w":
            return "1week";
        default:
            return "1hour";
    }
}

//get product information from coinbase
export const getCoinbaseProduct = async (pair) => {
    let response = await fetch(`https://api.exchange.coinbase.com/products/${pair}/stats`);
    let stats = response.json();
    return stats;
}
