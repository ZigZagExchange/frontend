import { createSlice, createAction } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import api from 'lib/api'

export const authSlice = createSlice({
  name: 'api',
  initialState: {
    network: 1,
    userId: null,
    currentMarket: 'ETH-USDT',
    marketFills: {},
    bridgeReceipts: [],
    lastPrices: {},
    marketSummary: {},
    balances: {},
    liquidity: [],
    userOrders: {},
    userFills: {},
    orders: {},
  },
  reducers: {
    _fills(state, { payload }) {
      payload[0].forEach(fill => {
        const fillid = fill[1];
        if (
          fill[2] === state.currentMarket &&
          fill[0] === state.network
        ) {
          state.marketFills[fillid] = fill;
        }
        if (
          state.userId &&
          (fill[8] === state.userId.toString() ||
            fill[9] === state.userId.toString())
        ) {
          state.userFills[fillid] = fill;
        }
      });
    },
    _fillstatus(state, { payload }) {
      payload[0].forEach((update) => {
        const fillid = update[1];
        const newstatus = update[2];
        let txhash;
        if (update[3]) txhash = update[3];
        if (state.marketFills[fillid]) {
          state.marketFills[fillid][6] = newstatus;
          if (txhash)
            state.marketFills[fillid][7] = txhash;
        }
        if (state.userFills[fillid]) {
          state.userFills[fillid][6] = newstatus;
          if (txhash)
            state.userFills[fillid][7] = txhash;
        }
      });
    },
    _marketsummary(state, { payload }) {
      state.marketSummary = {
        market: payload[0],
        price: payload[1],
        "24hi": payload[2],
        "24lo": payload[3],
        priceChange: payload[4],
        baseVolume: payload[5],
        quoteVolume: payload[6],
      }
    },
    _lastprice(state, { payload }) {
      payload[0].forEach((update) => {
        const market = update[0];
        const price = update[1];
        const change = update[2];
        if (api.validMarkets[state.network].includes(market)) {
          state.lastPrices[market] = {
            price: update[1],
            change: update[2],
          };
        }
        else {
          delete state.lastPrices[market];
        }
        if (update[0] === state.currentMarket) {
          state.marketSummary.price = price;
          state.marketSummary.priceChange = change;
        }
      });
    },
    _liquidity(state, { payload }) {
      state.liquidity = state.liquidity.concat(payload[2]);
    },
    _orderstatus(state, { payload }) {
      payload[0].forEach(async (update) => {
        let filledOrder
        const [, orderId, newStatus, txHash] = update
        switch (newStatus) {
          case 'c':
            delete state.orders[orderId]
            if (state.userOrders[orderId]) {
              state.userOrders[orderId][9] = 'c'
            }
            break
          case 'pm':
            const remaining = update[4]
            if (state.orders[orderId]) {
              state.orders[orderId][11] = remaining
            }
            if (state.userOrders[orderId]) {
              state.userOrders[orderId][11] = remaining
            }
            break
          case 'm':
            const matchedOrder = state.orders[orderId]
            if (!matchedOrder) return
            matchedOrder[9] = 'm'
            delete state.orders[orderId]
            if (matchedOrder && state.userId && matchedOrder[8] === state.userId.toString()) {
              if (!state.userOrders[matchedOrder[1]]) {
                state.userOrders[matchedOrder[1]] = matchedOrder
              }
            }
            break
          case 'f':
            filledOrder = state.userOrders[orderId]
            if (filledOrder) {
              const sideText = filledOrder[3] === 'b' ? 'buy' : 'sell'
              const baseCurrency = filledOrder[2].split('-')[0]
              filledOrder[9] = 'f'
              filledOrder[10] = txHash
              const noFeeOrder = api.getOrderDetailsWithoutFee(filledOrder)
              toast.success(`Your ${sideText} order for ${noFeeOrder.baseQuantity.toPrecision(4) / 1} ${baseCurrency} @ ${noFeeOrder.price.toPrecision(4) / 1} was filled!`)
            }
            break
          case 'b':
            filledOrder = state.userOrders[orderId]
            if (filledOrder) {
              filledOrder[9] = 'b'
              filledOrder[10] = txHash
            }
            break
          case 'r':
            filledOrder = state.userOrders[orderId]
            if (filledOrder) {
              const sideText = filledOrder[3] === 'b' ? 'buy' : 'sell'
              const error = update[4]
              const baseCurrency = filledOrder[2].split('-')[0]
              filledOrder[9] = 'r'
              filledOrder[10] = txHash
              const noFeeOrder = api.getOrderDetailsWithoutFee(filledOrder)
              toast.error(`Your ${sideText} order for ${noFeeOrder.baseQuantity.toPrecision(4) / 1} ${baseCurrency} @ ${noFeeOrder.price.toPrecision(4) / 1} was rejected: ${error}`)
              toast.info(`This happens occasionally. Run the transaction again and you should be fine.`)
            }
            break
          default:
            break
        }
      })
    },
    _orders(state, { payload }) {
      const orders = payload[0]
        .filter(order => order[2] === state.currentMarket && order[0] === state.network)
        .reduce((res, order) => {
          res[order[1]] = order
          return res
        }, {})

      state.orders = {
        ...state.orders,
        ...orders,
      }

      if (state.userId) {
        for (let i in orders) {
          if (orders[i][8] === state.userId.toString()) {
            const orderId = orders[i][1]
            state.userOrders[orderId] = orders[i]
          }
        }
        const userOpenOrders = Object.values(state.userOrders).filter(o => o[9] === 'o')
        if (userOpenOrders.length > 1 && api.isZksyncChain(state.network)) {
          toast.warn('Filling a new order will cancel all previous orders. It is recommended to only have one open order at a time.', { autoClose: 15000 })
        }
      }
    },
    setBalances(state, { payload }) {
      state.balances = { ...state.balances, ...payload }
    },
    setCurrentMarket(state, { payload }) {
      if (state.currentMarket !== payload) {
        state.currentMarket = payload
        state.marketFills = {}
        state.marketSummary = {}
        state.liquidity = []
        state.userOrders = {}
        state.orders = {}
        state.balances = {}
      }
    },
    setUserId(state, { payload }) {
      state.userId = payload
    },
    setNetwork(state, { payload }) {
      state.network = payload
    },
    clearBridgeReceipts(state) {
      state.bridgeReceipts = []
    },
    addBridgeReceipt(state, { payload }) {
      if (!payload || !payload.txId) return
      const { amount, token, txUrl, type } = payload

      toast.success(
        <>
          Successfully
          {' '}{type === 'deposit' ? 'deposited' : 'withdrew'}
          {' '}{amount} {token}
          {' '}{type === 'deposit' ? 'in your zSync wallet' : 'into your Ethereum wallet. Withdraws can take up to 7 hours to complete'}.
          <br /><br />
          <a href="https://zksync.io/faq/faq.html#how-long-are-withdrawal-times"
            style={{ color: 'white', textDecoration: 'underline', fontWeight: 'bold' }}
            target="_blank"
            rel="noreferrer">
              Bridge FAQ
          </a>
          <br />
          <a href={txUrl}
            style={{ color: 'white', textDecoration: 'underline', fontWeight: 'bold' }}
            target="_blank"
            rel="noreferrer">
              View transaction
          </a>
        </>
      )

      state.bridgeReceipts.unshift(payload)
    },
    resetData(state) {
      state.userFills = {}
      state.marketFills = {}
      state.marketSummary = {}
      state.liquidity = []
      state.userOrders = {}
      state.orders = {}
      state.lastPrices = {}
      state.balances = {}
    }
  },
})

export const { setNetwork, clearBridgeReceipts, setBalances, setUserId, addBridgeReceipt, setCurrentMarket, resetData } = authSlice.actions

export const networkSelector = state => state.api.network
export const userOrdersSelector = state => state.api.userOrders
export const userFillsSelector = state => state.api.userFills
export const allOrdersSelector = state => state.api.orders
export const marketFillsSelector = state => state.api.marketFills
export const lastPricesSelector = state => state.api.lastPrices
export const marketSummarySelector = state => state.api.marketSummary
export const liquiditySelector = state => state.api.liquidity
export const currentMarketSelector = state => state.api.currentMarket
export const bridgeReceiptsSelector = state => state.api.bridgeReceipts
export const balancesSelector = state => state.api.balances

export const handleMessage = createAction('api/handleMessage')

export default authSlice.reducer
