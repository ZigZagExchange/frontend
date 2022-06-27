import { Checkbox } from "@material-ui/core";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { chartSettingsSelector, resetTrading, setTradingSetting } from "lib/store/features/chart/chartSlice";

const Item = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const Items = styled.div`
    display: flex;
    flex-direction: column;
`;

const ResetButton = styled.div`
    margin: 12px;
    padding: 4px 12px;
    background: #3F51B5;
    border: 1px solid #3F51B5;
    border-radius: 2px;
    color: white;
    cursor: pointer;
    &:hover{
        background: #33439c;
    }
`;


const TradingSettings = () => {
    const dispatch = useDispatch();
    const settings = useSelector(chartSettingsSelector);

    const updateSetting = (payload) => {
        let p = {
            [payload.type]: payload.value
        };
        console.log("updating setting:" , p);
        dispatch(setTradingSetting(p));
        return payload.value;
    }

    return (
        <Items>
            {/* orders */}
            <Item>
                <Checkbox
                    color="primary" 
                    onChange={(e) => updateSetting({ type: 'showOrders', value: !settings.trading.showOrders})}
                    checked={settings.trading.showOrders}
                />
                Show Orders
            </Item>
            <Item>
                <Checkbox
                    color="primary"
                    onChange={(e) => updateSetting({ type: 'showExecutions', value: !settings.trading.showExecutions})}
                    checked={settings.trading.showExecutions}    
                />
                Show Executions
            </Item>

            {/* lines */}
            <Item>
                <Items>
                    <Item>
                        <Checkbox
                            color="primary"
                            onChange={(e) => updateSetting({ type: 'extendLines', value: !settings.trading.extendLines})}
                            checked={settings.trading.extendLines}
                        />
                        Extend lines
                    </Item>
                </Items>
            </Item>

            {/* misc */}
            <Item>
                <Checkbox
                    color="primary"
                    onChange={(e) => updateSetting({ type: 'playSound', value: !settings.trading.playSound})}
                    checked={settings.trading.playSound}
                />
                Play sound on order execution
            </Item>

            {/* reset */}
            <Item>
                <ResetButton onClick={() => {dispatch(resetTrading())}}>
                    Reset Trading
                </ResetButton>
            </Item>
        </Items>
    );
}

export default TradingSettings;
