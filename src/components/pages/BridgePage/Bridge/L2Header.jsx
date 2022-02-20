import logo from "../../../../assets/images/logo.png";
import React from "react";

const L2Header = () => {
  return <div className="bridge_coin_details">
    <div className="bridge_coin_image">
      <img alt="Logo" src={logo}/>
    </div>
    <div className="bridge_coin_name">zkSync L2</div>
  </div>
}

export default L2Header