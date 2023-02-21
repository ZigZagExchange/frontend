import { REHYDRATE } from "redux-persist";
import { takeEvery, select, apply, all } from "redux-saga/effects";
import api from "lib/api";

function* handleHydration({ payload }) {
  if (payload && payload.network) {
    api.setAPIProvider(payload.network);


    // reset state after reload
    api.signOut()
  }
}

export function* authHandlerSaga() {
  yield takeEvery(REHYDRATE, handleHydration);
}

export default function* authSaga() {
  yield all([authHandlerSaga()]);
}
