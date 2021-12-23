const notImplemented = function (method) {
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
    depositL2Fee    = notImplemented('depositL2Fee')
    withdrawL2Fee   = notImplemented('withdrawL2Fee')
    getBalances     = notImplemented('getBalances')
    getProfile      = notImplemented('getProfile')

    constructor(api, network) {
        this.api = api
        this.network = network
    }
}