import styled from "styled-components";
import { useHandleClickOutside } from "../../ChartUtils/helpers";
import { ChartHeaderItem } from "../ChartHeader";
import { HiChevronDown } from "react-icons/hi";
import { useRef, useState } from "react";
import { ChartDropdown, ChartDropdownContent } from "../ChartDropdown";

const Interval = styled.div`
    padding: 6px 5px;
    color: '#ffff';
    ${({selected}) => selected ? 'border: 1px solid rgba(0, 0, 0, .4);' : 'border: 1px solid rgba(0, 0, 0, 0);'}

    span {
        padding: 18px 2px;
        font-size: 14px;
        font-weight: bold;
    }
`;

export const IntervalSwitch = ({exchange, interval, intervals, setInterval}) => {
    const ref = useRef();

    useHandleClickOutside(ref, () => {
        setShow(false);
    });

    const [show, setShow] = useState(false);

    return (
        <ChartHeaderItem onClick={() => setShow(!show)} ref={ref}>
            <span>{interval}</span>
            <HiChevronDown/>
            {/* dropdown */}
            <ChartDropdown>
                <ChartDropdownContent display={show}>

                    {intervals.map((i, key) => {
                        //seperator
                        if(i.value === undefined){
                            return (
                                <Interval key={key}>
                                    <span>{i.string}</span>
                                </Interval>
                            )
                        }
                        return (
                            <Interval key={key} 
                                selected={i.value === interval}
                                onClick={() => {
                                    setInterval(i.value);
                                    setShow(false);
                                }}
                            >
                                {i.string}
                            </Interval>
                        )
                    })}
                </ChartDropdownContent>
            </ChartDropdown>
        </ChartHeaderItem>
    );
}
