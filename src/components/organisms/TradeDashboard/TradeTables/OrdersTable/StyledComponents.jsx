import styled from "styled-components";
import { TabMenu } from "components/molecules/TabMenu";
import Text from "components/atoms/Text/Text";

export const StyledTabMenu = styled(TabMenu)`
  padding: 22px 20px 0px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.foreground400};
`;

export const FooterWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

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
`;

export const FooterContainer = styled.div`
  align-content: center;
  width: 100%;
  height: 100%;
  margin: 0 auto;

  div > div > table {
    // padding: 20px;
    max-width: 500px;
  }

  div > div > table tbody {
    display: block;
    // height: 65px;
    overflow: auto;
  }

  td div {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  // @media screen and (min-width: 993px) {
  //   max-height: calc(100vh - 720px);
  // }
`;

export const LaptopWrapper = styled.div`
  height: 100%;

  > div {
    height: 100%;
  }

  tbody {
    display: block;
    height: 100%; // 111px;
    // min-height: 217px;
    max-height: calc(100% - 42px);
    overflow: auto;

    ::-webkit-scrollbar {
      width: 10px;
      position: relative;
      z-index: 20;
    }

    ::-webkit-scrollbar-track {
      border-radius: 0px;
      background: transparent
      height: 23px;
      border-radius: 5px;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 0px;
      background: ${({ theme }) => theme.colors.foreground400};
      border-radius: 5px;
    }

    ::-webkit-scrollbar-thumb:window-inactive {
      background: #fff;
    }
  }
  thead,
  tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }
  thead {
    width: calc( 100% - 10px );
  }

  table {
    display: block;
    width: 100%;
    height: calc(100% - 53px);
  }

  table thead th {
    padding: 10px 20px 0px 20px;
  }

  table tbody td {
    padding: 5px 20px 0px 20px;
  }

  img.loading-gif {
    width: 30px;
    height: 30px;
  }
`;

export const MobileWrapper = styled.div`
  display: block;
  height: 100%;
  overflow: auto;
  overflow-x: hidden;

  > tr {
    display: block;
    width: 100%;
  }

  table {
    display: block;
    width: 100%;
    height: calc(100% - 53px);

    thead {
      display: table;
      width: 100%;
      table-layout: fixed;

      th {
        padding: 10px 20px 0px 20px;
      }
    }

    tbody tr {
      display: table;
      width: 100%;
      table-layout: fixed;
    }
  }

  table tbody td {
    padding: 5px 20px 0px 20px;
  }

  // table tbody tr:last-child {
  //   border-bottom: 1px solid ${({ theme }) => theme.colors.foreground400};
  // }

  img.loading-gif {
    width: 30px;
    height: 30px;
  }

  &::-webkit-scrollbar {
    width: 5px;
    position: relative;
    z-index: 20;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: #ffffff21;
  }

  &::-webkit-scrollbar-track {
    border-radius: 4px;
    background: transparent;
    height: 23px;
  }

  @media screen and (max-width: 992px) {
    max-height: calc(100% - 90px);
  }
`;

export const SortIconWrapper = styled.div`
  display: grid;
  grid-auto-flow: row;
  align-items: center;
  justify-content: center;
  svg path {
    color: none;
  }
`;

export const HeaderWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: start;
  gap: 10px;
`;

export const ActionWrapper = styled(Text)`
  text-decoration: underline;
  cursor: pointer;

  &.view-account-button {
    position: absolute;
    left: 50%;
    bottom: 1rem;
    transform: translateX(-50%);
  }
`;
