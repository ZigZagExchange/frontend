const notImplemented = method => () => { throw new Error(`APIProvider method not implemented: ${method}`) }

export default class APIProvider {
    // Methods required to be implemented
    signIn          = notImplemented('signIn')
    signOut         = notImplemented('signOut')
    getAccountState = notImplemented('getAccountState')
    submitOrder     = notImplemented('submitOrder')

    constructor(api, network) {
        this.api = api
        this.network = network
    }
}