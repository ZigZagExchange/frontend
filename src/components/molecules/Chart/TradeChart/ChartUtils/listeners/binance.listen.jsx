import { binanceSocketAdaptor } from "../adaptors";

const binanceListener = (ws, fnc) => {
    ws.onopen = () => {}
    ws.onmessage = (e) => {
        const transformedData = JSON.parse(e.data);
        const candle = binanceSocketAdaptor(transformedData);
        //add candle
        fnc(candle);
    }
};
export default binanceListener;