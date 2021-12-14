import { all } from 'redux-saga/effects'
import { messageHandlerSaga } from 'lib/store/features/api/apiSaga'
import { networkHandlerSaga } from 'lib/store/features/auth/authSaga'

export default function *rootSaga() {
    yield all([
        messageHandlerSaga(),
        networkHandlerSaga(),
    ])
}