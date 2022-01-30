import React from 'react'
import styled from '@xstyled/styled-components'
import TradePriceTable from './TradePriceTable/TradePriceTable'
import TradePriceHeadSecond from './TradePriceHeadSecond/TradePriceHeadSecond'

const StyledTradeBooks = styled.section`
    display: flex;
    flex-direction: column;
    grid-area: books;
`

export default function TradeBooks(props) {
    return (
        <StyledTradeBooks>
            <TradePriceTable
                className="trade_table_asks"
                useGradient="true"
                priceTableData={props.priceTableData}
                currentMarket={props.currentMarket}
                scrollToBottom="true"
            />
            <TradePriceHeadSecond
                lastPrice={props.lastPrice}
            />
            <TradePriceTable
                useGradient="true"
                currentMarket={props.currentMarket}
                priceTableData={props.bidBins}
            />
        </StyledTradeBooks>
    )
}