import React from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import api from "lib/api";
import { RangeSlider, QuestionHelper } from "components";
import { formatPrice, formatToken, addComma } from "lib/utils";
import { Button, ConnectWalletButton } from "components/molecules/Button";
import InputField from "components/atoms/InputField/InputField";
import Text from "components/atoms/Text/Text";
import { IconButton as BaseIcon } from "../IconButton";
import { MinusIcon, PlusIcon } from "components/atoms/Svg";
import { setHighSlippageModal } from "lib/store/features/api/apiSlice";
import { Box } from "@mui/material";

const isMobile = window.innerWidth < 500;

class SpotForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      price: formatPrice(props.lastPrice),
      baseAmount: "",
      quoteAmount: "",
      maxSizeSelected: false,
      baseChanged: false,
      quoteChanged: false,
      updatePrice: false,
    };
  }

  isInvalidNumber(val) {
    if (Number.isNaN(val) || Number(val) === 0) return true;
    else return false;
  }

  getExchangePercentage(baseAmount, quoteAmount) {
    if (!this.props.user.id) return 0;
    let result;
    if (this.props.side === "s") {
      const baseBalance = this.getBaseBalance();
      const baseFee = this.getBaseFee();
      result = (Number(baseAmount) / (baseBalance - Number(baseFee))) * 100;
    } else {
      const quoteBalance = this.getQuoteBalance();
      const quoteFee = this.getQuoteFee();
      result = (Number(quoteAmount) / (quoteBalance - Number(quoteFee))) * 100;
    }
    if (Number.isNaN(result) || result <= 0) {
      return 0;
    } else if (!Number.isFinite(result) || result >= 99.5) {
      return 100;
    }
    return result.toFixed(0);
  }

  updatePrice(e) {
    const newState = { ...this.state };
    newState.price = e.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
    if (this.props.quoteChanged) {
      // for buy quoteAmount should be fixed
      newState.baseAmount = newState.quoteAmount / newState.price;
    } else {
      // for sell baseAmount should be fixed
      newState.quoteAmount = newState.price * newState.baseAmount;
    }

    newState.quoteChanged = false;
    newState.baseChanged = false;
    this.setState(newState);
  }

  updateBaseAmount(e) {
    const newState = { ...this.state };
    newState.baseAmount = e.target.value
      .replace(",", ".")
      .replace(/[^0-9.]/g, "");
    if (
      /^0\.?0*$/.test(newState.baseAmount) ||
      Number.isNaN(newState.baseAmount)
    ) {
      newState.quoteAmount = "";
    } else {
      const price = this.currentPrice();
      if (price && newState.baseAmount) {
        newState.quoteAmount = price * newState.baseAmount;
      } else {
        newState.quoteAmount = "";
      }
    }
    newState.baseChanged = true;
    newState.quoteChanged = false;
    this.setState(newState);
  }

  updateQuoteAmount(e) {
    const newState = { ...this.state };
    newState.quoteAmount = e.target.value
      .replace(",", ".")
      .replace(/[^0-9.]/g, "");
    if (
      /^0\.?0*$/.test(newState.quoteAmount) ||
      Number.isNaN(newState.quoteAmount)
    ) {
      newState.baseAmount = "";
    } else {
      const price = this.currentPrice();
      if (price && newState.quoteAmount) {
        newState.baseAmount = newState.quoteAmount / price;
      } else {
        newState.baseAmount = "";
      }
    }
    newState.baseChanged = false;
    newState.quoteChanged = true;
    this.setState(newState);
  }

  increasePrice(e) {
    e.preventDefault();
    const newState = { ...this.state };
    newState.price = formatPrice(this.state.price * 1.001);
    if (this.props.quoteChanged) {
      // for buy quoteAmount should be fixed
      newState.baseAmount = newState.quoteAmount / newState.price;
    } else {
      // for sell baseAmount should be fixed
      newState.quoteAmount = newState.price * newState.baseAmount;
    }

    newState.quoteChanged = false;
    newState.baseChanged = false;
    this.setState(newState);
  }

  decreasePrice(e) {
    e.preventDefault();
    const newState = { ...this.state };
    newState.price = formatPrice(this.state.price * 0.999);
    if (this.props.quoteChanged) {
      // for buy quoteAmount should be fixed
      newState.baseAmount = newState.quoteAmount / newState.price;
    } else {
      // for sell baseAmount should be fixed
      newState.quoteAmount = newState.price * newState.baseAmount;
    }

    newState.quoteChanged = false;
    newState.baseChanged = false;
    this.setState(newState);
  }

  increaseAmount(e) {
    e.preventDefault();
    const newState = { ...this.state };

    if (this.props.side === "b") {
      // for buy order we cant exceed the quoteBalance
      let quoteBalance = this.getQuoteBalance();
      const newQuoteAmount =
        Number(this.state.quoteAmount) + quoteBalance * 0.02;

      quoteBalance -= this.getQuoteFee(newQuoteAmount);
      newState.quoteAmount =
        newQuoteAmount > quoteBalance ? quoteBalance : newQuoteAmount;
      newState.baseAmount = newState.quoteAmount / this.currentPrice();
    } else {
      // for sell order we cant exceed the baseBalance
      let baseBalance = this.getBaseBalance();
      const newBaseAmount = Number(this.state.baseAmount) + baseBalance * 0.02;

      baseBalance -= this.getBaseFee(newBaseAmount);
      newState.baseAmount =
        newBaseAmount > baseBalance ? baseBalance : newBaseAmount;
      newState.quoteAmount = newState.baseAmount * this.currentPrice();
    }

    newState.quoteChanged = false;
    newState.baseChanged = false;
    this.setState(newState);
  }

  decreaseAmount(e) {
    e.preventDefault();
    const newState = { ...this.state };
    if (this.props.side === "b") {
      // for buy order we cant exceed the quoteBalance
      let quoteBalance = this.getQuoteBalance();
      const newQuoteAmount =
        Number(this.state.quoteAmount) - quoteBalance * 0.02;
      newState.quoteAmount = newQuoteAmount < 0 ? 0 : newQuoteAmount;
      newState.baseAmount = newState.quoteAmount / this.currentPrice();
    } else {
      // for sell order we cant exceed the baseBalance
      let baseBalance = this.getBaseBalance();
      const newBaseAmount = Number(this.state.baseAmount) - baseBalance * 0.02;
      newState.baseAmount = newBaseAmount < 0 ? 0 : newBaseAmount;
      newState.quoteAmount = newState.baseAmount * this.currentPrice();
    }

    newState.quoteChanged = false;
    newState.baseChanged = false;
    this.setState(newState);
  }

  getBaseBalance() {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;
    if (
      !this.props.balances?.[marketInfo.zigzagChainId]?.[
        marketInfo.baseAsset.symbol
      ]?.valueReadable
    )
      return 0;
    let totalBalance =
      this.props.balances[marketInfo.zigzagChainId][marketInfo.baseAsset.symbol]
        .valueReadable;
    if (!this.props.userOrders) return totalBalance;

    Object.keys(this.props.userOrders).forEach((orderId) => {
      const order = this.props.userOrders[orderId];
      if (["c", "e", "r", "f"].includes(order[9])) return;
      if (
        (order[3] === "s" &&
          order[2].split("-")[0] === marketInfo.baseAsset.symbol) ||
        (order[3] === "b" &&
          order[2].split("-")[1] === marketInfo.baseAsset.symbol)
      ) {
        totalBalance -= order[10];
      }
    });

    return Number(totalBalance);
  }

  getQuoteBalance() {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;
    if (
      !this.props.balances?.[marketInfo.zigzagChainId]?.[
        marketInfo.quoteAsset.symbol
      ]?.valueReadable
    )
      return 0;
    let totalBalance =
      this.props.balances[marketInfo.zigzagChainId][
        marketInfo.quoteAsset.symbol
      ].valueReadable;
    if (!this.props.userOrders) return totalBalance;

    Object.keys(this.props.userOrders).forEach((orderId) => {
      const order = this.props.userOrders[orderId];
      if (["c", "e", "r", "f"].includes(order[9])) return;
      if (
        (order[3] === "b" &&
          order[2].split("-")[1] === marketInfo.quoteAsset.symbol) ||
        (order[3] === "s" &&
          order[2].split("-")[0] === marketInfo.quoteAsset.symbol)
      ) {
        totalBalance -= order[4] * order[10];
      }
    });

    return Number(totalBalance);
  }

  getBaseAllowance() {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;
    if (
      !this.props.balances?.[marketInfo.zigzagChainId]?.[
        marketInfo.baseAsset.symbol
      ]?.allowanceReadable
    )
      return 0;
    return Number(
      this.props.balances[marketInfo.zigzagChainId][marketInfo.baseAsset.symbol]
        .allowanceReadable
    );
  }

  getQuoteAllowance() {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;
    if (
      !this.props.balances?.[marketInfo.zigzagChainId]?.[
        marketInfo.quoteAsset.symbol
      ]?.allowanceReadable
    )
      return 0;
    return Number(
      this.props.balances[marketInfo.zigzagChainId][
        marketInfo.quoteAsset.symbol
      ].allowanceReadable
    );
  }

  getBaseFee(amount) {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;
    let fee = marketInfo.baseFee;
    fee +=
      marketInfo.makerVolumeFee && amount
        ? amount * marketInfo.makerVolumeFee
        : 0;
    return fee;
  }

  getQuoteFee(amount) {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;
    let fee = marketInfo.quoteFee;
    fee +=
      marketInfo.makerVolumeFee && amount
        ? amount * marketInfo.makerVolumeFee
        : 0;
    return fee;
  }

  /*
   * zkSync does not allow partial fills, so the ladder price is the first
   * liquidity that can fill the order size.
   */
  getLadderPriceZkSync_v1() {
    let baseAmount = this.state.baseAmount;
    const side = this.props.side;

    if (!baseAmount) baseAmount = 0;

    let price;
    if (side === "b") {
      const asks = this.props.liquidity.filter((l) => l[0] === "s");
      asks.sort((a, b) => a[1] - b[1]);

      for (let i = 0; i < asks.length; i++) {
        if (asks[i][2] >= baseAmount || i === asks.length - 1) {
          price = asks[i][1];
          break;
        }
      }
    } else if (side === "s") {
      const bids = this.props.liquidity.filter((l) => l[0] === "b");
      bids.sort((a, b) => b[1] - a[1]);

      for (let i = 0; i < bids.length; i++) {
        if (bids[i][2] >= baseAmount || i === bids.length - 1) {
          price = bids[i][1];
          break;
        }
      }
    }
    if (!price) return 0;
    return price;
  }

  getLadderPrice() {
    let baseAmount = Number(this.state.baseAmount);
    const side = this.props.side;
    if (!baseAmount) baseAmount = 0;

    let price;
    let unfilled = baseAmount;
    if (side === "b" && this.props.askBins) {
      for (let i = this.props.askBins.length - 1; i >= 0; i--) {
        const amount = Number(this.props.askBins[i].td2);
        if (amount >= unfilled || i === 0) {
          price = this.props.askBins[i].td1;
          break;
        } else {
          unfilled -= amount;
        }
      }
    } else if (side === "s" && this.props.bidBins) {
      for (let i = 0; i < this.props.bidBins.length; i++) {
        const amount = Number(this.props.bidBins[i].td2);
        if (amount >= unfilled || i < this.props.bidBins.length) {
          price = this.props.bidBins[i].td1;
          break;
        } else {
          unfilled -= amount;
        }
      }
    }
    if (!price) return 0;
    return price;
  }

  async approveHandler(e) {
    e.preventDefault();
    if (!api.isEVMChain) {
      console.error("Approve only on EVM chains");
      return;
    }

    const marketInfo = this.props.marketInfo;
    const token =
      this.props.side === "s"
        ? marketInfo.baseAsset.symbol
        : marketInfo.quoteAsset.symbol;

    let newstate = { ...this.state };
    this.setState(newstate);
    let orderApproveToast = toast.info(
      "Approve pending. Confirm or Reject to continue...",
      {
        toastId: "Approve pending. Confirm or Reject to continue...",
        autoClose: false,
      }
    );

    let success = false;
    try {
      success = await api.approveExchangeContract(
        token,
        0 // amount = 0 ==> MAX_ALLOWANCE
      );
    } catch (e) {
      console.log(e);
      toast.error(e.message);
    }

    toast.dismiss(orderApproveToast);
    if (success) {
      toast.success(`${token} approved.`, {
        toastId: `${token} approved.`,
      });
    }
    newstate = { ...this.state };
    this.setState(newstate);
  }

  async buySellHandler(e) {
    e.preventDefault();
    if (!this.state.quoteAmount || !this.state.baseAmount) {
      toast.error("No amount available", {
        toastId: "No amount available",
      });
      return;
    }

    let price = this.currentPrice();
    if (!price) {
      toast.error("No price available", {
        toastId: "No price available",
      });
      return;
    }

    price = Number(price);
    if (price < 0) {
      toast.error(`Price (${price}) can't be below 0`, {
        toastId: `Price (${price}) can't be below 0`,
      });
      return;
    }

    if (this.props.activeOrderCount > 0 && api.isZksyncChain()) {
      toast.error("Only one active order permitted at a time", {
        toastId: "Only one active order permitted at a time",
      });
      return;
    }
    let baseBalance, quoteBalance, baseAllowance, quoteAllowance;
    if (this.props.user.id) {
      baseBalance = this.getBaseBalance();
      quoteBalance = this.getQuoteBalance();
      baseAllowance = this.getBaseAllowance();
      quoteAllowance = this.getQuoteAllowance();
    } else {
      baseBalance = 0;
      quoteBalance = 0;
      baseAllowance = 0;
      quoteAllowance = 0;
    }

    const marketInfo = this.props.marketInfo;
    baseBalance = parseFloat(baseBalance);
    quoteBalance = parseFloat(quoteBalance);
    if (this.props.side === "s") {
      if (isNaN(baseBalance)) {
        toast.error(`No ${marketInfo.baseAsset.symbol} balance`, {
          toastId: `No ${marketInfo.baseAsset.symbol} balance`,
        });
        return;
      }

      if (this.state.baseAmount > baseBalance) {
        toast.error(`Amount exceeds ${marketInfo.baseAsset.symbol} balance`, {
          toastId: `Amount exceeds ${marketInfo.baseAsset.symbol} balance`,
        });
        return;
      }

      let fee = this.getBaseFee(this.state.baseAmount);
      if (this.state.baseAmount < fee) {
        fee = Number(fee).toPrecision(5);
        toast.error(
          `Minimum order size is ${fee} ${marketInfo.baseAsset.symbol}`
        );
        return;
      }

      if (this.state.baseAmount > baseAllowance) {
        toast.error(`Amount exceeds ${marketInfo.baseAsset.symbol} allowance`, {
          toastId: `Amount exceeds ${marketInfo.baseAsset.symbol} allowance`,
        });
        return;
      }
    } else if (this.props.side === "b") {
      if (isNaN(quoteBalance)) {
        toast.error(`No ${marketInfo.quoteAsset.symbol} balance`, {
          toastId: `No ${marketInfo.quoteAsset.symbol} balance`,
        });
        return;
      }

      if (this.state.quoteAmount > quoteBalance) {
        toast.error(`Amount exceeds ${marketInfo.quoteAsset.symbol} balance`, {
          toastId: `Amount exceeds ${marketInfo.quoteAsset.symbol} balance`,
        });
        return;
      }

      let fee = this.getQuoteFee(this.state.quoteAmount);
      if (this.state.quoteAmount < fee) {
        fee = Number(fee).toPrecision(5);
        toast.error(
          `Minimum order size is ${fee} ${marketInfo.quoteAsset.symbol}`,
          {
            toastId: `Minimum order size is ${fee} ${marketInfo.quoteAsset.symbol}`,
          }
        );
        return;
      }

      if (this.state.quoteAmount > quoteAllowance) {
        toast.error(`Total exceeds ${marketInfo.quoteAsset.symbol} allowance`, {
          toastId: `Total exceeds ${marketInfo.quoteAsset.symbol} allowance`,
        });
        return;
      }
    }

    this.handleOrder();
  }

  async handleOrder() {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return;
    let baseAmount = this.state.baseAmount;
    let quoteAmount = this.state.quoteAmount;
    // show msg with no fee
    let fairPrice;
    if (api.isZksyncChain()) {
      fairPrice = this.getLadderPriceZkSync_v1();
    } else {
      fairPrice = this.getLadderPrice();
    }
    let price = quoteAmount / baseAmount;

    const delta =
      this.props.side === "b"
        ? ((price - fairPrice) / fairPrice) * 100
        : ((fairPrice - price) / fairPrice) * 100;
    if (
      (delta > 10 &&
        this.props.orderType === "limit" &&
        !this.props.settings.disableSlippageWarning) ||
      (delta > 2 &&
        this.props.orderType === "market" &&
        !this.props.settings.disableSlippageWarning)
    ) {
      if (!this.props.confirmed) {
        this.props.setHighSlippageModal({
          xToken: parseFloat(baseAmount).toPrecision(4),
          yToken: parseFloat(quoteAmount).toPrecision(4),
          userPrice: price,
          pairPrice: fairPrice,
          type: this.props.side === "b" ? "buy" : "sell",
          open: true,
          delta: delta,
        });
        return;
      }
    }
    const renderGuidContent = () => {
      return (
        <div>
          <p style={{ fontSize: "14px", lineHeight: "24px" }}>
            {this.props.side === "s" ? "Sell" : "Buy"} Order pending
          </p>
          <p style={{ fontSize: "14px", lineHeight: "24px" }}>
            {addComma(formatPrice(baseAmount))} {marketInfo.baseAsset.symbol} @{" "}
            {addComma(formatPrice(price))} {marketInfo.quoteAsset.symbol}
          </p>
          <p style={{ fontSize: "14px", lineHeight: "24px" }}>
            Transaction fee:{" "}
            {this.props.side === "s"
              ? `${addComma(formatPrice(marketInfo.baseFee))} ${
                  marketInfo.baseAsset.symbol
                }`
              : `${addComma(formatPrice(marketInfo.quoteFee))} ${
                  marketInfo.quoteAsset.symbol
                }`}
          </p>
          <p style={{ fontSize: "14px", lineHeight: "24px" }}>
            Sign or Cancel to continue...
          </p>
        </div>
      );
    };

    let newstate = { ...this.state };
    this.setState(newstate);
    let orderPendingToast;
    if (!this.props.settings.disableOrderNotification) {
      orderPendingToast = toast.info(renderGuidContent(), {
        toastId: "Order pending",
        autoClose: false,
      });
    }

    try {
      await api.submitOrder(
        this.props.currentMarket,
        this.props.side,
        baseAmount,
        quoteAmount,
        this.props.orderType
      );

      if (!this.props.settings.disableOrderNotification) {
        toast.info("Order placed", {
          toastId: "Order placed.",
        });
      }
    } catch (e) {
      console.log(e);
      toast.error(`Error submitting the order: ${e.message}`, {
        autoClose: 20000,
        toastId: "submitOrder",
      });
    }

    if (!this.props.settings.disableOrderNotification) {
      toast.dismiss(orderPendingToast);
    }

    newstate = { ...this.state };
    this.setState(newstate);
  }

  currentPrice() {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;

    if (this.props.orderType === "limit" && this.state.price) {
      return this.state.price;
    } else {
      let price;
      if (api.isZksyncChain()) {
        price = this.getLadderPriceZkSync_v1();
      } else {
        price = this.getLadderPrice();
      }
      price *= this.props.side === "b" ? 1 + 0.0015 : 1 - 0.0015;

      return price;
    }
  }

  rangeSliderHandler(e, val) {
    const marketInfo = this.props.marketInfo;

    if (!marketInfo) return 0;
    if (!this.props.user.id) return false;

    const newstate = { ...this.state };
    if (val > 99.9) {
      newstate.maxSizeSelected = true;
    } else {
      newstate.maxSizeSelected = false;
    }
    if (this.props.side === "s") {
      let baseBalance = this.getBaseBalance();
      baseBalance -= this.getBaseFee(newstate.baseAmount);
      let amount = (baseBalance * val) / 100;
      if (baseBalance < 0) {
        newstate.baseAmount = "";
        newstate.quoteAmount = "";
      } else {
        newstate.baseAmount = amount > baseBalance ? baseBalance : amount;
        newstate.quoteAmount = newstate.baseAmount * this.currentPrice();
      }
    } else if (this.props.side === "b") {
      let quoteBalance = this.getQuoteBalance();
      quoteBalance -= this.getQuoteFee(newstate.quoteAmount);
      let amount = (quoteBalance * val) / 100;
      if (quoteBalance < 0) {
        newstate.baseAmount = "";
        newstate.quoteAmount = "";
      } else {
        newstate.quoteAmount = amount > quoteBalance ? quoteBalance : amount;
        newstate.baseAmount = newstate.quoteAmount / this.currentPrice();
      }
    }
    if (newstate.quoteAmount === 0) newstate.quoteAmount = "";
    if (newstate.baseAmount === 0) newstate.baseAmount = "";
    newstate.baseChanged = false;
    newstate.quoteChanged = false;
    this.setState(newstate);
  }

  componentDidMount() {
    this.props.setHighSlippageModal({ marketInfo: this.props.currentMarket });
  }

  componentDidUpdate(prevProps, prevState) {
    // Prevents bug where price volatility can cause buy amount to be too large
    // by refreshing a maxed out buy amount to match the new price
    if (this.props.confirmed) {
      this.handleOrder();
      this.props.setHighSlippageModal({ confirmed: false });
    }

    if (
      this.props.lastPrice !== prevProps.lastPrice &&
      this.state.maxSizeSelected
    ) {
      this.rangeSliderHandler(null, 100);
    }

    if (
      this.props.orderType !== prevProps.orderType ||
      this.props.side !== prevProps.side
    ) {
      const newState = {
        ...this.state,
        baseAmount: "",
        quoteAmount: "",
        price: formatPrice(this.props.lastPrice),
      };
      this.setState(newState);
    }

    if (this.props.currentMarket !== prevProps.currentMarket) {
      const newState = { ...this.state };
      newState.price = "";
      newState.baseAmount = "";
      newState.quoteAmount = "";
      newState.baseChanged = false;
      newState.quoteChanged = false;
      newState.updatePrice = true;
      this.setState(newState);
    }
    if (this.state.updatePrice || (!this.state.price && this.props.lastPrice)) {
      this.setState({
        price: formatPrice(this.props.lastPrice),
        updatePrice: false,
      });
    }
  }

  showLabel() {
    if (this.props.network === 42161) {
      const marketInfo = this.props.marketInfo;
      let gasFee,
        feeToken,
        gasFeeUsdValue,
        makerFee,
        takerFee,
        makerFeeUsdValue,
        takerFeeUsdValue;
      if (marketInfo) {
        gasFee =
          this.props.side === "b" ? marketInfo.quoteFee : marketInfo.baseFee;
        gasFee = formatToken(gasFee);
        feeToken =
          this.props.side === "b"
            ? marketInfo.quoteAsset.symbol
            : marketInfo.baseAsset.symbol;
        const amount =
          this.state.side === "b"
            ? this.state.quoteAmount
            : this.state.baseAmount;
        if (amount && !Number.isNaN(amount)) {
          makerFee = amount * marketInfo.makerVolumeFee;
          takerFee = amount * marketInfo.takerVolumeFee;
        } else {
          makerFee = 0;
          takerFee = 0;
        }

        const usdPrice =
          this.props.side === "b"
            ? marketInfo.quoteAsset.usdPrice
            : marketInfo.baseAsset.usdPrice;
        gasFeeUsdValue = (gasFee * usdPrice).toFixed(2);
        makerFeeUsdValue = (makerFee * usdPrice).toFixed(2);
        takerFeeUsdValue = (takerFee * usdPrice).toFixed(2);
      }

      return (
        <div>
          <p className="font-sans text-sm">
            Arbitrum's network swap fees are dynamic and
          </p>
          <p className="font-sans text-sm">
            covered by the ZigZag operator, but paid by the taker.
          </p>
          {marketInfo && (
            <div>
              <p className="font-sans text-s">
                <hr></hr>
              </p>
              <p className="font-sans text-sm">Breakdown:</p>
              <p className="font-sans text-sm">{`Gas fee: ${gasFee} ${feeToken} - (~$ ${gasFeeUsdValue})`}</p>
              <p className="font-sans text-sm">{`Maker fee (${
                marketInfo.makerVolumeFee * 100
              } %): ${makerFee} ${feeToken} - (~$ ${makerFeeUsdValue})`}</p>
              <p className="font-sans text-sm">{`Taker fee (${
                marketInfo.takerVolumeFee * 100
              } %): ${takerFee} ${feeToken} - (~$ ${takerFeeUsdValue})`}</p>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div>
          <p>zkSync's network swap fees are dynamic and sit around ~$0.10</p>
          <p>covered by the market maker, but paid by the trader</p>
        </div>
      );
    }
  }

  render() {
    const isMobile = window.innerWidth < 430;
    const marketInfo = this.props.marketInfo;
    let baseAmount, quoteAmount;
    if (typeof this.state.baseAmount === "string") {
      baseAmount = parseFloat(this.state.baseAmount.replace(",", "."));
    } else {
      baseAmount = this.state.baseAmount;
    }
    if (typeof this.state.quoteAmount === "string") {
      quoteAmount = parseFloat(this.state.quoteAmount.replace(",", "."));
    } else {
      quoteAmount = this.state.quoteAmount;
    }

    let price = this.currentPrice();
    if (price === 0) price = "";

    let baseBalance, quoteBalance, baseAllowance, quoteAllowance;
    if (this.props.user.id) {
      baseBalance = this.getBaseBalance();
      quoteBalance = this.getQuoteBalance();
      baseAllowance = this.getBaseAllowance();
      quoteAllowance = this.getQuoteAllowance();
    } else {
      baseBalance = 0;
      quoteBalance = 0;
      baseAllowance = 0;
      quoteAllowance = 0;
    }
    if (
      isNaN(baseBalance) ||
      (marketInfo?.baseFee && baseBalance < marketInfo.baseFee)
    ) {
      // hide small balances
      baseBalance = 0;
    }
    if (
      isNaN(quoteBalance) ||
      (marketInfo?.quoteFee && quoteBalance < marketInfo.quoteFee)
    ) {
      // hide small balances
      quoteBalance = 0;
    }

    const quoteBalanceHtml = (
      <Text
        font="primaryExtraSmallSemiBold"
        color="foregroundMediumEmphasis"
        textAlign="right"
      >
        {marketInfo &&
          addComma(
            formatToken(
              quoteBalance,
              marketInfo && marketInfo.quoteAsset?.symbol
            )
          )}{" "}
        {marketInfo && marketInfo.quoteAsset?.symbol}
      </Text>
    );
    const baseBalanceHtml = (
      <Text
        font="primaryExtraSmallSemiBold"
        color="foregroundMediumEmphasis"
        textAlign="right"
      >
        {marketInfo &&
          addComma(
            formatToken(baseBalance, marketInfo && marketInfo.baseAsset?.symbol)
          )}{" "}
        {marketInfo && marketInfo.baseAsset?.symbol}
      </Text>
    );

    let buttonText,
      feeAmount,
      buttonType,
      approveNeeded = false;
    if (this.props.side === "b") {
      buttonType = "BUY";
      if (quoteAmount <= quoteBalance && quoteAmount > quoteAllowance) {
        buttonText = `Approve ${marketInfo && marketInfo.quoteAsset?.symbol}`;
        if (api.isEVMChain) approveNeeded = true;
      } else {
        buttonText = `BUY ${marketInfo && marketInfo.baseAsset?.symbol}`;
      }
      feeAmount = (
        <FormHeader>
          <InfoWrapper>
            <Text font="primaryTiny" color="foregroundMediumEmphasis">
              Network fee
            </Text>
            <QuestionHelper text={this.showLabel()} />
          </InfoWrapper>
          <Text
            font="primaryExtraSmallSemiBold"
            color="foregroundMediumEmphasis"
          >
            {marketInfo &&
              `${formatToken(
                Number(this.getQuoteFee(quoteAmount)),
                marketInfo && marketInfo.quoteAsset.symbol
              )} ${marketInfo && marketInfo.quoteAsset.symbol}`}
            {marketInfo?.quoteAsset?.usdPrice &&
              ` (~$${(
                this.getQuoteFee(quoteAmount) * marketInfo.quoteAsset.usdPrice
              ).toFixed(2)})`}
          </Text>
        </FormHeader>
      );
    } else if (this.props.side === "s") {
      buttonType = "SELL";
      if (baseAmount <= baseBalance && baseAmount > baseAllowance) {
        buttonText = `Approve ${marketInfo && marketInfo.baseAsset?.symbol}`;
        if (api.isEVMChain) approveNeeded = true;
      } else {
        buttonText = `SELL ${marketInfo && marketInfo.baseAsset?.symbol}`;
      }
      feeAmount = (
        <FormHeader>
          <InfoWrapper>
            <Text font="primaryTiny" color="foregroundMediumEmphasis">
              Network fee
            </Text>
            <QuestionHelper text={this.showLabel()} />
          </InfoWrapper>
          <Text
            font="primaryExtraSmallSemiBold"
            color="foregroundMediumEmphasis"
          >
            {marketInfo &&
              `${formatToken(
                Number(this.getBaseFee(baseAmount)),
                marketInfo && marketInfo.baseAsset.symbol
              )} ${marketInfo && marketInfo.baseAsset.symbol}`}
            {marketInfo?.baseAsset?.usdPrice &&
              ` (~$${(
                this.getBaseFee(baseAmount) * marketInfo.baseAsset.usdPrice
              ).toFixed(2)})`}
          </Text>
        </FormHeader>
      );
    }

    const exchangePercentage = this.getExchangePercentage(
      baseAmount,
      quoteAmount
    );
    this.state.maxSizeSelected = exchangePercentage === 100;
    const showAmountPlusBox =
      !this.props.user.id ||
      exchangePercentage >= 100 ||
      (marketInfo &&
        this.props.side === "s" &&
        baseBalance < marketInfo.baseFee) ||
      (marketInfo &&
        this.props.side === "b" &&
        quoteBalance < marketInfo.quoteFee);
    const showMinusBox =
      !this.props.user.id ||
      this.state.baseAmount === "" ||
      this.state.baseAmount <= 0;

    return (
      <>
        <StyledForm isMobile={isMobile}>
          <InputBox>
            {this.props.orderType !== "market" && (
              <IconButton
                variant="secondary"
                startIcon={<MinusIcon />}
                onClick={this.decreasePrice.bind(this)}
                show={!this.props.user.id}
                disabled={!this.props.user.id}
              ></IconButton>
            )}
            {this.currentPrice() !== 0 && (
              <InputField
                type="text"
                pattern="\d+(?:[.,]\d+)?"
                placeholder={`Price (${
                  marketInfo && marketInfo.baseAsset?.symbol
                }-${marketInfo && marketInfo.quoteAsset?.symbol})`}
                value={
                  this.props.orderType === "limit"
                    ? this.state.price
                    : addComma(formatPrice(this.currentPrice()))
                }
                onChange={this.updatePrice.bind(this)}
                disabled={this.props.orderType === "market"}
              />
            )}
            {this.props.orderType !== "market" && (
              <IconButton
                variant="secondary"
                startIcon={<PlusIcon />}
                onClick={this.increasePrice.bind(this)}
                show={!this.props.user.id}
                disabled={!this.props.user.id}
              ></IconButton>
            )}
          </InputBox>
          <InputBox>
            <IconButton
              variant="secondary"
              startIcon={<MinusIcon />}
              onClick={this.decreaseAmount.bind(this)}
              show={showMinusBox}
              disabled={showMinusBox}
            ></IconButton>
            <InputField
              type="text"
              pattern="\d+(?:[.,]\d+)?"
              placeholder={`Amount (${
                marketInfo && marketInfo.baseAsset.symbol
                  ? marketInfo.baseAsset.symbol
                  : ""
              })`}
              value={
                this.state.baseAmount !== ""
                  ? this.state.baseChanged
                    ? this.state.baseAmount
                    : addComma(formatPrice(this.state.baseAmount))
                  : ""
              }
              onChange={this.updateBaseAmount.bind(this)}
            />
            <IconButton
              variant="secondary"
              startIcon={<PlusIcon />}
              onClick={this.increaseAmount.bind(this)}
              show={showAmountPlusBox}
              disabled={showAmountPlusBox}
            ></IconButton>
          </InputBox>
          <FormHeader>
            <Text font="primaryTiny" color="foregroundMediumEmphasis">
              {isMobile ? "Balance" : "Available balance"}
            </Text>
            {baseBalanceHtml}
          </FormHeader>
          <InputBox>
            <IconButton
              variant="secondary"
              startIcon={<MinusIcon />}
              onClick={this.decreaseAmount.bind(this)}
              show={showMinusBox}
              disabled={showMinusBox}
            ></IconButton>
            <InputField
              type="text"
              pattern="\d+(?:[.,]\d+)?"
              placeholder={`Total (${
                marketInfo && marketInfo.quoteAsset.symbol
                  ? marketInfo.quoteAsset.symbol
                  : ""
              })`}
              value={
                this.state.quoteAmount !== ""
                  ? this.state.quoteChanged
                    ? this.state.quoteAmount
                    : addComma(formatPrice(this.state.quoteAmount))
                  : ""
              }
              onChange={this.updateQuoteAmount.bind(this)}
            />
            <IconButton
              variant="secondary"
              startIcon={<PlusIcon />}
              onClick={this.increaseAmount.bind(this)}
              show={showAmountPlusBox}
              disabled={showAmountPlusBox}
            ></IconButton>
          </InputBox>
          <FormHeader>
            <Text font="primaryTiny" color="foregroundMediumEmphasis">
              {isMobile ? "Balance" : "Available balance"}
            </Text>
            {quoteBalanceHtml}
          </FormHeader>
          <RangeWrapper>
            <RangeSlider
              value={exchangePercentage}
              onChange={this.rangeSliderHandler.bind(this)}
              disabled={
                this.props.marketInfo &&
                ((this.props.side === "s" &&
                  baseBalance < this.props.marketInfo.baseFee) ||
                  (this.props.side === "b" &&
                    quoteBalance < this.props.marketInfo.quoteFee))
              }
            />
            <Box display="flex" alignItems="center" ml="20px">
              <CustomInput
                value={exchangePercentage}
                onChange={(e) => {
                  let val = Number(e.target.value) ? Number(e.target.value) : 0;
                  if (val > 100) val = 100;
                  this.rangeSliderHandler(null, val);
                }}
              />
              <Box ml="5px">%</Box>
            </Box>
          </RangeWrapper>
          {this.props.user.id ? (
            <div className="">
              <Button
                variant={buttonType.toLowerCase()}
                width="100%"
                scale="imd"
                disabled={
                  !approveNeeded &&
                  (this.isInvalidNumber(this.state.quoteAmount) ||
                    this.isInvalidNumber(this.state.baseAmount) ||
                    this.isInvalidNumber(this.currentPrice()) ||
                    (this.state.quoteAmount > this.getQuoteBalance() &&
                      this.props.side === "b") ||
                    (this.state.baseAmount > this.getBaseBalance() &&
                      this.props.side === "s"))
                }
                onClick={
                  approveNeeded
                    ? this.approveHandler.bind(this)
                    : this.buySellHandler.bind(this)
                }
              >
                {buttonText}
              </Button>
            </div>
          ) : (
            <ConnectWalletButton />
          )}
          {feeAmount}
        </StyledForm>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    confirmed: state.api.highSlippageModal?.confirmed,
  };
};

export default connect(mapStateToProps, { setHighSlippageModal })(SpotForm);

const StyledForm = styled.form`
  display: grid;
  grid-auto-flow: row;
  align-items: center;
  gap: ${({ isMobile }) => (isMobile ? "11px" : "10px")};
  padding: ${({ isMobile }) => (isMobile ? "0px 5px 8px 5px" : "20px")};
`;

const FormHeader = styled.div`
  width: 100%;
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: space-between;
`;

const InfoWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 7px;
`;

const InputBox = styled.div`
  margin-top: 10px;
  width: 100%;
  height: 35px;
  border-radius: 8px;
  padding: 0 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.foreground200};
  border: 1px solid ${({ theme }) => theme.colors.foreground300};

  div {
    div {
      input {
        text-align: center;
        background: transparent;
        border: unset;
        text-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);

        &::placeholder {
          color: ${({ theme }) => theme.colors.foregroundMediumEmphasis};
        }
        &:disabled {
          color: ${({ theme }) => theme.colors.foregroundDisabled};
        }
        &:focus:not(:disabled) {
          background: transparent;
          border: unset;
        }
        &:hover {
          background: transparent;
          border: unset;
        }
      }
    }
  }
`;

const RangeWrapper = styled.div`
  position: relative;
  width: 98%;
  padding-left: 10px;
  display: flex;
  align-items: center;
  .current_progress {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
  }
  .custom_range {
    &::before {
      border: 2px solid ${({ theme }) => theme.colors.foregroundLowEmphasis} !important;
      background-color: ${({ theme }) =>
        theme.colors.backgroundMediumEmphasis} !important;
    }
    &::before {
      width: 10px !important;
      height: 10px !important;
    }
  }
  .MuiSlider-rail {
    top: 50%;
    height: 6px;
    transform: translateY(-50%);
    background-color: ${({ theme }) =>
      theme.colors.foregroundLowEmphasis} !important;
  }

  .MuiSlider-track {
    top: 50%;
    height: 6px;
    transform: translateY(-50%);
  }

  .MuiSlider-thumb {
    top: 50%;
    margin: 0 !important;
    padding: 10px !important;
    transform: translate(-50%, -50%);
  }
`;

const IconButton = styled(BaseIcon)`
  width: 24px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.foreground300};
  border-radius: 4px;
  padding: 0px !important;
  svg {
    margin-right: 0px !important;
    margin-left: 0px !important;
  }
`;

const CustomInput = styled.input`
  outline: none;
  border: 1px solid #ffffff14;
  background-color: #ffffff0d;
  border-radius: 3px;
  text-align: center;
  width: 26px;
`;
