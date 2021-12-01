import React from "react";
// css
import "./Footer.css";
// assets
import loadingGif from "../../assets/icons/loading.svg";
//helpers
import {
    cancelorder,
    currencyInfo,
    getOrderDetailsWithoutFee,
    getFillDetailsWithoutFee,
    isZksyncChain,
} from "../../helpers";

class Footer extends React.Component {
    constructor(props) {
        super(props);
        this.state = { tab: "orders" };
    }

    setTab(value) {
        this.setState({ tab: value });
    }

    getFills() {
        return Object.values(this.props.userFills).sort((a, b) => b[1] - a[1]);
    }

    getOpenOrders() {
        return Object.values(this.props.userOrders)
            .filter((order) => ["o", "pf", "pm", "m", "b"].includes(order[9]))
            .sort((a, b) => b[1] - a[1]);
    }

    renderOrderTable(orders) {
        return (
            <table>
                <thead>
                    <tr>
                        <th>Market</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Remaining</th>
                        <th>Side</th>
                        <th>Fee</th>
                        <th>Order Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order, i) => {
                        const chainid = order[0];
                        const orderid = order[1];
                        const market = order[2];
                        let price = order[4];
                        let baseQuantity = order[5];
                        let remaining = isNaN(Number(order[11]))
                            ? order[5]
                            : order[11];
                        const orderstatus = order[9];
                        const baseCurrency = order[2].split("-")[0];
                        const quoteCurrency = order[2].split("-")[1];
                        const side = order[3] === "b" ? "buy" : "sell";
                        const sideclassname =
                            order[3] === "b" ? "up_value" : "down_value";
                        let feeText;
                        if (
                            order[9] === "r" ||
                            !isZksyncChain(this.props.chainId)
                        ) {
                            feeText = "0 " + baseCurrency;
                        } else if (order[3] === "s") {
                            feeText =
                                currencyInfo[baseCurrency].gasFee +
                                " " +
                                baseCurrency;
                        } else if (order[3] === "b") {
                            feeText =
                                currencyInfo[quoteCurrency].gasFee +
                                " " +
                                quoteCurrency;
                        }
                        const orderWithoutFee =
                            getOrderDetailsWithoutFee(order);
                        if ([1, 1000].includes(this.props.chainId)) {
                            price = orderWithoutFee.price;
                            baseQuantity = orderWithoutFee.baseQuantity;
                            remaining = orderWithoutFee.remaining;
                        }
                        let statusText, statusClass;
                        switch (order[9]) {
                            case "r":
                                statusText = "rejected";
                                statusClass = "rejected";
                                break;
                            case "pf":
                                statusText = "partial fill";
                                statusClass = "filled";
                                break;
                            case "f":
                                statusText = "filled";
                                statusClass = "filled";
                                break;
                            case "pm":
                                statusText = (
                                    <span>
                                        partial match
                                        <img
                                            className="loading-gif"
                                            src={loadingGif}
                                            alt="Pending"
                                        />
                                    </span>
                                );
                                statusClass = "matched";
                                break;
                            case "m":
                                statusText = (
                                    <span>
                                        matched{" "}
                                        <img
                                            className="loading-gif"
                                            src={loadingGif}
                                            alt="Pending"
                                        />
                                    </span>
                                );
                                statusClass = "matched";
                                break;
                            case "b":
                                statusText = (
                                    <span>
                                        committing{" "}
                                        <img
                                            className="loading-gif"
                                            src={loadingGif}
                                            alt="Pending"
                                        />
                                    </span>
                                );
                                statusClass = "committing";
                                break;
                            case "o":
                                statusText = "open";
                                statusClass = "open";
                                break;
                            case "c":
                            default:
                                statusText = "canceled";
                                statusClass = "canceled";
                                break;
                        }

                        return (
                            <tr key={orderid}>
                                <td>{market}</td>
                                <td>{price.toPrecision(6) / 1}</td>
                                <td>
                                    {baseQuantity.toPrecision(6) / 1}{" "}
                                    {baseCurrency}
                                </td>
                                <td>
                                    {remaining.toPrecision(6) / 1}{" "}
                                    {baseCurrency}
                                </td>
                                <td className={sideclassname}>{side}</td>
                                <td>{feeText}</td>
                                <td className={statusClass}>{statusText}</td>
                                <td>
                                    {orderstatus === "o" ? (
                                        <span
                                            className="cancel_order_link"
                                            onClick={() =>
                                                cancelorder(chainid, orderid)
                                            }
                                        >
                                            Cancel
                                        </span>
                                    ) : (
                                        ""
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }

    renderFillTable(fills) {
        let baseExplorerUrl;
        switch (this.props.chainId) {
            case 1001:
                baseExplorerUrl = "https://goerli.voyager.online/tx/";
                break;
            case 1000:
                baseExplorerUrl =
                    "https://rinkeby.zkscan.io/explorer/transactions/";
                break;
            case 1:
            default:
                baseExplorerUrl = "https://zkscan.io/explorer/transactions/";
        }
        return (
            <table>
                <thead>
                    <tr>
                        <th>Market</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Side</th>
                        <th>Fee</th>
                        <th>Order Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {fills.map((fill, i) => {
                        const fillid = fill[1];
                        const market = fill[2];
                        const side = fill[3];
                        let price = fill[4];
                        let baseQuantity = fill[5];
                        const fillstatus = fill[6];
                        const baseCurrency = fill[2].split("-")[0];
                        const quoteCurrency = fill[2].split("-")[1];
                        const sidetext = fill[3] === "b" ? "buy" : "sell";
                        const sideclassname =
                            fill[3] === "b" ? "up_value" : "down_value";
                        const txhash = fill[7];
                        let feeText;
                        if (
                            fillstatus === "r" ||
                            !isZksyncChain(this.props.chainId)
                        ) {
                            feeText = "0 " + baseCurrency;
                        } else if (side === "s") {
                            feeText =
                                currencyInfo[baseCurrency].gasFee +
                                " " +
                                baseCurrency;
                        } else if (side === "b") {
                            feeText =
                                currencyInfo[quoteCurrency].gasFee +
                                " " +
                                quoteCurrency;
                        }
                        const fillWithoutFee = getFillDetailsWithoutFee(fill);
                        if ([1, 1000].includes(this.props.chainId)) {
                            price = fillWithoutFee.price;
                            baseQuantity = fillWithoutFee.baseQuantity;
                        }
                        let statusText, statusClass;
                        switch (fillstatus) {
                            case "r":
                                statusText = "rejected";
                                statusClass = "rejected";
                                break;
                            case "pf":
                                statusText = "partial fill";
                                statusClass = "filled";
                                break;
                            case "f":
                                statusText = "filled";
                                statusClass = "filled";
                                break;
                            case "pm":
                                statusText = (
                                    <span>
                                        partial match
                                        <img
                                            className="loading-gif"
                                            src={loadingGif}
                                            alt="Pending"
                                        />
                                    </span>
                                );
                                statusClass = "matched";
                                break;
                            case "m":
                                statusText = (
                                    <span>
                                        matched{" "}
                                        <img
                                            className="loading-gif"
                                            src={loadingGif}
                                            alt="Pending"
                                        />
                                    </span>
                                );
                                statusClass = "matched";
                                break;
                            case "b":
                                statusText = (
                                    <span>
                                        committing{" "}
                                        <img
                                            className="loading-gif"
                                            src={loadingGif}
                                            alt="Pending"
                                        />
                                    </span>
                                );
                                statusClass = "committing";
                                break;
                            case "o":
                                statusText = "open";
                                statusClass = "open";
                                break;
                            case "c":
                            default:
                                statusText = "canceled";
                                statusClass = "canceled";
                                break;
                        }

                        return (
                            <tr key={fillid}>
                                <td>{market}</td>
                                <td>{price.toPrecision(6) / 1}</td>
                                <td>
                                    {baseQuantity.toPrecision(6) / 1}{" "}
                                    {baseCurrency}
                                </td>
                                <td className={sideclassname}>{sidetext}</td>
                                <td>{feeText}</td>
                                <td className={statusClass}>{statusText}</td>
                                <td>
                                    {txhash ? (
                                        <a
                                            href={baseExplorerUrl + txhash}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            View Tx
                                        </a>
                                    ) : (
                                        ""
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }

    render() {
        let explorerLink;
        switch (this.props.chainId) {
            case 1000:
                explorerLink =
                    "https://rinkeby.zkscan.io/explorer/accounts/" +
                    this.props.user.address;
                break;
            case 1:
            default:
                explorerLink =
                    "https://zkscan.io/explorer/accounts/" +
                    this.props.user.address;
        }
        let footerContent,
            classNameOrders = "",
            classNameBalances = "",
            classNameFills = "";
        const userOrdersSorted = Object.values(this.props.userOrders);
        userOrdersSorted.sort((a, b) => b[1] - a[1]);
        switch (this.state.tab) {
            case "orders":
                footerContent = this.renderOrderTable(this.getOpenOrders());
                classNameOrders = "selected";
                break;
            case "history":
                footerContent = this.renderFillTable(this.getFills());
                classNameFills = "selected";
                break;
            case "balances":
                if (this.props.user.committed) {
                    const balancesContent = Object.keys(
                        this.props.user.committed.balances
                    ).map((token) => {
                        if (!currencyInfo[token]) return "";
                        let balance = this.props.user.committed.balances[token];
                        balance =
                            parseInt(balance) /
                            Math.pow(10, currencyInfo[token].decimals);
                        return (
                            <tr>
                                <td>{token}</td>
                                <td>{balance}</td>
                            </tr>
                        );
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
                                <tbody>{balancesContent}</tbody>
                            </table>

                            <a
                                href={explorerLink}
                                target="_blank"
                                rel="noreferrer"
                            >
                                View Account on Explorer
                            </a>
                        </div>
                    );
                } else {
                    footerContent = (
                        <div>
                            <a
                                href={explorerLink}
                                target="_blank"
                                rel="noreferrer"
                            >
                                View Account on Explorer
                            </a>
                        </div>
                    );
                }
                classNameBalances = "selected";
                break;
            default:
                break;
        }

        return (
            <>
                <div className="footer">
                    <div className="footer_container">
                        <hr />
                        <div>
                            <div className="ft_tabs">
                                <strong
                                    className={classNameOrders}
                                    onClick={() => this.setTab("orders")}
                                >
                                    Orders ({this.getOpenOrders().length})
                                </strong>
                                <strong
                                    className={classNameFills}
                                    onClick={() => this.setTab("history")}
                                >
                                    Fills ({this.getFills().length})
                                </strong>
                                <strong
                                    className={classNameBalances}
                                    onClick={() => this.setTab("balances")}
                                >
                                    Balances
                                </strong>
                            </div>
                        </div>
                        <div className="footer_orders">{footerContent}</div>
                    </div>
                </div>
            </>
        );
    }
}

export default Footer;
