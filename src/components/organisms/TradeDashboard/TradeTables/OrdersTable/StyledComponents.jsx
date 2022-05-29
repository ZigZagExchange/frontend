import styled from "styled-components";
import { TabMenu } from "components/molecules/TabMenu";
import Text from "components/atoms/Text/Text"

export const StyledTabMenu = styled(TabMenu)`
    padding: 22px 20px 0px 20px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.foreground400};
`

export const FooterWrapper = styled.div`
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow: auto;

    ::-webkit-scrollbar {
        width: 5px;
        position: relative;
        z-index: 20;
    }

    ::-webkit-scrollbar-track {
        border-radius: 0px;
        background: hsla(0, 0%, 100%, 0.15);
        height: 23px;
    }

    ::-webkit-scrollbar-thumb {
        border-radius: 0px;
        background: hsla(0, 0%, 100%, 0.4);
    }

    ::-webkit-scrollbar-thumb:window-inactive {
        background: #fff;
    }

    table {
        border-collapse: collapse;
        margin: 0;
        padding: 0;
        width: 100%;
    }

    table caption {
        font-size: 1.5em;
        margin: 0.5em 0 0.75em;
    }

    table tr {
        padding: 0.35em;
    }
`

export const FooterContainer = styled.div`
    align-content: center;
    width: 100%;
    margin: 0 auto;

    div > div > table {
        padding: 20px;
        max-width: 500px;
    }

    div > div> table tbody {
        display: block;
        // height: 65px;
        overflow: auto;
    }
`

export const LaptopWrapper = styled.div`
    tbody {
        display: block;
        height: 100%; // 111px;
        overflow: overlay;

        ::-webkit-scrollbar {
            width: 5px;
            position: relative;
            z-index: 20;
        }
    
        ::-webkit-scrollbar-track {
            border-radius: 0px;
            background: hsla(0, 0%, 100%, 0.15);
            height: 23px;
        }
    
        ::-webkit-scrollbar-thumb {
            border-radius: 0px;
            background: hsla(0, 0%, 100%, 0.4);
        }
    
        ::-webkit-scrollbar-thumb:window-inactive {
            background: #fff;
        }
    }
    thead, tbody tr {
        display: table;
        width: 100%;
        table-layout: fixed;
    }
    // thead {
    //     width: calc( 100% - 1em )/* scrollbar is average 1em/16px width, remove it from thead width */
    // }

    table {
        width: 100%;
    }

    table thead th {
        padding: 20px 20px 0px 20px;
    }

    table tbody td {
        padding: 16px 20px 0px 20px;
    }

    img.loading-gif {
        width: 30px;
        height: 30px;
    }
`

export const MobileWrapper = styled.div`

    table {
        width: 100%;
    }

    table tbody td {
        padding: 16px 20px 0px 20px;
    }

    table tbody tr:last-child {
        border-bottom: 1px solid ${({ theme }) => theme.colors.foreground400};
    }

    img.loading-gif {
        width: 30px;
        height: 30px;
    }
`

export const SortIconWrapper = styled.div`
    display: grid;
    grid-auto-flow: row;
    align-items: center;
    justify-content: center;
    svg path {
    color: none;
    }
`

export const HeaderWrapper = styled.div`
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    justify-content: start;
    gap: 10px;
`

export const ActionWrapper = styled(Text)`
    text-decoration: underline;
    cursor: pointer;

    &.view-account-button {
        position: absolute;
        left: 50%;
        bottom: 1rem;
        transform: translateX(-50%);
    }
`