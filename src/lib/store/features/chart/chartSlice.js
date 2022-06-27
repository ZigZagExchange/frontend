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
        background: {
          gradient: false,
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
    updateInterval(state, payload ){
      return {
        ...state,
        interval: payload.payload,
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
      console.log(newState);
      state.settings = newState;
    }
  },
  setTradingSetting(state, payload ){
    console.log("payload: ", payload);
    return {
      ...state,
      settings: {
        ...state.settings,
        trading: {
          ...state.settings.trading,
          ...payload,
        }
      }
    };
  },

});

export const {
  resetData,
  updateInterval,
  addFavouriteInterval,
  setSetting,
  setTradingSetting
} = chartSlice.actions;

export const tradingSettingsSelector = (state) => state.chart.settings.trading;
export const chartSettingsSelector = (state) => state.chart.settings;
export const intervalSelector = (state) => state.chart.interval;
export const favouriteIntervalsSelector = (state) => state.chart.favouriteIntervals;

export default chartSlice.reducer;