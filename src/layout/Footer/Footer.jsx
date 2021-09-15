import React from "react";
// css
import "./Footer.css";
// assets
import logo from "../../assets/icons/footer_logo.png";
const Footer = () => {
  return (
    <>
      <div className="footer">
        <div className="footer_container">
          <hr />
          <div>
            <div className="ft_tabs">
              <strong>Open Orders (0)</strong>
              <strong>Trade History</strong>
              <strong>Balances</strong>
            </div>
          </div>
          <div className="footer_bottom">
            <img src={logo} alt="..." />
            <strong>
              CONNECT WALLET<span> TO TRADE</span>
            </strong>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
