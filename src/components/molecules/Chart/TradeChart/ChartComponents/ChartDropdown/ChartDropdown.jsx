import styled from "styled-components";

export const ChartDropdown = styled.div`
    display: inline-block;
    position: relative;
    background: red;
`;


export const ChartDropdownContent = styled.div`
    display: ${({display}) => display ? 'block' : 'none'};
    position: absolute;
    background-color: #171C28;
    border: 1px solid #0B121A;
    border-radius: 8px;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,.4);
    z-index: 5;
    padding: 10px;
`;

export const ChartDropdownTitle = styled.div`
    font-size: 16px;
    font-weight: bold;
`;
