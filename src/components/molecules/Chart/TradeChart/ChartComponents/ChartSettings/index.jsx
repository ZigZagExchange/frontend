import { useRef, useState } from "react";
import styled from "styled-components";
import { useHandleClickOutside } from "../../ChartUtils/helpers";
import { ChartHeaderItem } from "../ChartHeader";
import { ChartDropdown, ChartDropdownContent } from "../ChartDropdown";
import Draggable from "components/atoms/Draggable";
import TradingSettings from "./TradingSettings";
import TimezoneSettings from "./TimezoneSettings";
import BackgroundSettings from "./BackgroundSettings";
import { BiX } from "react-icons/bi";
import { HiCog } from "react-icons/hi";

const Settings = styled.div`
    min-width: 400px;
    font-size: 12px;
    h5 {
        font-size: 14px;
        font-weight: bold;
        text-transform: uppercase;
    }
`;
const SettingsHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 8px 8px;
    cursor: grab;
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
`;
const HeaderItem = styled.div`
    flex: 1;
    padding: 8px 8px;
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
    ${({selected}) => selected ? 'color: white;' : ''}
    
    border-left: 1px solid rgba(250, 250, 250, .1);
    &:hover{
        color: white;
    }
`;
const SettingsContent = styled.div`
    padding: 10px 5px;
    height: 200px;
    min-height: 300px;
    max-height: 300px;
    overflow: auto;
`;


const Tabs = styled.div`
    display: flex;
    flex: 1;
    flex-direction: row;
    justify-content: space-between;
    margin: 8px 0px;
    margin-right: 20px;
    border: 1px solid rgba(250, 250, 250, .1);
`;

const SettingsExit = styled.div`
    margin-right: 4px;
`;
const ChartSettings = () => {
    const ref = useRef();

    useHandleClickOutside(ref, () => {
        setShow(false);
    });

    const [show, setShow] = useState(false);
    const [tab, setTab] = useState("trading");

    const headerItems = [
        {title: 'trading', component: <TradingSettings/>},
        {title: 'background', component: <BackgroundSettings/>},
        {title: 'timezone', component: <TimezoneSettings/>},
    ];

    const content = headerItems.filter((obj) => obj.title.toLowerCase() === tab.toLowerCase());
    return (
        <>
        <ChartHeaderItem onClick={() => setShow(true)} >
            <HiCog/>

        </ChartHeaderItem>
             {/* dropdown */}
             <ChartDropdown ref={ref}>
                <Draggable initialPos={{x: -614, y: 100}} >
                    <ChartDropdownContent display={show} position='left'>
                        <Settings>
                            <SettingsHeader >
                                <h5>Trading Settings</h5>

                                <SettingsExit onClick={(e) => {
                                    e.preventDefault();
                                    setShow(!show);
                                }} >
                                    <BiX size="25"/>
                                </SettingsExit>
                            </SettingsHeader>
                                <Tabs>
                                    {headerItems.map((item, key) => (
                                        <HeaderItem key={key}
                                            selected={tab === item.title}
                                            onClick={() => setTab(item.title)}>
                                            {item.title}
                                        </HeaderItem>
                                    ))}
                                </Tabs>

                            <SettingsContent>{content[0].component}</SettingsContent>
                        </Settings>
                    </ChartDropdownContent>
                </Draggable>
            </ChartDropdown>
        </>
    );
}

export default ChartSettings;
