import { createSlice } from "@reduxjs/toolkit";

export const chartSlice = createSlice({
  name: "chart",
  initialState: {
    interval: '1d',
    favouriteIntervals: [],

    settings: {
      trading: {
        showOrders: true,
        showExecutions: true,
        extendLines: true,
        playSound: false,
      },
      background: {
        gradient: false,
        color: {
          r: 19,
          g: 23,
          b: 34,
          a: 1
        },
        watermark: {
          enabled: true,
          text: '',
        },
      },
      timezone: {
        locale: '-4 UCT (NY)',
        showSessions: false,
      }
    },
  },
  reducers: {
    resetData(state) {
      state.interval = "1d";
      state.favouriteIntervals = [];
    },
    resetTrading(state) {
      state.settings.trading = {
        showOrders: true,
        showExecutions: true,
        extendLines: true,
        playSound: false,
      }
    },
    resetBackground(state){
      state.settings.background = {
        gradient: false,
        color: {
          r: 19,
          g: 23,
          b: 34,
          a: 1,
        },
      }
    },

    updateInterval(state, { payload } ){
      return {
        ...state,
        interval: payload,
      };
    },
    addFavouriteInterval(state, { payload } ){
      //already inside of favourites
      let items = state.favouriteIntervals.filter((i) => i.value === payload.value);
      if(items.length) return state;

      state.favouriteIntervals.push(payload);
      return state;
    },

    setSetting(state, { payload }){
      const newState = {
        ...state,
        settings: {
          ...state.settings,
          ...payload, 
        }
      };
      state = newState;
      return state;
    },
    setTradingSetting(state, { payload } ){
      const newState = {
        ...state,
        settings: {
          ...state.settings,
          trading: {
            ...state.settings.trading,
            ...payload,

          },
        },
      };

      state = newState;
      return state;
    },
    setBackgroundSetting(state, { payload } ){
      const newState = {
        ...state,
        settings: {
          ...state.settings,
          background: {
            ...state.settings.background,
            ...payload,

          },
        },
      };

      state = newState;
      return state;
    },


  },
});

export const {
  resetData,
  resetTrading,
  resetBackground,

  updateInterval,
  addFavouriteInterval,
  setSetting,
  setTradingSetting,
  setBackgroundSetting
} = chartSlice.actions;

export const tradingSettingsSelector = (state) => state.chart.settings.trading;
export const chartSettingsSelector = (state) => state.chart.settings;
export const intervalSelector = (state) => state.chart.interval;
export const favouriteIntervalsSelector = (state) => state.chart.favouriteIntervals;

export default chartSlice.reducer;
