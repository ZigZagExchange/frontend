import { Dropdown, Menu, MenuItem } from "components";
import { BiChevronDown } from "react-icons/bi";
import React from "react";

const L1Header = ({ networks, onSelect, selectedNetwork }) => {
  const dropdownMenu = () => {
    return (
      <Menu className="bridge_menu" onSelect={onSelect} selectedKeys={[selectedNetwork.from.key]}>
        {networks.map((item) => {
          return (
            <MenuItem key={item.from.key}>
              <div>{item.from.network}</div>
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
          <div className="bridge_coin_image" style={{ background: "#fff" }}>
            <img alt="Ethereum logo" src={selectedNetwork.from.icon} />
          </div>
          <div className="bridge_coin_name">{selectedNetwork.from.network}</div>
          <BiChevronDown size={25} className="ml-2" color="#FFF" />
        </div>
      </Dropdown>
    </div>
  );
};

export default L1Header;
