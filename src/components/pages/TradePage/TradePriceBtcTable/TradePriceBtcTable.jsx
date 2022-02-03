import React from "react";
import { Translation } from "react-i18next";
import "../../../../translations/i18n";
import "./TradePriceBtcTable.css";

class TradePriceBtcTable extends React.Component {
    render() {
        return (
            <Translation>
            {(t, { i18n }) => (
            <>
                <div className="trade_price_btc_table">
                    <table>
                        <thead>
                            <tr>
                                <th>
                                    {t('pair')}
                                </th>
                                <th>
                                    {t('price')}
                                </th>
                                <th>
                                    {t('change')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.rowData.map((d, i) => {
                                return (
                                    <tr
                                        key={i}
                                        onClick={(e) =>
                                            this.props.updateMarketChain(d.td1)
                                        }
                                        className={
                                            this.props.currentMarket === d.td1
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        <td>
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
            )}
        </Translation>
        );
    }
}

export default TradePriceBtcTable;
