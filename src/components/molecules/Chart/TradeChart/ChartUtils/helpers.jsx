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

export const formatCoinbaseInterval = (interval) => {
    switch(interval.toLowerCase()){
        case '1m':
            return 60;
        case '5m':
            return 300;
        case '15m':
            return 900;
        case "30m":
            return 1800;
        case "1h":
            return 3600;
        case "4h":
            return 14400;
        case "1d":
            return 56400;
        case "1w":
            return 604800;
        default:
            return 1800;
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
            return "30m";
        case "1h":
            return "1hour";
        case "4h":
            return "4hour";
        case "1d":
            return "1day";
        case "1w":
            return "1week";
        default:
            return "30m";
    }
}