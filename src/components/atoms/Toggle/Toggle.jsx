import styled from "styled-components";

const ToggleArea = styled.div`
    display: flex;
    justify-content: space-around;
    width: 100%;
    cursor: pointer;
    background: transparent;
    border: 1px solid rgba(0, 0, 0, 0.4);
    border-radius: 50px;
    min-width: 120px;
`;

const ToggleItem = styled.div`
    width: 100%;
    height: 100%;
    border-radius: 50px;
    margin: 5px;
    background: ${(props) => props.toggled ? 'rgba(0, 0, 0, 0.4)': 'transparent'};
    text-align: center;
    padding: 5px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    text-shadow: ${(props) => props.toggled ? '0 0 6px rgb(19 147 221 / 40%)': 'none'};
    color: ${(props) => props.toggled ? '#08aff3': 'inherit'};
`;

export function Toggle({value, toggle}){
    const handleClick = () => {
        toggle();      
    }

    return (
        <ToggleArea onClick={() => handleClick()}>
            <ToggleItem toggled={value === false}>No</ToggleItem>
            <ToggleItem toggled={value === true}>Yes</ToggleItem>
        </ToggleArea>  
    );
}