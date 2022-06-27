import styled from "styled-components";

const LoadingContainer = styled.section`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Loader = styled.section`
    flex: 0 0 120px;
`;

export function ChartLoaderSpinner({text}){
    return (
        <LoadingContainer>
            <Loader>{text}</Loader>
        </LoadingContainer>
    )
}
