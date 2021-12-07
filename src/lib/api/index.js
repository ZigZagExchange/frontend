import API from './API'
import APIStarknetProvider from './providers/APIStarknetProvider'
import APIZKProvider from './providers/APIZKProvider'

const api = new API({
    infuraId: process.env.REACT_APP_INFURA_ID,
    websocketUrl: process.env.REACT_APP_ZIGZAG_WS,
    networks: {
        mainnet: [1, APIZKProvider],
        rinkeby: [1000, APIZKProvider],
        starknet: [1001, APIStarknetProvider],
    },
    currencies: {
        'ETH': {
            decimals: 18,
            chain: {
                1: { tokenId: 0 },
                1000: { tokenId: 0 },
                1001: { contractAddress: '0x06a75fdd9c9e376aebf43ece91ffb315dbaa753f9c0ddfeb8d7f3af0124cd0b6' },
            },
            gasFee: 0.0003
        },
        'USDC': {
            decimals: 6,
            chain: {
                1: { tokenId: 2 },
                1000: { tokenId: 2 },
                1001: { contractAddress: '0x0545d006f9f53169a94b568e031a3e16f0ea00e9563dc0255f15c2a1323d6811' },
            },
            gasFee: 1
        },
        'USDT': {
            decimals: 6,
            chain: {
                1: { tokenId: 4 },
                1000: { tokenId: 1 },
                1001: { contractAddress: '0x03d3af6e3567c48173ff9b9ae7efc1816562e558ee0cc9abc0fe1862b2931d9a' },
            },
            gasFee: 1
        },
        DAI: {
            decimals: 18,
            name: "Dai",
            chain: {
                1: { tokenId: 1 },
                1000: { tokenId: 19 },
                1001: {
                    contractAddress: null
                },
            },
            gasFee: 1,
        },
        WBTC: {
            decimals: 8,
            name: "Bitcoin",
            chain: {
                1: { tokenId: 15 },
                1000: { tokenId: null },
                1001: {
                    contractAddress: null
                },
            },
            gasFee: 0.00003,
        },
    },
    validMarkets: {
        // zkSync Mainnet
        1: [
            "ETH-USDT",
            "ETH-USDC",
            "ETH-DAI",
            "USDC-USDT",
            "WBTC-USDT",
            "DAI-USDT",
            "DAI-USDC",
            //"FRAX-USDC",
        ],
        // zkSync Rinkeby
        1000: [
            "ETH-USDT",
            "ETH-USDC",
            "USDC-USDT",
            "ETH-DAI",
            "DAI-USDT",
            "DAI-USDC",
        ],

        // Starknet Alpha
        1001: [
            "ETH-USDT",
            "ETH-USDC",
        ]
    }
})

if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
    window.api = api
}

export { API }
export default api
