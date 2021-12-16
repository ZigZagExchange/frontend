import api from 'lib/api'
import { takeEvery, put, all, select, delay, apply } from 'redux-saga/effects'
import { setUserId, resetData } from './apiSlice'

function *handleSingleMessageSaga({ payload }) {
    yield put({
        type: `api/_${payload.operation}`,
        payload: payload.args,
    })
}

function *delegateAuthChangeSaga({ type, payload }) {    
    if (type.indexOf('auth/') !== 0) {
        yield put(resetData())
    }
    
    if (type === 'auth/signIn' || type === 'auth/signOut') {
        yield put(setUserId((payload && payload.id) || null))
    }
}

export function *messageHandlerSaga() {
    yield all([
        takeEvery('api/handleMessage', handleSingleMessageSaga),
        takeEvery('auth/signOut', delegateAuthChangeSaga),
        takeEvery('auth/signIn', delegateAuthChangeSaga),
    ])
}

export function *userPollingSaga() {
    while (1) {
        const address = yield select(state => {
            return state.auth.user && state.auth.user.address
        })

        if (address) {
            try {
                yield all([
                    apply(api, api.getBalances),
                    apply(api, api.getWalletBalances),
                    apply(api, api.getAccountState),           
                ])
            } catch (err) {
                console.log(err)
            }
        }

        yield delay(4000)
    }
}

export default function *apiSaga() {
    yield all([
        userPollingSaga(),
        messageHandlerSaga(),
    ])
}