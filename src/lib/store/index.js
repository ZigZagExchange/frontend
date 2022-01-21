import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer, { signIn, signOut, updateAccountState } from 'lib/store/features/auth/authSlice'
import apiReducer, { handleMessage, setBalances, addBridgeReceipt, setNetwork, clearUserOrders, setArweaveAllocation } from 'lib/store/features/api/apiSlice'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import api from 'lib/api'
import sagas from './sagas'

const persistConfig = {
    key: 'root',
    whitelist: [],
    stateReconciler: autoMergeLevel2,
    storage,
}

const apiPersistConfig = {
    key: 'api',
    whitelist: ['userId', 'currentMarket', 'bridgeReceipts', 'network'],
    storage,
}

const authPersistConfig = {
    key: 'auth',
    whitelist: ['user'],
    storage,
}

const sagaMiddleware = createSagaMiddleware()

const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    api: persistReducer(apiPersistConfig, apiReducer),
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: [sagaMiddleware]
})

sagaMiddleware.run(sagas)

export const persistor = persistStore(store)

api.on('accountState', (accountState) => {
    store.dispatch(updateAccountState(accountState))
})

api.on('bridgeReceipt', (bridgeReceipt) => {
    store.dispatch(addBridgeReceipt(bridgeReceipt))
})

api.on('balanceUpdate', (network, balances) => {
    store.dispatch(setBalances({
        key: network,
        balances,
    }))
})

api.on('arweaveAllocationUpdate', (bytes) => {
    store.dispatch(setArweaveAllocation(bytes))
})

api.on('signIn', (accountState) => {
    store.dispatch(signIn(accountState))
})

api.on('signOut', (accountState) => {
    store.dispatch(clearUserOrders())
    store.dispatch(signOut())
})

api.on('providerChange', (network) => {
    store.dispatch(setNetwork(network))
})

api.on('message', (operation, args) => {
    store.dispatch(handleMessage({ operation, args }))
})

export default store
