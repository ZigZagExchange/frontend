import React from "react";
// css
import "./TradePriceBtcTable.css";
// table data
// assets
import updownIcon from "../../../assets/icons/up-down-arrow.png";

class TradePriceBtcTable extends React.Component {
    render() {
        return (
            <>
                <div className="trade_price_btc_table">
                    <table>
                        <thead>
                            <tr>
                                <th>
                                    Pair
                                    <img
                                        className="ms-2"
                                        src={updownIcon}
                                        alt="..."
                                    />
                                </th>
                                <th>
                                    Price
                                    <img
                                        className="ms-2"
                                        src={updownIcon}
                                        alt="..."
                                    />
                                </th>
                                <th>
                                    Change
                                    <img
                                        className="ms-2"
                                        src={updownIcon}
                                        alt="..."
                                    />
                                    <img
                                        className="ms-2"
                                        src={arrows}
                                        alt="..."
                                    />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.rowData.map((d, i) => {
                                return (
                                    <tr
                                        key={i}
                                        onClick={(e) =>
                                            this.props.updateMarketChain(
                                                undefined,
                                                d.td1
                                            )
                                        }
                                        className={
                                            this.props.currentMarket === d.td1
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        <td>
                                            <img
                                                className="me-2"
                                                src={star}
                                                alt="..."
                                            />
                                            {d.td1.replace("-", "/")}
                                            <span>{d.span}</span>
                                        </td>
                                        <td
                                            className={
                                                d.td3 < 0
                                                    ? "down_value"
                                                    : "up_value"
                                            }
                                        >
                                            {d.td2}
                                        </td>
                                        <td
                                            className={
                                                d.td3 < 0
                                                    ? "down_value"
                                                    : "up_value"
                                            }
                                        >
                                            {d.td3}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </>
        );
    }
}

export default TradePriceBtcTable;
