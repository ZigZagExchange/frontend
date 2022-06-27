import { all } from "redux-saga/effects";
import authSaga from "lib/store/features/auth/authSaga";
import apiSaga from "lib/store/features/api/apiSaga";
import chartSaga from "./features/chart/chartSaga";

export default function* rootSaga() {
  yield all([authSaga(), apiSaga(), chartSaga()]);
}
