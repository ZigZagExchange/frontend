import React from "react";
// css
import "./Footer.css";
// assets
import logo from "../../assets/icons/footer_logo.png";
//helpers
import { cancelorder, cancelallorders } from "../../helpers";

const Footer = (props) => {
  return (
    <>
      <div className="footer">
        <div className="footer_container">
          <hr />
          <div>
            <div className="ft_tabs">
              <strong>Open Orders ({props.openOrders.length})</strong>
              <strong>Fills</strong>
              <strong>Balances</strong>
            </div>
          </div>
          <div className="footer_open_orders">
              <table>
                <thead>
                    <tr>
                      <th>Market</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Side</th>
                      <th><span onClick={cancelallorders} className="cancel_order_link">Cancel All</span></th>
                    </tr>
                </thead>
                <tbody>
                  {props.openOrders.map((order, i) => {
                    const id = order[0];
                    const price = order[3];
                    const quantity = order[4];
                    const market = order[1];
                    const baseCurrency = order[1].split('-')[0];
                    const side = order[2] === 'b' ? "buy" : "sell";
                    const classname = order[2] === 'b' ? "up_value" : "down_value";
                    return (
                      <tr key={id}> 
                        <td>{market}</td>
                        <td>{price}</td>
                        <td>{quantity} {baseCurrency}</td>
                        <td className={classname}>{side}</td>
                        <td><span onClick={() => cancelorder(id)} className="cancel_order_link">Cancel</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          </div>
          <div className="footer_bottom">
            <img src={logo} alt="..." />
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
