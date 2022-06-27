import { useRef, useState } from "react";
import styled from "styled-components";
import { useHandleClickOutside } from "../../ChartUtils/helpers";
import { ChartHeaderItem } from "../ChartHeader";
import { ChartDropdownContent } from "../ChartDropdown";
import TradingSettings from "./TradingSettings";
import TimezoneSettings from "./TimezoneSettings";
import BackgroundSettings from "./BackgroundSettings";
import { BiX } from "react-icons/bi";
import { HiCog } from "react-icons/hi";
import Draggable from 'react-draggable';

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
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
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
             <Draggable bounds="body"  handle="span">
                <ChartDropdownContent display={show}  ref={ref}>
                    <Settings>
                        <span>
                            <SettingsHeader >
                                <h5>Trading Settings</h5>

                                <SettingsExit onClick={(e) => {
                                    e.preventDefault();
                                    setShow(!show);
                                }} >
                                    <BiX size="25"/>
                                </SettingsExit>
                            </SettingsHeader>
                        </span>
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
        </>
    );
}

export default ChartSettings;
