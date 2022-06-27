 //default settings object
 export const chartStorageLayout = {
    interval: '1h',
    favouriteIntervals: [],
}

//get chart settings from storage as parsed object
export const getChartSettings = () => {
    if(!localStorage) return chartStorageLayout;

    var rawChartSettings = localStorage.getItem("persist:chart");
    if(!rawChartSettings) return chartStorageLayout;

    const chartSettings = JSON.parse(rawChartSettings);
    return chartSettings;
}
//set chart settings from storage as parsed object
export const setChartSettings = (value = chartStorageLayout) => {
    if(!localStorage) return chartStorageLayout;

    const chartSettings = {...chartStorageLayout, ...value};
    localStorage.setItem("persist:chart", JSON.stringify(chartSettings));
    return chartSettings;
}