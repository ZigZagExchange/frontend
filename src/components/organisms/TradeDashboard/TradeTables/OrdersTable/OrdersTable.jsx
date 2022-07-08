import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import "./OrdersTable.css";
import { useCoinEstimator } from "components";
import styled from "styled-components";
import loadingGif from "assets/icons/loading.svg";

import FillCard from "./FillCard";
import {
  balancesSelector,
  networkSelector,
  settingsSelector,
} from "lib/store/features/api/apiSlice";
import api from "lib/api";
import { formatDate, formatDateTime, formatToken, addComma } from "lib/utils";
import { Tab } from "components/molecules/TabMenu";
import Text from "components/atoms/Text/Text";

import {
  SortUpIcon,
  SortDownIcon,
  SortUpFilledIcon,
  SortDownFilledIcon,
} from "components/atoms/Svg";
import {
  StyledTabMenu,
  FooterWrapper,
  FooterContainer,
  LaptopWrapper,
  MobileWrapper,
  SortIconWrapper,
  HeaderWrapper,
  ActionWrapper,
} from "./StyledComponents";
import { Dropdown } from "components/molecules/Dropdown";
import { Button } from "components/molecules/Button";

const StyledButton = styled(Button)`
  margin-right: 7vw;
  white-space: nowrap;
`;

const TableHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.foreground400};
`;

export default function OrdersTable(props) {
  const network = useSelector(networkSelector);
  const balanceData = useSelector(balancesSelector);
  const settings = useSelector(settingsSelector);
  const coinEstimator = useCoinEstimator();
  const [tab, setTabIndex] = useState(0);
  const [selectedSide, setSelectedSide] = useState("All");
  const [tokenDirection, setTokenDirection] = useState(false);
  const [balanceDirection, setBalanceDirection] = useState(false);
  const [walletList, setWalletList] = useState([]);
  const [tokenSorted, setTokenSorted] = useState(false);
  const [balanceSorted, setBalanceSorted] = useState(false);
  const [sideItems, setSideItems] = useState([
    { text: "All", url: "#", iconSelected: true, value: "All" },
    { text: "Buy", url: "#", value: "Buy" },
    { text: "Sell", url: "#", value: "Sell" },
  ]);
  const isMobile = window.innerWidth < 1064;

  const wallet = balanceData[network];

  useEffect(() => {
    let walletArray = [];

    if (wallet) {
      Object.keys(wallet)
        .filter(filterSmallBalances)
        .sort(sortByNotional)
        .forEach((key) => {
          walletArray.push({ ...wallet[key], token: key });
        });
    }

    let isSame = true;

    walletArray.map((item) => {
      let index = walletList.findIndex((item1) => item.token === item1.token);
      if (index === -1) isSame = false;
      else {
        if (JSON.stringify(item) !== JSON.stringify(walletList[index]))
          isSame = false;
      }
    });

    if (!isSame) {
      setWalletList(walletArray);
    }
  }, [wallet]);

  const setTab = (newIndex) => {
    setTabIndex(newIndex);
  };

  const getFills = () => {
    return Object.values(props.userFills)
      .filter(
        (i) =>
          i[6] === "f" &&
          (selectedSide === "All" || i[3] === selectedSide.toLowerCase()[0])
      )
      .sort((a, b) => b[1] - a[1]);
  };

  const getUserOrders = () => {
    return Object.values(props.userOrders)
      .filter(
        (i) =>
          i[9] !== "f" &&
          (selectedSide === "All" || i[3] === selectedSide.toLowerCase()[0])
      )
      .sort((a, b) => b[1] - a[1]);
  };
  
  const getUserOrderIds = () => {
    return getUserOrders().map(o => o[0]);
  }

  const isOpenStatus = (orders) => {
    return orders.findIndex((order) => order[9] === "o") !== -1;
  };

  const changeSide = (newSide) => {
    const newItems = sideItems.reduce((acc, item) => {
      if (item.text === newSide) {
        acc.push({
          ...item,
          iconSelected: true,
        });
      } else {
        acc.push({
          ...item,
          iconSelected: false,
        });
      }
      return acc;
    }, []);
    setSelectedSide(newSide);
    setSideItems(newItems);
  };

  const sortByNotional = (cur1, cur2) => {
    const notionalCur1 = coinEstimator(cur1) * wallet[cur1].valueReadable;
    const notionalCur2 = coinEstimator(cur2) * wallet[cur2].valueReadable;
    if (notionalCur1 > notionalCur2) {
      return -1;
    } else if (notionalCur1 < notionalCur2) {
      return 1;
    } else return 0;
  };

  const filterSmallBalances = (currency) => {
    const balance = wallet[currency].valueReadable;
    const usd_balance =
      coinEstimator(currency) * wallet[currency].valueReadable;

    if (usd_balance < 0.02) return false;

    if (balance) {
      return Number(balance) > 0;
    } else {
      return 0;
    }
  };

  const filterSmallBalancesForBalancesTable = (item) => {
    const balance = item.valueReadable;
    const usd_balance = coinEstimator(item.token) * item.valueReadable;
    console.log(usd_balance);

    if (usd_balance < 0.02) return false;

    if (balance) {
      return Number(balance) > 0;
    } else {
      return 0;
    }
  };

  const sortByToken = () => {
    let walletArray = [...walletList];
    const toggled = !tokenDirection;
    const filteredArray = walletArray.filter(
      filterSmallBalancesForBalancesTable
    );
    walletArray = filteredArray;
    walletArray.sort((a, b) => {
      if (toggled) {
        return a["token"] > b["token"] ? 1 : -1;
      }
      return a["token"] > b["token"] ? -1 : 1;
    });

    setTokenSorted(true);
    setBalanceSorted(false);
    setTokenDirection(toggled);
    setBalanceDirection(false);
    setWalletList(walletArray);
  };

  const sortByBalance = () => {
    let walletArray = [...walletList];
    const toggled = !balanceDirection;
    const filteredArray = walletArray.filter(
      filterSmallBalancesForBalancesTable
    );
    walletArray = filteredArray;
    walletArray.sort((a, b) => {
      const notionalCur1 = coinEstimator(a["token"]) * a["valueReadable"];
      const notionalCur2 = coinEstimator(b["token"]) * b["valueReadable"];
      if (toggled) {
        if (notionalCur1 > notionalCur2) {
          return -1;
        } else if (notionalCur1 < notionalCur2) {
          return 1;
        } else return 0;
      }
      if (notionalCur1 > notionalCur2) {
        return 1;
      } else if (notionalCur1 < notionalCur2) {
        return -1;
      } else return 0;
    });

    setTokenSorted(false);
    setBalanceSorted(true);
    setTokenDirection(false);
    setBalanceDirection(toggled);
    setWalletList(walletArray);
  };

  const cancelOrder = async (orderId) => {
    try {
      await api.cancelOrder(orderId);

      if (!settings.disableOrderNotification) {
        toast.info("Order cancelled", {
          toastId: "Order cancelled.",
        });
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const onClickTradeId = (fill) => {
    toast.warning(
      ({ closeToast }) => <FillCard closeToast={closeToast} fill={fill} />,
      {
        className: "fillToastCard",
        bodyClassName: "!p-0",
        closeOnClick: false,
        autoClose: false,
        icon: false,
        closeButton: false,
      }
    );
  };

  const renderOrderTable = (orders) => {
    return isMobile ? (
      <table>
        <tbody>
          {orders.map((order, i) => {
            const orderId = order[1];
            const market = order[2];
            const time = order[7] && formatDateTime(new Date(order[7] * 1000));
            let price = order[4];
            let baseQuantity = order[5];
            let remaining = isNaN(Number(order[11])) ? order[5] : order[11];
            const orderStatus = order[9];
            const baseCurrency = order[2].split("-")[0];
            const side = order[3] === "b" ? "buy" : "sell";
            const sideclassname =
              order[3] === "b" ? "successHighEmphasis" : "dangerHighEmphasis";
            const expiration = order[7];
            const now = (Date.now() / 1000) | 0;
            const timeToExpiry = expiration - now;
            let expiryText;
            if (timeToExpiry > 86400) {
              expiryText = Math.floor(timeToExpiry / 86400) + "d";
            } else if (timeToExpiry > 3600) {
              expiryText = Math.floor(timeToExpiry / 3600) + "h";
            } else if (timeToExpiry > 0) {
              expiryText = Math.floor(timeToExpiry / 3600) + "m";
            } else {
              expiryText = "--";
            }

            const orderWithoutFee = api.getOrderDetailsWithoutFee(order);
            if (api.isZksyncChain()) {
              price = orderWithoutFee.price;
              baseQuantity = orderWithoutFee.baseQuantity;
              remaining = orderWithoutFee.remaining;
            }
            let statusText, statusClass;
            switch (order[9]) {
              case "r":
                statusText = "rejected";
                statusClass = "dangerHighEmphasis";
                break;
              case "pf":
                statusText = "partial fill";
                statusClass = "successHighEmphasis";
                break;
              case "f":
                statusText = "filled";
                statusClass = "successHighEmphasis";
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
                statusClass = "warningHighEmphasis";
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
                statusClass = "warningHighEmphasis";
                break;
              case "b":
                statusText = (
                  <span>
                    <span style={{ display: "inline" }}>committing </span>
                    <img
                      className="loading-gif"
                      src={loadingGif}
                      alt="Pending"
                      style={{ display: "inline" }}
                    />
                  </span>
                );
                statusClass = "warningHighEmphasis";
                break;
              case "o":
                statusText = "open";
                statusClass = "successHighEmphasis";
                break;
              case "c":
                statusText = "canceled";
                statusClass = "dangerHighEmphasis";
                break;
              case "e":
                statusText = "expired";
                statusClass = "warningHighEmphasis";
                break;
              default:
                break;
            }

            return (
              <tr key={orderId}>
                <table>
                  <tr>
                    <td data-label="Market">
                      <div style={{ display: "inline-flex", gap: "16px" }}>
                        <Text
                          font="primaryExtraSmallSemiBold"
                          color="foregroundHighEmphasis"
                        >
                          {market}
                        </Text>
                        <Text
                          font="primaryExtraSmallSemiBold"
                          color={sideclassname}
                        >
                          {side}
                        </Text>
                      </div>
                      <Text
                        font="primaryExtraSmallSemiBold"
                        color="foregroundHighEmphasis"
                      >
                        {time}
                      </Text>
                    </td>
                    <td
                      data-label="Order Status"
                      style={{ textAlign: "right" }}
                    >
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <Text
                          font="primaryExtraSmallSemiBold"
                          color={statusClass}
                          textAlign="right"
                        >
                          {statusText}
                        </Text>
                        {orderStatus === "o" ? (
                          <ActionWrapper
                            font="primaryExtraSmallSemiBold"
                            color="primaryHighEmphasis"
                            textAlign="right"
                            onClick={() => cancelOrder(orderId)}
                          >
                            Cancel
                          </ActionWrapper>
                        ) : (
                          ""
                        )}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Text
                        font="primaryExtraSmallSemiBold"
                        color="foregroundLowEmphasis"
                      >
                        Price
                      </Text>
                    </td>
                    <td>
                      <Text
                        font="primaryExtraSmallSemiBold"
                        color="foregroundHighEmphasis"
                        textAlign="right"
                      >
                        {addComma(price.toPrecision(6) / 1)}
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Text
                        font="primaryExtraSmallSemiBold"
                        color="foregroundLowEmphasis"
                      >
                        Amount
                      </Text>
                    </td>
                    <td>
                      <Text
                        font="primaryExtraSmallSemiBold"
                        color="foregroundHighEmphasis"
                        textAlign="right"
                      >
                        {baseQuantity.toPrecision(6) / 1} {baseCurrency}
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Text
                        font="primaryExtraSmallSemiBold"
                        color="foregroundLowEmphasis"
                      >
                        Fee
                      </Text>
                    </td>
                    <td>
                      <Text
                        font="primaryExtraSmallSemiBold"
                        color="foregroundHighEmphasis"
                        textAlign="right"
                      >
                        {remaining.toPrecision(6) / 1} {baseCurrency}
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}></td>
                  </tr>
                </table>
              </tr>
            );
          })}
        </tbody>
      </table>
    ) : (
      <table>
        <thead>
          <tr>
            <th scope="col">
              <HeaderWrapper>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  Time
                </Text>
                {/* <SortIconWrapper>
                    <SortUpIcon /><SortDownIcon />
                  </SortIconWrapper> */}
              </HeaderWrapper>
            </th>
            <th scope="col">
              <HeaderWrapper>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  Market
                </Text>
                {/* <SortIconWrapper>
                    <SortUpIcon /><SortDownIcon />
                  </SortIconWrapper> */}
              </HeaderWrapper>
            </th>
            <th scope="col">
              <HeaderWrapper style={{ position: "relative" }}>
                {/* <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis" onClick>Side</Text> */}
                <Dropdown
                  adClass="side-dropdown size-wide"
                  transparent={true}
                  width={162}
                  item={sideItems}
                  context="Side"
                  leftIcon={false}
                  clickFunction={changeSide}
                />
              </HeaderWrapper>
            </th>
            <th scope="col">
              <HeaderWrapper>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  Price
                </Text>
                {/* <SortIconWrapper>
                    <SortUpIcon /><SortDownIcon />
                  </SortIconWrapper> */}
              </HeaderWrapper>
            </th>
            <th scope="col">
              <HeaderWrapper>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  Amount
                </Text>
                {/* <SortIconWrapper>
                    <SortUpIcon /><SortDownIcon />
                  </SortIconWrapper> */}
              </HeaderWrapper>
            </th>
            <th scope="col">
              <HeaderWrapper>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  Remaining
                </Text>
                {/* <SortIconWrapper>
                    <SortUpIcon /><SortDownIcon />
                  </SortIconWrapper> */}
              </HeaderWrapper>
            </th>
            <th scope="col">
              <HeaderWrapper>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  Expiry
                </Text>
                {/* <SortIconWrapper>
                    <SortUpIcon /><SortDownIcon />
                  </SortIconWrapper> */}
              </HeaderWrapper>
            </th>
            <th scope="col">
              <HeaderWrapper>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  Order Status
                </Text>
                {/* <SortIconWrapper>
                    <SortUpIcon /><SortDownIcon />
                  </SortIconWrapper> */}
              </HeaderWrapper>
            </th>
            <th scope="col">
              <HeaderWrapper>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  Action
                </Text>
                {/* <SortIconWrapper>
                    <SortUpIcon /><SortDownIcon />
                  </SortIconWrapper> */}
              </HeaderWrapper>
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, i) => {
            const orderId = order[1];
            const market = order[2];
            const time = order[7] && formatDate(new Date(order[7] * 1000));
            let price = order[4];
            let baseQuantity = order[5];
            let remaining = isNaN(Number(order[11])) ? order[5] : order[11];
            let orderStatus = order[9];
            const baseCurrency = order[2].split("-")[0];
            const side = order[3] === "b" ? "buy" : "sell";
            const sideclassname =
              order[3] === "b" ? "successHighEmphasis" : "dangerHighEmphasis";
            const expiration = order[7];
            const now = (Date.now() / 1000) | 0;
            const timeToExpiry = expiration - now;
            let expiryText;
            if (timeToExpiry > 86400) {
              expiryText = Math.floor(timeToExpiry / 86400) + "d";
            } else if (timeToExpiry > 3600) {
              expiryText = Math.floor(timeToExpiry / 3600) + "h";
            } else if (timeToExpiry > 0) {
              expiryText = Math.floor(timeToExpiry / 3600) + "m";

              if (Math.floor(timeToExpiry / 3600) === 0) {
                expiryText = `${Math.floor(timeToExpiry / 60)}m`;
              }
            } else {
              expiryText = "--";
              orderStatus = "e";
            }

            const orderWithoutFee = api.getOrderDetailsWithoutFee(order);
            if (api.isZksyncChain()) {
              price = orderWithoutFee.price;
              baseQuantity = orderWithoutFee.baseQuantity;
              remaining = orderWithoutFee.remaining;
            }
            let statusText, statusClass;
            switch (orderStatus) {
              case "r":
                statusText = "rejected";
                statusClass = "dangerHighEmphasis";
                break;
              case "pf":
                statusText = "partial fill";
                statusClass = "successHighEmphasis";
                break;
              case "f":
                statusText = "filled";
                statusClass = "successHighEmphasis";
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
                statusClass = "warningHighEmphasis";
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
                statusClass = "warningHighEmphasis";
                break;
              case "b":
                statusText = (
                  <span>
                    <span style={{ display: "inline" }}>committing </span>
                    <img
                      className="loading-gif"
                      src={loadingGif}
                      alt="Pending"
                      style={{ display: "inline" }}
                    />
                  </span>
                );
                statusClass = "warningHighEmphasis";
                break;
              case "o":
                statusText = "open";
                statusClass = "successHighEmphasis";
                break;
              case "c":
                statusText = "canceled";
                statusClass = "dangerHighEmphasis";
                break;
              case "e":
                statusText = "expired";
                statusClass = "warningHighEmphasis";
                break;
              default:
                break;
            }

            return (
              <>
                <tr key={orderId}>
                  <td data-label="Time">
                    <Text
                      font="primaryExtraSmallSemiBold"
                      color="foregroundHighEmphasis"
                    >
                      {time}
                    </Text>
                  </td>
                  <td data-label="Market">
                    <Text
                      font="primaryExtraSmallSemiBold"
                      color="foregroundHighEmphasis"
                    >
                      {market}
                    </Text>
                  </td>
                  <td data-label="Side">
                    <Text
                      font="primaryExtraSmallSemiBold"
                      color={sideclassname}
                    >
                      {side}
                    </Text>
                  </td>
                  <td data-label="Price">
                    <Text
                      font="primaryExtraSmallSemiBold"
                      color="foregroundHighEmphasis"
                    >
                      {addComma(price.toPrecision(6) / 1)}
                    </Text>
                  </td>
                  <td data-label="Quantity">
                    <Text
                      font="primaryExtraSmallSemiBold"
                      color="foregroundHighEmphasis"
                    >
                      {baseQuantity.toPrecision(6) / 1} {baseCurrency}
                    </Text>
                  </td>
                  <td data-label="Remaining">
                    <Text
                      font="primaryExtraSmallSemiBold"
                      color="foregroundHighEmphasis"
                    >
                      {remaining.toPrecision(6) / 1} {baseCurrency}
                    </Text>
                  </td>
                  <td data-label="Expiry">
                    <Text
                      font="primaryExtraSmallSemiBold"
                      color="foregroundHighEmphasis"
                    >
                      {expiryText}
                    </Text>
                  </td>
                  <td data-label="Order Status">
                    <Text font="primaryExtraSmallSemiBold" color={statusClass}>
                      {statusText}
                    </Text>
                  </td>
                  <td data-label="Action">
                    {orderStatus === "o" ? (
                      <ActionWrapper
                        font="primaryExtraSmallSemiBold"
                        color="primaryHighEmphasis"
                        onClick={() => cancelOrder(orderId)}
                      >
                        Cancel
                      </ActionWrapper>
                    ) : (
                      ""
                    )}
                  </td>
                </tr>
              </>
            );
          })}
        </tbody>
      </table>
    );
  };

  const renderFillTable = (fills) => {
    let baseExplorerUrl;
    switch (api.apiProvider.network) {
      case 1001:
        baseExplorerUrl = "https://goerli.voyager.online/tx/";
        break;
      case 1000:
        baseExplorerUrl = "https://rinkeby.zkscan.io/explorer/transactions/";
        break;
      case 1:
      default:
        baseExplorerUrl = "https://zkscan.io/explorer/transactions/";
    }
    return isMobile ? (
      <table>
        <tbody>
          {fills.map((fill, i) => {
            const fillid = fill[1];
            const market = fill[2];
            const baseCurrency = fill[2].split("-")[0];
            const time = fill[12] && formatDateTime(new Date(fill[12]));
            const side = fill[3];
            let price = fill[4];
            let baseQuantity = fill[5];
            const fillstatus = fill[6];
            const sidetext = side === "b" ? "buy" : "sell";
            const sideclassname =
              side === "b" ? "successHighEmphasis" : "dangerHighEmphasis";
            const txhash = fill[7];
            const feeamount = Number(fill[10]);
            const feetoken = fill[11];
            let feeText = "--";
            if (feeamount && feetoken) {
              const displayFee =
                feeamount > 9999
                  ? feeamount.toFixed(0)
                  : feeamount.toPrecision(4);
              feeText = `${displayFee} ${feetoken}`;
            }
            if (api.isZksyncChain()) {
              price = Number(fill[4]);
              baseQuantity = Number(fill[5]);
            }
            let statusText, statusClass;
            switch (fillstatus) {
              case "r":
                statusText = "rejected";
                statusClass = "dangerHighEmphasis";
                break;
              case "pf":
                statusText = "partial fill";
                statusClass = "successHighEmphasis";
                break;
              case "f":
                statusText = "filled";
                statusClass = "successHighEmphasis";
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
                statusClass = "warningHighEmphasis";
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
                statusClass = "warningHighEmphasis";
                break;
              case "b":
                statusText = (
                  <span>
                    <span style={{ display: "inline" }}>committing </span>
                    <img
                      className="loading-gif"
                      src={loadingGif}
                      alt="Pending"
                      style={{ display: "inline" }}
                    />
                  </span>
                );
                statusClass = "warningHighEmphasis";
                break;
              case "o":
                statusText = "open";
                statusClass = "successHighEmphasis";
                break;
              case "c":
                statusText = "canceled";
                statusClass = "dangerHighEmphasis";
                break;
              case "e":
                statusText = "expired";
                statusClass = "warningHighEmphasis";
                break;
              default:
                break;
            }

            const marketInfo = api.marketInfo[market];
            return (
              <tr key={fillid}>
                <table>
                  <tbody>
                    <tr>
                      <td data-label="Market">
                        <div style={{ display: "inline-flex", gap: "16px" }}>
                          <Text
                            font="primaryExtraSmallSemiBold"
                            color="foregroundHighEmphasis"
                          >
                            {market}
                          </Text>
                          <Text
                            font="primaryExtraSmallSemiBold"
                            color={sideclassname}
                          >
                            {sidetext}
                          </Text>
                        </div>
                        <Text
                          font="primaryExtraSmallSemiBold"
                          color="foregroundHighEmphasis"
                        >
                          {time}
                        </Text>
                      </td>
                      <td
                        data-label="Order Status"
                        style={{ textAlign: "right" }}
                      >
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <Text
                            font="primaryExtraSmallSemiBold"
                            color={statusClass}
                            textAlign="right"
                          >
                            {statusText}
                          </Text>
                          {txhash ? (
                            <ActionWrapper
                              font="primaryExtraSmallSemiBold"
                              color="primaryHighEmphasis"
                              textAlign="right"
                              onClick={() =>
                                window.open(baseExplorerUrl + txhash, "_blank")
                              }
                            >
                              View Tx
                            </ActionWrapper>
                          ) : (
                            ""
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Text
                          font="primaryExtraSmallSemiBold"
                          color="foregroundLowEmphasis"
                        >
                          Price
                        </Text>
                      </td>
                      <td>
                        <Text
                          font="primaryExtraSmallSemiBold"
                          color="foregroundHighEmphasis"
                          textAlign="right"
                        >
                          {price.toPrecision(6) / 1}
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Text
                          font="primaryExtraSmallSemiBold"
                          color="foregroundLowEmphasis"
                        >
                          Amount
                        </Text>
                      </td>
                      <td>
                        <Text
                          font="primaryExtraSmallSemiBold"
                          color="foregroundHighEmphasis"
                          textAlign="right"
                        >
                          {baseQuantity.toPrecision(6) / 1} {baseCurrency}
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Text
                          font="primaryExtraSmallSemiBold"
                          color="foregroundLowEmphasis"
                        >
                          Trade ID
                        </Text>
                      </td>
                      <td>
                        <ActionWrapper
                          font="primaryExtraSmallSemiBold"
                          color="primaryHighEmphasis"
                          textAlign="right"
                          onClick={() => onClickTradeId(fill)}
                        >
                          #{fillid}
                        </ActionWrapper>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Text
                          font="primaryExtraSmallSemiBold"
                          color="foregroundLowEmphasis"
                        >
                          Fee
                        </Text>
                      </td>
                      <td>
                        <Text
                          font="primaryExtraSmallSemiBold"
                          color="foregroundHighEmphasis"
                          textAlign="right"
                        >
                          {feeText}
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2}></td>
                    </tr>
                  </tbody>
                </table>
              </tr>
            );
          })}
        </tbody>
      </table>
    ) : (
      <table>
        <thead>
          <tr>
            <th>
              <HeaderWrapper>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  Time
                </Text>
                {/* <SortIconWrapper>
                    <SortUpIcon /><SortDownIcon />
                  </SortIconWrapper> */}
              </HeaderWrapper>
            </th>
            <th>
              <HeaderWrapper>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  Market
                </Text>
                {/* <SortIconWrapper>
                    <SortUpIcon /><SortDownIcon />
                  </SortIconWrapper> */}
              </HeaderWrapper>
            </th>
            <th>
              <HeaderWrapper style={{ position: "relative" }}>
                {/* <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">Side</Text> */}
                <Dropdown
                  adClass="side-dropdown size-wide"
                  transparent={true}
                  width={162}
                  item={sideItems}
                  context="Side"
                  leftIcon={false}
                  clickFunction={changeSide}
                />
              </HeaderWrapper>
            </th>
            <th>
              <HeaderWrapper>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  Amount
                </Text>
                {/* <SortIconWrapper>
                    <SortUpIcon /><SortDownIcon />
                  </SortIconWrapper> */}
              </HeaderWrapper>
            </th>
            <th>
              <HeaderWrapper>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  Price
                </Text>
                {/* <SortIconWrapper>
                    <SortUpIcon /><SortDownIcon />
                  </SortIconWrapper> */}
              </HeaderWrapper>
            </th>
            <th>
              <HeaderWrapper>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  Fee
                </Text>
                {/* <SortIconWrapper>
                    <SortUpIcon /><SortDownIcon />
                  </SortIconWrapper> */}
              </HeaderWrapper>
            </th>
            <th>
              <HeaderWrapper>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  Order Status
                </Text>
              </HeaderWrapper>
            </th>
            <th>
              <HeaderWrapper>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  Trade ID
                </Text>
              </HeaderWrapper>
            </th>
            <th>
              <HeaderWrapper>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  Action
                </Text>
                {/* <SortIconWrapper>
                    <SortUpIcon /><SortDownIcon />
                  </SortIconWrapper> */}
              </HeaderWrapper>
            </th>
          </tr>
        </thead>
        <tbody>
          {fills.map((fill, i) => {
            const fillid = fill[1];
            const market = fill[2];
            const time = fill[12] && formatDate(new Date(fill[12]));
            const side = fill[3];
            let price = fill[4];
            let baseQuantity = fill[5];
            const baseCurrency = fill[2].split("-")[0];
            const fillstatus = fill[6];
            const sidetext = side === "b" ? "buy" : "sell";
            const sideclassname =
              side === "b" ? "successHighEmphasis" : "dangerHighEmphasis";
            const txhash = fill[7];
            const feeamount = Number(fill[10]);
            const feetoken = fill[11];
            let feeText = "--";
            if (feeamount && feetoken) {
              const displayFee =
                feeamount > 9999
                  ? feeamount.toFixed(0)
                  : feeamount.toPrecision(4);
              feeText = `${displayFee} ${feetoken}`;
            }
            if (api.isZksyncChain()) {
              price = Number(fill[4]);
              baseQuantity = Number(fill[5]);
            }
            let statusText, statusClass;
            switch (fillstatus) {
              case "r":
                statusText = "rejected";
                statusClass = "dangerHighEmphasis";
                break;
              case "pf":
                statusText = "partial fill";
                statusClass = "successHighEmphasis";
                break;
              case "f":
                statusText = "filled";
                statusClass = "successHighEmphasis";
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
                statusClass = "warningHighEmphasis";
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
                statusClass = "warningHighEmphasis";
                break;
              case "b":
                statusText = (
                  <span>
                    <span style={{ display: "inline" }}>committing </span>
                    <img
                      className="loading-gif"
                      src={loadingGif}
                      alt="Pending"
                      style={{ display: "inline" }}
                    />
                  </span>
                );
                statusClass = "warningHighEmphasis";
                break;
              case "o":
                statusText = "open";
                statusClass = "successHighEmphasis";
                break;
              case "c":
                statusText = "canceled";
                statusClass = "dangerHighEmphasis";
                break;
              case "e":
                statusText = "expired";
                statusClass = "warningHighEmphasis";
                break;
              default:
                break;
            }

            const marketInfo = api.marketInfo[market];
            return (
              <tr key={fillid}>
                <td data-label="Time">
                  <Text
                    font="primaryExtraSmallSemiBold"
                    color="foregroundHighEmphasis"
                  >
                    {time}
                  </Text>
                </td>
                <td data-label="Market">
                  <Text
                    font="primaryExtraSmallSemiBold"
                    color="foregroundHighEmphasis"
                  >
                    {market}
                  </Text>
                </td>
                <td data-label="Side">
                  <Text font="primaryExtraSmallSemiBold" color={sideclassname}>
                    {sidetext}
                  </Text>
                </td>
                <td data-label="Quantity">
                  <Text
                    font="primaryExtraSmallSemiBold"
                    color="foregroundHighEmphasis"
                  >
                    {baseQuantity.toPrecision(6) / 1} {baseCurrency}
                  </Text>
                </td>
                <td data-label="Price">
                  <Text
                    font="primaryExtraSmallSemiBold"
                    color="foregroundHighEmphasis"
                  >
                    {price.toPrecision(6) / 1}
                  </Text>
                </td>
                <td data-label="Fee">
                  <Text
                    font="primaryExtraSmallSemiBold"
                    color="foregroundHighEmphasis"
                  >
                    {feeText}
                  </Text>
                </td>
                <td data-label="Order Status">
                  <Text font="primaryExtraSmallSemiBold" color={statusClass}>
                    {statusText}
                  </Text>
                </td>
                <td data-label="TradeID">
                  <button
                    className="text-xs font-semibold text-primary-900 hover:underline hover:underline-offset-1 font-work"
                    onClick={() => onClickTradeId(fill)}
                  >
                    #{fillid}
                  </button>
                </td>
                <td data-label="Action">
                  {txhash ? (
                    <ActionWrapper
                      font="primaryExtraSmallSemiBold"
                      color="primaryHighEmphasis"
                      onClick={() =>
                        window.open(baseExplorerUrl + txhash, "_blank")
                      }
                    >
                      View Tx
                    </ActionWrapper>
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
  };

  let explorerLink;
  switch (api.apiProvider.network) {
    case 1000:
      explorerLink =
        "https://rinkeby.zkscan.io/explorer/accounts/" + props.user.address;
      break;
    case 1:
    default:
      explorerLink =
        "https://zkscan.io/explorer/accounts/" + props.user.address;
  }

  let footerContent;
  switch (tab) {
    case 0:
      footerContent = renderOrderTable(getUserOrders());
      break;
    case 1:
      footerContent = renderFillTable(getFills());
      break;
    case 2:
      if (props.user.committed) {
        const balancesContent = walletList.map((token) => {
          return (
            <tr>
              <td data-label="Token">
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundHighEmphasis"
                >
                  {token.token}
                </Text>
              </td>
              <td data-label="Balance">
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundHighEmphasis"
                >
                  {settings.hideBalance
                    ? "****.****"
                    : formatToken(token.valueReadable, token.token)}
                </Text>
              </td>
              <td data-label="Balance">
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundHighEmphasis"
                >
                  {settings.hideBalance
                    ? "****.****"
                    : formatToken(
                        token.valueReadable * coinEstimator(token.token)
                      )}
                </Text>
              </td>
            </tr>
          );
        });
        footerContent = (
          <div style={{ textAlign: "center", marginTop: "8px" }}>
            <table>
              <thead>
                <tr>
                  <th
                    scope="col"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      sortByToken();
                    }}
                  >
                    <HeaderWrapper>
                      <Text
                        font="primaryExtraSmallSemiBold"
                        color="foregroundLowEmphasis"
                      >
                        Token
                      </Text>
                      {tokenSorted ? (
                        <SortIconWrapper>
                          {tokenDirection ? (
                            <SortUpIcon />
                          ) : (
                            <SortUpFilledIcon />
                          )}
                          {tokenDirection ? (
                            <SortDownFilledIcon />
                          ) : (
                            <SortDownIcon />
                          )}
                        </SortIconWrapper>
                      ) : (
                        <SortIconWrapper>
                          <SortUpIcon />
                          <SortDownIcon />
                        </SortIconWrapper>
                      )}
                    </HeaderWrapper>
                  </th>
                  <th
                    scope="col"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      sortByBalance();
                    }}
                  >
                    <HeaderWrapper>
                      <Text
                        font="primaryExtraSmallSemiBold"
                        color="foregroundLowEmphasis"
                      >
                        Token balance
                      </Text>
                      {balanceSorted ? (
                        <SortIconWrapper>
                          {balanceDirection ? (
                            <SortUpIcon />
                          ) : (
                            <SortUpFilledIcon />
                          )}
                          {balanceDirection ? (
                            <SortDownFilledIcon />
                          ) : (
                            <SortDownIcon />
                          )}
                        </SortIconWrapper>
                      ) : (
                        <SortIconWrapper>
                          <SortUpIcon />
                          <SortDownIcon />
                        </SortIconWrapper>
                      )}
                    </HeaderWrapper>
                  </th>
                  <th
                    scope="col"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      sortByBalance();
                    }}
                  >
                    <HeaderWrapper>
                      <Text
                        font="primaryExtraSmallSemiBold"
                        color="foregroundLowEmphasis"
                      >
                        USD balance
                      </Text>
                      {balanceSorted ? (
                        <SortIconWrapper>
                          {balanceDirection ? (
                            <SortUpIcon />
                          ) : (
                            <SortUpFilledIcon />
                          )}
                          {balanceDirection ? (
                            <SortDownFilledIcon />
                          ) : (
                            <SortDownIcon />
                          )}
                        </SortIconWrapper>
                      ) : (
                        <SortIconWrapper>
                          <SortUpIcon />
                          <SortDownIcon />
                        </SortIconWrapper>
                      )}
                    </HeaderWrapper>
                  </th>
                </tr>
              </thead>
              <tbody>{balancesContent}</tbody>
            </table>

            <ActionWrapper
              font="primaryExtraSmallSemiBold"
              color="primaryHighEmphasis"
              textAlign="center"
              className="view-account-button"
              onClick={() => window.open(explorerLink, "_blank")}
            >
              View Account on Explorer
            </ActionWrapper>
          </div>
        );
      } else {
        footerContent = (
          <div style={{ textAlign: "center" }}>
            <ActionWrapper
              font="primaryExtraSmallSemiBold"
              color="primaryHighEmphasis"
              textAlign="center"
              className="view-account-button"
              onClick={() => window.open(explorerLink, "_blank")}
            >
              View Account on Explorer
            </ActionWrapper>
          </div>
        );
      }
      break;
    default:
      break;
  }

  return (
    <>
      <FooterWrapper>
        <FooterContainer>
          <TableHeaderWrapper>
            <StyledTabMenu
              left
              activeIndex={tab}
              onItemClick={(newIndex) => setTab(newIndex)}
            >
              <Tab>Open Orders ({getUserOrders().length})</Tab>
              <Tab>Order History ({getFills().length})</Tab>
              <Tab>Balances</Tab>
            </StyledTabMenu>

            {isOpenStatus(getUserOrders()) && settings.showCancelOrders ? (
              <StyledButton
                variant="outlined"
                width="100px"
                scale="md"
                onClick={api.cancelAllOrders(getUserOrderIds())}
              >
                Cancel All
              </StyledButton>
            ) : (
              ""
            )}
          </TableHeaderWrapper>
          {isMobile ? (
            <MobileWrapper>{footerContent}</MobileWrapper>
          ) : (
            <LaptopWrapper>{footerContent}</LaptopWrapper>
          )}
        </FooterContainer>
      </FooterWrapper>
    </>
  );
}
