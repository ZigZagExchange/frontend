import { Checkbox } from "@material-ui/core";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { chartSettingsSelector, setTradingSetting } from "lib/store/features/chart/chartSlice";

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


const TimezoneSettings = () => {
    const settings = useSelector(chartSettingsSelector);
    const dispatch = useDispatch();

    const updateSetting = (value) => {
       dispatch(setTradingSetting({value}))
    }

    return (
        <Items>
            {/* orders */}
            <Item>
                <Checkbox color="primary" 
                    onClick={(e) => updateSetting({timezone: { showSessions: e.checked}})}
                     checked={settings.timezone.showSessions}/>Show sessions
            </Item>
            <Item>
                <Checkbox color="primary" defaultChecked />Timezone
            </Item>

            {/* reset */}
            <Item>
                <ResetButton>Reset</ResetButton>
            </Item>
        </Items>
    );
}

export default TimezoneSettings;
