import { all } from "redux-saga/effects";
import authSaga from "lib/store/features/auth/authSaga";
import apiSaga from "lib/store/features/api/apiSaga";

export default function* rootSaga() {
  yield all([authSaga(), apiSaga()]);
}
