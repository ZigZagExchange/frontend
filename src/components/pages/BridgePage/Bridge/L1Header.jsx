import { useSelector } from "react-redux";
import { Dropdown, Menu, MenuItem } from "components";
import { BiChevronDown } from "react-icons/bi";
import React from "react";
import styled from 'styled-components';
import CheckIcon from '@mui/icons-material/Check';
import { networkSelector } from "lib/store/features/api/apiSlice";

const MenuWrapper = styled.div`
  display: grid;
  background-color: ${({ theme }) => theme.colors.backgroundMediumEmphasis};
  border: 1px solid ${({ theme }) => theme.colors.foreground400};
  margin-top: 10px;
  padding: 16px;
  font-size: 14px;
  box-shadow: 0px 8px 16px 0px #0101011A;
  backdrop-filter: blur(8px);
  border-radius: 8px;
  gap: 10px;
  align-items: start;
  z-index: 100;

  ul {
    padding-left: 0;
    list-style: none;
  }

  li {
    display: flex;
    cursor: pointer;

    > div {
      margin-left: 5px;
      margin-top: 2px;
    }

    &:not(.rc-menu-item-selected) > div {
      margin-left: 30px;
    }
  }
`

const L1Header = ({ networks, onSelect, selectedNetwork }) => {
  const network = useSelector(networkSelector);
  const dropdownMenu = () => {
    return (
      <MenuWrapper>
        <Menu className="bridge_menu" onSelect={onSelect} selectedKeys={[selectedNetwork.from.key]}>
          {networks.map((item) => {
            return (
              <MenuItem key={item.from.key}>
                {
                  item.from.key === selectedNetwork.from.key ?
                    <CheckIcon /> : ""
                }
                <div>{item.from.network}</div>
              </MenuItem>
            );
          })}
        </Menu>
      </MenuWrapper>
    );
  };

  return (
    <div className="bridge_coin_details">
      <Dropdown overlay={dropdownMenu} overlayClassName="bridge_menu"
        minOverlayWidthMatchTrigger={false} align={[100, 100]} alignPoint={false}>
        <div className="d-flex align-items-center">
          <div className="bridge_coin_image">
            <img alt="Ethereum logo" src={selectedNetwork.from.icon} />
          </div>
          <h4 className="bridge_coin_name">
            {selectedNetwork.from.network}
            <span><br />{network === 1 ? 'Mainnet' : 'Testnet'}</span>
          </h4>
          <BiChevronDown size={25} className="ml-2" />
        </div>
      </Dropdown>
    </div>
  );
};

export default L1Header;
