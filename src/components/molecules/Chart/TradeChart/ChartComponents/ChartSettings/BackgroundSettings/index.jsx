import { RgbaColorPicker } from "react-colorful";
import { Checkbox } from "@material-ui/core";
import styled from "styled-components";
import { useState } from "react";
import { useSelector } from "react-redux";
import { chartSettingsSelector } from "lib/store/features/chart/chartSlice";

const Item = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const Items = styled.div`
    display: flex;
    flex-direction: column;
`;

const Input = styled.input`
    flex: 1;
    margin: 12px;
    padding: 3px 8px;
    background: #3F51B5;
    border: 1px solid #3F51B5;
    color: white;
    width: 100%;
    height: 20px;
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

const BackgroundSettings = () => {
    const [color, setColor] = useState({ r: 200, g: 150, b: 35, a: 0.5 });
    const settings = useSelector(chartSettingsSelector);

    return (
        <Items>
            {/* orders */}
            <Items>
                <Item>
                    <Checkbox color="primary" checked={settings.background.gradient} />Background gradient
                </Item>
                <Items>
                    <Item>
                        <div style={{
                           width: '100%',
                           height: '100%',
                           margin: '20px',
                           padding: '4px',

                           background: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
                        }}>Color</div>
                    </Item>
                    <Item><RgbaColorPicker color={color} onChange={setColor} /></Item>
                </Items>
            </Items>
            <Item>
                <Items>
                    <Item>
                        <Checkbox color="primary" defaultChecked />Show Watermark
                    </Item>
                    <Item>
                        <Input type="text" value="{pair} - ZigZag ({interval})"/>
                    </Item>
                </Items>


            </Item>

            {/* reset */}
            <Item>
                <ResetButton>Defaults</ResetButton>
            </Item>
        </Items>
    );
}

export default BackgroundSettings;
