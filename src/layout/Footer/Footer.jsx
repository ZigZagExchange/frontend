import React from "react";
// css
import "./Footer.css";
// assets
import loadingGif from "../../assets/icons/loading.svg";
//helpers
import { cancelorder, currencyInfo, getDetailsWithoutFee } from "../../helpers";

class Footer extends React.Component {
  constructor (props) {
      super(props);
      this.state = { tab: "orders" };
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
      let footerContent, classNameOrders = "", classNameBalances = "";
      const userOrdersSorted = Object.values(this.props.userOrders);
      userOrdersSorted.sort((a,b) => b[1] - a[1]);
      switch (this.state.tab) {
        case "orders":
          footerContent = (
            <table>
              <thead>
                <tr>
                  <th>Market</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Side</th>
                  <th>Fee</th>
                  <th>Order Status</th>
                  <th>TX Status</th>
                </tr>
              </thead>
              <tbody>
                {userOrdersSorted.map((order, i) => {
                  const chainid = order[0];
                  const orderid = order[1];
                  const market = order[2];
                  const orderstatus = order[9];
                  const baseCurrency = order[2].split("-")[0];
                  const quoteCurrency = order[2].split("-")[1];
                  const side = order[3] === "b" ? "buy" : "sell";
                  const sideclassname = order[3] === "b" ? "up_value" : "down_value";
                  let feeText;
                  if (order[3] === 's') {
                      feeText = currencyInfo[baseCurrency].gasFee + ' ' + baseCurrency;
                  }
                  if (order[3] === 'b') {
                      feeText = currencyInfo[quoteCurrency].gasFee + ' ' + quoteCurrency;
                  }
                  const orderWithoutFee = getDetailsWithoutFee(order);
                  let statusText, statusClass; 
                  switch (order[9]) {
                      case 'r':
                        statusText = "rejected";
                        statusClass = "rejected";
                        break
                      case 'f':
                        statusText = "filled";
                        statusClass = "filled";
                        break
                      case 'm':
                        statusText = (
                            <span>matched <img className="loading-gif" src={loadingGif} alt="Pending"/></span>
                        )
                        statusClass = "matched";
                        break
                      case 'b':
                        statusText = (
                            <span>committing <img className="loading-gif" src={loadingGif} alt="Pending"/></span>
                        )
                        statusClass = "committing";
                        break
                      case 'o':
                        statusText = "open";
                        statusClass = "open";
                        break
                      case 'c':
                      default:
                        statusText = "canceled";
                        statusClass = "canceled";
                        break
                  }
                  let txHashLink;
                  if (order[10]) {
                      txHashLink = baseExplorerUrl + "/explorer/transactions/" + order[10];
                  }
                  
                      
                  return (
                    <tr key={orderid}>
                      <td>{market}</td>
                      <td>{orderWithoutFee.price.toPrecision(6) / 1}</td>
                      <td>
                        {orderWithoutFee.baseQuantity.toPrecision(6) / 1} {baseCurrency}
                      </td>
                      <td className={sideclassname}>{side}</td>
                      <td>{feeText}</td>
                      <td className={statusClass}>{statusText}</td>
                      <td>
                        {txHashLink ?
                            <a href={txHashLink} target="_blank" rel="noreferrer">View Tx</a> :
                            (orderstatus === 'o') ?  <span className="cancel_order_link" onClick={() => cancelorder(chainid, orderid)}>Cancel</span> :
                            ""
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          );
          classNameOrders = "selected"
          break
        case "balances":
          if (this.props.user.committed) {
              const balancesContent = Object.keys(this.props.user.committed.balances).map(token => {
                  if (!currencyInfo[token]) return "";
                  let balance = this.props.user.committed.balances[token];
                  balance = parseInt(balance) / Math.pow(10, currencyInfo[token].decimals);
                  return (
                      <tr>
                          <td>{token}</td>
                          <td>{balance}</td>
                      </tr>
                  )
              });
              footerContent = (
                <div>
                  <table className="balances_table">
                    <thead>
                        <tr>
                            <th>Token</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {balancesContent}
                    </tbody>
                  </table>

                  <a href={explorerLink} target="_blank" rel="noreferrer">View Account on Explorer</a>
                </div>
              );
          }
          else {
            footerContent = (
                <div>
                  <a href={explorerLink} target="_blank" rel="noreferrer">View Account on Explorer</a>
                </div>
            )
          }
          classNameBalances = "selected"
          break;
        default:
          break
      }

      return (
        <>
          <div className="footer">
            <div className="footer_container">
              <hr />
              <div>
                <div className="ft_tabs">
                  <strong className={classNameOrders} onClick={() => this.setTab("orders")}>
                    Orders ({Object.keys(this.props.userOrders).length})
                  </strong>
                  <strong className={classNameBalances} onClick={() => this.setTab("balances")}>Balances</strong>
                </div>
              </div>
              <div className="footer_orders">{footerContent}</div>
            </div>
          </div>
        </>
      );
  }
};

export default Footer;
