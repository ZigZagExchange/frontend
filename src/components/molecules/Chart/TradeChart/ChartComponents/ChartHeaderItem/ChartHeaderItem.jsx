import styled from "styled-components";
import { useRef } from "react";
import { useHandleClickOutside } from "../../ChartUtils/helpers";

const HeaderItem = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: no-wrap;
    padding: 8px 16px;
    min-width: 100px;
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

const ChartHeaderItem = ({onClick, children}) => {
    //hide on click away
    const ref = useRef();
    useHandleClickOutside(ref, onClick(false))

    return (
        <HeaderItem ref={ref} onClick={onClick}>
            {children}
        </HeaderItem>
    )
}

export default ChartHeaderItem;
