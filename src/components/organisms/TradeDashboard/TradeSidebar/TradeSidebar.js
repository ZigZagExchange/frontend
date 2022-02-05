import React from 'react'
import styled from '@xstyled/styled-components'
import TradePriceBtcTable from './TradePriceBtcTable/TradePriceBtcTable'
import SpotBox from './SpotBox/SpotBox'

const StyledTradeSidebar = styled.aside`
    display: flex;
    flex-direction: column;
    grid-area: sidebar;
`

export default function TradeSidebar(props) {
    return (
        <StyledTradeSidebar>
            <TradePriceBtcTable
                rowData={props.lastPriceTableData}
                updateMarketChain={props.updateMarketChain}
                markets={props.markets}
                currentMarket={props.currentMarket}
            />
            <div style={{flex: 1}}>
                <SpotBox
                    lastPrice={props.lastPrice}
                    user={props.user}
                    currentMarket={props.currentMarket}
                    activeOrderCount={props.activeOrderCount}
                    liquidity={props.liquidity}
                    marketInfo={props.marketInfo}
                />
            </div>
        </StyledTradeSidebar>
    )
}