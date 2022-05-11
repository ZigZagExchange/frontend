import { Dropdown, Menu, MenuItem } from "components";
import { BiChevronDown } from "react-icons/bi";
import React from "react";

const L2Header = ({ networks, onSelect, selectedNetwork }) => {
  const dropdownMenu = () => {
    return (
      <Menu className="bridge_menu" onSelect={onSelect} selectedKeys={[selectedNetwork.key]}>
        {networks.map((item) => {
          return (
            <MenuItem key={item.key}>
              <div>{item.network}</div>
            </MenuItem>
          );
        })}
      </Menu>
    );
  };

  return (
    <div className="bridge_coin_details">
      <Dropdown overlay={dropdownMenu} overlayClassName="bridge_menu">
        <div className="d-flex align-items-center">
          <div className="bridge_coin_image">
            <img alt="Ethereum logo" src={selectedNetwork.icon} />
          </div>
          <h4 className="bridge_coin_name">{selectedNetwork.network}<span><br />Mainnet</span></h4>
          <BiChevronDown size={25} className="ml-2" />
        </div>
      </Dropdown>
    </div>
  );
};

export default L2Header;
