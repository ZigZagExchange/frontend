import { takeEvery, put, all } from 'redux-saga/effects'
import { setUserId, resetData } from './apiSlice'
import { signOut } from '../auth/authSlice'

function *handleSingleMessageSaga({ payload }) {
    yield put({
        type: `api/_${payload.operation}`,
        payload: payload.args,
    })
}

function *delegateAuthChange({ type, payload }) {    
    if (type !== 'auth/signIn') {
        yield put(resetData())
    }
    
    if (type === 'auth/signIn' || type === 'auth/signOut') {
        yield put(setUserId(payload && payload.id))
    } else if (type === 'api/setNetwork') {
        yield put(signOut())
    }
}

export function *messageHandlerSaga() {
    yield all([
        takeEvery('api/handleMessage', handleSingleMessageSaga),
        takeEvery('api/setNetwork', delegateAuthChange),
        takeEvery('auth/signIn', delegateAuthChange),
        takeEvery('auth/signOut', delegateAuthChange),
    ])
}
