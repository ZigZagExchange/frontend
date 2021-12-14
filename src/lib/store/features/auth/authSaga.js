import { REHYDRATE } from 'redux-persist'
import { takeEvery, select } from 'redux-saga/effects'
import api from 'lib/api'

function *handleHydration() {
    const network = yield select(state => state.api && state.api.network)
    if (network) api.setAPIProvider(network)
    console.log('net', network)
}

export function *networkHandlerSaga() {
    yield takeEvery(REHYDRATE, handleHydration)
}
