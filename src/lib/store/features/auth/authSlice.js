import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: {},
  },
  reducers: {
    updateAccountState(state, { payload }) {
      if (state.user && (state.user.id && payload.id) !== undefined) {
        state.user = payload;
      }
    },
    signIn(state, action) {
      state.user = action.payload;
    },
    signOut(state) {
      state.user = {};
    },
  },
});

export const { signIn, signOut, updateAccountState } = authSlice.actions;

export const userSelector = (state) => state.auth.user;

export default authSlice.reducer;
