import ethLogo from "../../../../assets/images/currency/ETH.svg";
import React from "react";

const L1Header = () => {
  return <div className="bridge_coin_details">
    <div className="bridge_coin_image" style={{background: '#fff'}}>
      <img
        alt="Ethereum logo"
        src={ethLogo}
      />
    </div>
    <div className="bridge_coin_name">Ethereum L1</div>
  </div>
}

export default L1Header;
