const notImplemented = function (fn, method) {
    const x = () => { throw new Error(`APIProvider method not implemented: ${method}`) }
    x.notImplemented = true
    return x
}

export default class APIProvider {
    // Methods required to be implemented
    signIn          = notImplemented('signIn')
    signOut         = notImplemented('signOut')
    getAccountState = notImplemented('getAccountState')
    submitOrder     = notImplemented('submitOrder')
    depositL2       = notImplemented('depositL2')
    withdrawL2      = notImplemented('withdrawL2')
    getBalances     = notImplemented('getBalances')
    getProfile      = notImplemented('getProfile')

    constructor(api, network) {
        this.api = api
        this.network = network
    }
}