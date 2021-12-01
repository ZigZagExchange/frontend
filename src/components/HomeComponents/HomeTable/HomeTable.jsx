import React from "react";
// css
import "./HomeTable.css";
// assets
import updownArrow from "../../../assets/icons/up-down-arrow.png";
const HomeTable = () => {
    return (
        <>
            <div className="home_table">
                <table>
                    <thead>
                        <tr className="ht_head">
                            <th>
                                ASSET <img src={updownArrow} alt="" />
                            </th>
                            <th>
                                LAYER-1 BALANCE <img src={updownArrow} alt="" />
                            </th>
                            <th>
                                LAYER-2 BALANCE <img src={updownArrow} alt="" />
                            </th>
                            <th>
                                OPERATIONS <img src={updownArrow} alt="" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>ETH - Ethereum</td>
                            <td>1.1688</td>
                            <td>0.332</td>
                            <td>
                                <div>
                                    <button>Transfer</button>
                                    <button>Deposit</button>
                                    <button>Withdraw</button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>BTC - Bitcoin</td>
                            <td>0.000</td>
                            <td>0.000</td>
                            <td>
                                <div>
                                    <button>Transfer</button>
                                    <button>Deposit</button>
                                    <button>Withdraw</button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>USDT - Tether</td>
                            <td>0.000</td>
                            <td>239.224</td>
                            <td>
                                <div>
                                    <button>Transfer</button>
                                    <button>Deposit</button>
                                    <button>Withdraw</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default HomeTable;
