import styled from "styled-components";

const ToggleArea = styled.div`
    display: flex;
    justify-content: space-around;
    
    width: 100%;
    cursor: pointer;

    background: transparent;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    
`;

const ToggleItem = styled.div`
    width: 100%;
    height: 100%;
    background: ${(props) => props.toggled ? 'rgba(0, 0, 0, 0.2)': 'transparent'};

    text-align: center;
    padding: 8px;

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

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