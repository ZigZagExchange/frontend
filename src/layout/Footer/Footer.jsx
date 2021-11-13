import React from "react";
// css
import "./Footer.css";
// assets
import logo from "../../assets/icons/footer_logo.png";
//helpers
import { cancelorder, cancelallorders } from "../../helpers";

class Footer extends React.Component {
  constructor (props) {
      super(props);
      this.state = { tab: "fills" };
  }

  setTab(value) {
      this.setState({ tab: value });
  }

  render () {
      let explorerLink, baseExplorerUrl;
      switch (this.props.chainId) {
          case 1000:
              explorerLink = "https://rinkeby.zkscan.io/explorer/accounts/" + this.props.user.address;
              baseExplorerUrl = "https://rinkeby.zkscan.io";
              break
          case 1:
          default:
              explorerLink = "https://zkscan.io/explorer/accounts/" + this.props.user.address;
              baseExplorerUrl = "https://zkscan.io";
      }
      let footerContent, classNameOpenOrders = "", classNameFills = "", classNameBalances = "";
      switch (this.state.tab) {
        case "fills":
          footerContent = (
            <table>
              <thead>
                <tr>
                  <th>Market</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Side</th>
                  <th>Order Status</th>
                  <th>TX Status</th>
                </tr>
              </thead>
              <tbody>
                {this.props.userFills.map((fill, i) => {
                  const id = fill[1];
                  const price = fill[4];
                  const quantity = fill[5];
                  const market = fill[2];
                  const baseCurrency = fill[2].split("-")[0];
                  const side = fill[3] === "b" ? "buy" : "sell";
                  const sideclassname = fill[3] === "b" ? "up_value" : "down_value";
                  let statusText; 
                  switch (fill[9]) {
                      case 'r':
                        statusText = "rejected";
                        break
                      case 'f':
                        statusText = "filled";
                        break
                      default:
                      case 'm':
                        statusText = "matched";
                  }
                  let txHashLink;
                  if (fill[10]) {
                      txHashLink = baseExplorerUrl + "/explorer/transactions/" + fill[10];
                  }
                  
                      
                  return (
                    <tr key={id}>
                      <td>{market}</td>
                      <td>{price}</td>
                      <td>
                        {quantity} {baseCurrency}
                      </td>
                      <td className={sideclassname}>{side}</td>
                      <td className={statusText}>{statusText}</td>
                      <td>
                        {txHashLink ?
                            <a href={txHashLink} target="_blank" rel="noreferrer">View Tx</a> :
                            "Pending"
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          );
          classNameFills = "selected"
          break
        case "balances":
          if (this.props.user.address) {
              footerContent = (
                <div>
                  <a href={explorerLink} target="_blank" rel="noreferrer">View Account on Explorer</a>
                </div>
              );
          }
          classNameBalances = "selected"
          break;
        case "open_orders":
        default:
          footerContent = (
            <table>
              <thead>
                <tr>
                  <th>Market</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Side</th>
                  <th>
                    <span onClick={() => cancelallorders(this.props.chainId, this.props.user.id)} className="cancel_order_link">
                      Cancel All
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {this.props.openOrders.map((order, i) => {
                  const id = order[1];
                  const price = order[4];
                  const quantity = order[5];
                  const market = order[2];
                  const baseCurrency = order[2].split("-")[0];
                  const side = order[3] === "b" ? "buy" : "sell";
                  const classname = order[3] === "b" ? "up_value" : "down_value";
                  return (
                    <tr key={id}>
                      <td>{market}</td>
                      <td>{price}</td>
                      <td>
                        {quantity} {baseCurrency}
                      </td>
                      <td className={classname}>{side}</td>
                      <td>
                        <span
                          onClick={() => cancelorder(this.props.chainId, id)}
                          className="cancel_order_link"
                        >
                          Cancel
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          );
          classNameOpenOrders = "selected"
      }

      return (
        <>
          <div className="footer">
            <div className="footer_container">
              <hr />
              <div>
                <div className="ft_tabs">
                  <strong className={classNameOpenOrders} onClick={() => this.setTab("open_orders")}>
                    Open Orders ({this.props.openOrders.length})
                  </strong>
                  <strong className={classNameFills} onClick={() => this.setTab("fills")}>Fills ({this.props.userFills.length})</strong>
                  <strong className={classNameBalances} onClick={() => this.setTab("balances")}>Balances</strong>
                </div>
              </div>
              <div className="footer_open_orders">{footerContent}</div>
              <div className="footer_bottom">
                <img src={logo} alt="..." />
                <div className="footer_links">
                  <a href="https://discord.gg/ZNWR3Cfr">Discord</a>
                  <a href="https://twitter.com/ZigZagExchange">Twitter</a>
                  <a href="http://t.me/zigzagexchange">Telegram</a>
                </div>
              </div>
            </div>
          </div>
        </>
      );
  }
};

export default Footer;
