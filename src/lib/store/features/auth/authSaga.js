import { REHYDRATE } from "redux-persist";
import { takeEvery, select, apply, all } from "redux-saga/effects";
import api from "lib/api";

function* handleHydration({ payload }) {
  if (payload && payload.network) {
    const user = yield select((state) => state.auth && state.auth.user);
    api.setAPIProvider(payload.network);

    if (user && user.id) {
      try {
        yield apply(api, api.signIn, [payload.network]);
      } catch (err) {
        api.signOut();
        console.log("There was an error reauthenticating", err);
      }
    }
  }
}

export function* authHandlerSaga() {
  yield takeEvery(REHYDRATE, handleHydration);
}

export default function* authSaga() {
  yield all([authHandlerSaga()]);
}
