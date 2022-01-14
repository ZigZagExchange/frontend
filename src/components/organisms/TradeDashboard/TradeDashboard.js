import React from 'react'
import styled from '@xstyled/styled-components'
import TradeSidebar from './TradeSidebar/TradeSidebar'
import TradeMarketSelector from './TradeMarketSelector/TradeMarketSelector'
import TradeTables from './TradeTables/TradeTables'
import TradeFooter from './TradeFooter/TradeFooter'
import TradeChart from './TradeChart/TradeChart'

const TradeContainer = styled.div`
    color: #aeaebf;
    font-size: 15px;
    height: calc(100vh - 48px);
    background: ${p => p.theme.colors.zzLightBorder};
`

const TradeGrid = styled.article`
    display: grid;
    grid-template-rows: 50px 4fr 3fr 50px;
    grid-template-columns: 300px 1fr;
    grid-template-areas:
        'marketSelector marketSelector marketSelector'
        'sidebar chart chart'
        'sidebar tables tables'
        'sidebar footer footer'; 
    min-height: calc(100vh - 48px);
    gap: 1px;

    > div, > aside, > header, > footer, > section, > main {
        background: ${p => p.theme.colors.zzDarkest};
    }
`

export function TradeDashboard() {
    return (
        <TradeContainer>
            <TradeGrid>
                <TradeMarketSelector />
                <TradeSidebar />
                <TradeChart />
                <TradeTables />
                <TradeFooter />
            </TradeGrid>
        </TradeContainer>
    )
}