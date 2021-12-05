import { all } from 'redux-saga/effects'
import { messageHandlerSaga } from 'lib/store/features/api/apiSaga'

export default function *rootSaga() {
    yield all([
        messageHandlerSaga(),
    ])
}