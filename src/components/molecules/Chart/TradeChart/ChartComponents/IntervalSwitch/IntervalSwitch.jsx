import styled from "styled-components";
import { useHandleClickOutside } from "../../ChartUtils/helpers";
import { ChartHeaderItem } from "../ChartHeader";
import { HiChevronDown } from "react-icons/hi";
import { useRef, useState } from "react";

const Interval = styled.div`
    padding: 4px;
    margin: 8px;
    color: '#ffff';
    border: 1px solid rgba(0, 0, 0, .3);
`;


export const IntervalSwitch = ({interval, intervals, setInterval}) => {
    const ref = useRef();
    useHandleClickOutside(ref, () => {
        setShow(false);
    });

    const [show, setShow] = useState(false);

    return (
        <ChartHeaderItem onClick={() => setShow(true)} ref={ref}>
            <span>{interval}</span>
            <HiChevronDown/>
            {/* dropdown */}
            <div style={{
                position: 'fixed',
                zIndex: 5,
                display: show ? 'block' : 'none',
                marginLeft: 'auto',
                marginRight: 'auto',
                top: '20%',
                bottom: '30%',
                width: '130px',
                background: '#171C28',
                border: '1px solid rgba(250, 250, 250, .3)',
                borderRadius: '4px'
            }}>
                {intervals.map((i, key) => {
                    return (
                        <Interval key={key}
                            onClick={() => {
                                setInterval(i.value);
                                setShow(false);
                            }}
                        >
                            {i.string}
                        </Interval>
                    )
                })}
            </div>
        </ChartHeaderItem>
    );
}
