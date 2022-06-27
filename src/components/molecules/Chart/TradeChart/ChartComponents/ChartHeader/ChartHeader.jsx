import api from "lib/api";
import styled from "styled-components";
import { IntervalSwitch } from "../IntervalSwitch";

const ChartHeaderContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: no-wrap;
`;

const ChartHeaderItems = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex: 1;
    border-bottom: 1px solid rgba(250, 250, 250, .1);
`;

export const ChartHeaderItem = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: no-wrap;
    padding: 8px 16px;
    min-width: 95px;
    justify-content: space-between;
    align-items: center;
    border-left: 1px solid rgba(250, 250, 250, .1);
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    img {
        height: 18px;
        margin: 4px;
        margin-right: 10px;
    }
`;

const ChartHeaderSymbol = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 14px;
    font-weight: bold;
`;

export const ChartHeader = ({
    marketInfo,
    exchange,
    interval,
    intervals, 
    setInterval
}) => {
    return ( 
        <ChartHeaderContainer>
            <ChartHeaderItems>
                <ChartHeaderItem>
                    <img src={api.getCurrencyLogo(marketInfo.baseAsset.symbol)} alt=""/>
                    <ChartHeaderSymbol>
                        <span>{marketInfo.baseAsset.symbol}/{marketInfo.quoteAsset.symbol}</span>                            
                    </ChartHeaderSymbol>
                </ChartHeaderItem>
                <IntervalSwitch
                    exchange={exchange}
                    interval={interval}
                    intervals={intervals} 
                    setInterval={setInterval}
                />
            </ChartHeaderItems>
        </ChartHeaderContainer>
    );
}
