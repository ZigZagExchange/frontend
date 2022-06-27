import styled from "styled-components";

export const ChartDropdown = styled.div`
    display: inline-block;
    position: relative;
`;

export const ChartDropdownContent = styled.div`
    display: ${({display}) => display ? 'inline-block' : 'none'};
    position: absolute;
    background-color: #171C28;
    border: 1px solid #0B121A;
    border-radius: 8px;
    min-width: 440px;
    ${({width}) => width ? `width: ${width};` : ``}
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,.4);
    z-index: 5;
    padding: 10px;

    ${({position}) => {
        let style = ``;
        if(!position) return style;

        switch (position.toLowerCase()) {
            case "center":
                style = `right: 50%; left: 50%;`;
                break;
            case "right":
                style = `left: 50%;`;
                break;
            case "left":
                style = `right: 50%;`;
                break;
            default:
                break;
        }
        return style;
    }}
`;

export const ChartDropdownTitle = styled.div`
    font-size: 16px;
    font-weight: bold;
`;
