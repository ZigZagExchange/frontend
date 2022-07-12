import React from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import api from "lib/api";
import { RangeSlider, QuestionHelper } from "components";
import { formatPrice, formatToken, addComma} from "lib/utils";
import "./SpotForm.css";
import { Button, ConnectWalletButton } from "components/molecules/Button";
import InputField from "components/atoms/InputField/InputField";
import Text from "components/atoms/Text/Text";
import { IconButton as BaseIcon } from "../IconButton";
import { MinusIcon, PlusIcon } from "components/atoms/Svg";
import { setHighSlippageModal } from "lib/store/features/api/apiSlice";

const rx_live = /^\d*(?:[.,]\d*)?$/;
class SpotForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      price: props.lastPrice,
      baseAmount: "",
      quoteAmount: "",
      maxSizeSelected: false,
    };
  }

  isInvalidNumber(val) {
    if (Number.isNaN(val) || Number(val) === 0) return true;
    else return false;
  }

  updatePrice(e) {
    const newState = { ...this.state };
    newState.price = rx_live.test(e.target.value)
      ? e.target.value
      : this.state.price;
    newState.quoteAmount = newState.baseAmount * newState.price;
    newState.quoteAmount = newState.quoteAmount === 0 ? "" : newState.quoteAmount;
    this.setState(newState);
  }

  updateBaseAmount(e) {
    const newState = { ...this.state };
    newState.baseAmount = rx_live.test(e.target.value)
      ? e.target.value
      : this.state.baseAmount;
    newState.quoteAmount = newState.baseAmount * this.currentPrice();
    newState.quoteAmount = newState.quoteAmount === 0 ? "" : newState.quoteAmount;
    this.setState(newState);
  }

  updateQuoteAmount(e) {
    const newState = { ...this.state };
    newState.quoteAmount = rx_live.test(e.target.value)
      ? e.target.value
      : this.state.quoteAmount;      
    newState.baseAmount = newState.quoteAmount / this.currentPrice();
    newState.baseAmount = newState.baseAmount === 0 ? "" : newState.baseAmount;
    this.setState(newState);
  }

  increasePrice(e) {
    e.preventDefault();
    const newState = { ...this.state };
    newState.price = this.state.price * 1.001;
    if (this.props.side === 'b') {
      // for buy quoteAmount should be fixed
      newState.baseAmount = newState.quoteAmount / this.currentPrice();
      newState.baseAmount = newState.baseAmount === 0 ? "" : newState.baseAmount;
    } else {
      // for sell baseAmount should be fixed
      newState.quoteAmount = this.currentPrice() * newState.baseAmount;
      newState.quoteAmount = newState.quoteAmount === 0 ? "" : newState.quoteAmount;
    }
    
    this.setState(newState);
  }

  decreasePrice(e) {
    e.preventDefault();
    const newState = { ...this.state };
    newState.price = this.state.price * 0.999;
    newState.quoteAmount = this.currentPrice() * newState.baseAmount;
    this.setState(newState);
  }

  increaseAmount(e) {
    e.preventDefault();
    const newState = { ...this.state };
    const price = this.currentPrice();

    if (this.props.side === 'b') {
      // for buy order we cant exceed the quoteBalance
      let quoteBalance = this.getQuoteBalance();
      quoteBalance -= this.getQuoteFee(quoteBalance);
      if (quoteBalance < 0) {
        newState.baseAmount = "";
        newState.quoteAmount = "";
      } else {
        const newQuoteAmount = Number(this.state.quoteAmount) + quoteBalance * 0.02;
        newState.quoteAmount = newQuoteAmount > quoteBalance ? quoteBalance : newQuoteAmount;
        newState.baseAmount = newState.quoteAmount / price;
      }
    } else {
      // for sell order we cant exceed the baseBalance
      let baseBalance = this.getBaseBalance();
      baseBalance -= this.getBaseFee(baseBalance);
      if (baseBalance < 0) {
        newState.baseAmount = "";
        newState.quoteAmount = "";
      } else {
        const newBaseAmount = Number(this.state.baseAmount) + baseBalance * 0.02;
        newState.baseAmount = newBaseAmount > baseBalance ? baseBalance : newBaseAmount;
        newState.quoteAmount = newState.baseAmount * price;
      }
    }

    this.setState(newState);
  }

  decreaseAmount(e) {
    e.preventDefault();
    const newState = { ...this.state };
    if (this.props.side === 'b') {
      const quoteBalance = this.getQuoteBalance();
      const newAmount = Number(this.state.quoteAmount) - quoteBalance * 0.02;
      if (newAmount < this.getQuoteFee(quoteBalance)) {
        newState.quoteAmount = "";
        newState.baseAmount = "";
      } else {
        newState.quoteAmount = newAmount;
        newState.baseAmount = newAmount / this.currentPrice();
      }
    } else {
      const baseBalance = this.getBaseBalance();
      const newAmount = Number(this.state.baseAmount) - baseBalance * 0.02;
      if (newAmount < this.getBaseFee(baseBalance)) {
        newState.quoteAmount = "";
        newState.baseAmount = "";
      } else {
        newState.baseAmount = newAmount;
        newState.quoteAmount = newAmount * this.currentPrice();
      }
    }

    this.setState(newState);
  }

  getBaseBalance() {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;
    if (!this.props.balances?.[marketInfo.zigzagChainId]?.[marketInfo.baseAsset.symbol]?.valueReadable) return 0;
    let totalBalance = this.props.balances[marketInfo.zigzagChainId][marketInfo.baseAsset.symbol].valueReadable
    if (!this.props.userOrders) return totalBalance;

    Object.keys(this.props.userOrders).forEach(orderId => {
      const order = this.props.userOrders[orderId];
      const sellToken = (order[3] === 's')
        ? order[2].split('-')[0]
        : order[2].split('-')[1]
      if (sellToken === marketInfo.baseAsset.symbol) {
        totalBalance -= order[10]; // remove remaining order size
      }
    });   
    
    return Number(totalBalance);
  }

  getQuoteBalance() {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;
    if (!this.props.balances?.[marketInfo.zigzagChainId]?.[marketInfo.quoteAsset.symbol]?.valueReadable) return 0;
    let totalBalance = this.props.balances[marketInfo.zigzagChainId][marketInfo.quoteAsset.symbol].valueReadable
    if (!this.props.userOrders) return totalBalance;

    Object.keys(this.props.userOrders).forEach(orderId => {
      const order = this.props.userOrders[orderId];
      const sellToken = order[3] === 's'
        ? order[2].split('-')[0]
        : order[2].split('-')[1]
      if (sellToken === marketInfo.quoteAsset.symbol) {
        totalBalance -= order[4] * order[10]; // remove remaining order size
      }
    });

    return Number(totalBalance);
  }

  getBaseAllowance() {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;
    if (!this.props.balances?.[marketInfo.zigzagChainId]?.[marketInfo.baseAsset.symbol]?.allowanceReadable) return 0;
    return (Number(
      this.props.balances[marketInfo.zigzagChainId][marketInfo.baseAsset.symbol].allowanceReadable
    ));
  }

  getQuoteAllowance() {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;
    if (!this.props.balances?.[marketInfo.zigzagChainId]?.[marketInfo.quoteAsset.symbol]?.allowanceReadable) return 0;
    return (Number(
      this.props.balances[marketInfo.zigzagChainId][marketInfo.quoteAsset.symbol].allowanceReadable
    ));
  }

  getBaseFee(amount) {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;
    let fee = marketInfo.baseFee;
    fee += (marketInfo.makerVolumeFee && amount)
      ? amount * marketInfo.makerVolumeFee
      : 0;
    return fee;
  }

  getQuoteFee(amount) {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;
    let fee = marketInfo.quoteFee;
    fee += (marketInfo.makerVolumeFee && amount)
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
    const orderbookAsks = [];
    const orderbookBids = [];
    let baseAmount = this.state.baseAmount;
    const side = this.props.side;
    if (!baseAmount) baseAmount = 0;

    for (let orderid in this.props.allOrders) {
      const order = this.props.allOrders[orderid];
      const side = order[3];
      const price = order[4];
      const remaining = isNaN(Number(order[10])) ? order[5] : order[10];
      const orderStatus = order[9];

      const orderEntry = [
        price,
        remaining
      ];

      if (side === "b" && ["o", "pm", "pf"].includes(orderStatus)) {
        orderbookBids.push(orderEntry);
      } else if (side === "s" && ["o", "pm", "pf"].includes(orderStatus)) {
        orderbookAsks.push(orderEntry);
      }
    }

    let price;
    let unfilled = baseAmount;
    if (side === "b" && orderbookAsks) {
      for (let i = orderbookAsks.length - 1; i >= 0; i--) {
        if (orderbookAsks[i][1] >= unfilled || i === 0) {
          price = orderbookAsks[i][0];
          break;
        } else {
          unfilled -= orderbookAsks[i][1];
        }
      }
    } else if (side === "s" && orderbookBids) {
      for (let i = orderbookBids.length - 1; i >= 0; i--) {
        if (orderbookBids[i][1] >= unfilled ||  i === 0) {
          price = orderbookBids[i][0];
          break;
        } else {
          unfilled -= orderbookBids[i][1];
        }
      }
    }
    if (!price) return 0;
    return price;
  }

  async approveHandler(e) {
    const marketInfo = this.props.marketInfo;
    const token = (this.props.side === "s")
      ? marketInfo.baseAsset.symbol
      : marketInfo.quoteAsset.symbol;    

    let newstate = { ...this.state };
    this.setState(newstate);
    let orderApproveToast = toast.info(
      "Approve pending. Sign or Cancel to continue...", {
      toastId: "Approve pending. Sign or Cancel to continue...",
      autoClose: false,
    });

    try {
      await api.approveExchangeContract(
        token,
        0 // amount = 0 ==> MAX_ALLOWANCE
      );
    } catch (e) {
      console.log(e);
      toast.error(e.message);
    }

    toast.dismiss(orderApproveToast);
    newstate = { ...this.state };
    this.setState(newstate);
  }

  async buySellHandler(e) {
    e.preventDefault();
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

    quoteAmount = isNaN(quoteAmount) ? 0 : quoteAmount;
    baseAmount = isNaN(baseAmount) ? 0 : baseAmount;
    if (!baseAmount && !quoteAmount) {
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

      baseAmount = baseAmount ? baseAmount : quoteAmount / price;
      const fee = this.getBaseFee(baseAmount);

      if (isNaN(baseBalance)) {
        toast.error(`No ${marketInfo.baseAsset.symbol} balance`, {
          toastId: `No ${marketInfo.baseAsset.symbol} balance`,
        });
        return;
      }

      if (baseAmount && baseAmount + fee > baseBalance) {
        toast.error(`Amount exceeds ${marketInfo.baseAsset.symbol} balance`, {
          toastId: `Amount exceeds ${marketInfo.baseAsset.symbol} balance`,
        });
        return;
      }

      if (baseAmount && baseAmount < fee) {
        toast.error(
          `Minimum order size is ${fee.toPrecision(5)} ${
            marketInfo.baseAsset.symbol
          }`
        );
        return;
      }

      if (baseAmount && baseAmount > baseAllowance) {
        toast.error(`Amount exceeds ${marketInfo.baseAsset.symbol} allowance`, {
          toastId: `Amount exceeds ${marketInfo.baseAsset.symbol} allowance`,
        });
        return;
      }
    } else if (this.props.side === "b") {
      quoteAmount = quoteAmount ? quoteAmount : baseAmount * price;
      const fee = this.getQuoteFee(quoteAmount);

      if (isNaN(quoteBalance)) {
        toast.error(`No ${marketInfo.quoteAsset.symbol} balance`, {
          toastId: `No ${marketInfo.quoteAsset.symbol} balance`,
        });
        return;
      }

      if (quoteAmount && quoteAmount + fee > quoteBalance) {
        toast.error(`Amount exceeds ${marketInfo.quoteAsset.symbol} balance`, {
          toastId: `Amount exceeds ${marketInfo.quoteAsset.symbol} balance`,
        });
        return;
      }

      if (quoteAmount && quoteAmount < fee) {
        toast.error(
          `Minimum order size is ${fee.toPrecision(5)
          } ${marketInfo.quoteAsset.symbol}`, {
            toastId: `Minimum order size is ${fee.toPrecision(5)
            } ${marketInfo.quoteAsset.symbol}`,
          });
        return;
      }

      if (quoteAmount && quoteAmount > quoteAllowance) {
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
    if(!marketInfo) return;
    let baseAmount = this.state.baseAmount;
    let quoteAmount = this.state.quoteAmount;
    baseAmount = (this.props.side === 'b' && this.props.orderType === "market")
      ? baseAmount * (1 - 0.0015) // add marging
      : baseAmount;
    quoteAmount = (this.props.side === 's' && this.props.orderType === "market")
      ? quoteAmount * (1 - 0.0015) // add marging
      : quoteAmount;

    let price = quoteAmount / baseAmount;

    const delta = (this.props.side === 'b')
      ? ((price - this.props.lastPrice) / this.props.lastPrice) * 100
      : ((this.props.lastPrice - price) / this.props.lastPrice) * 100;
    if (
      (delta > 10 && this.props.orderType === "limit" && !this.props.settings.disableSlippageWarning) ||
      (delta > 2.5 && this.props.orderType === "market" && !this.props.settings.disableSlippageWarning)
    ) {
      this.props.setHighSlippageModal({
        xToken: baseAmount,
        yToken: quoteAmount,
        userPrice: price,
        pairPrice: this.props.lastPrice,
        type: this.props.side === 'b' ? 'buy' : 'sell',
        open: true,
        delta: delta 
      });
      return;
    }

    const renderGuidContent = () => {
      return (
        <div>
          <p style={{ fontSize: "14px", lineHeight: "24px" }}>
            {this.props.side === "s" ? "Sell" : "Buy"} Order pending
          </p>
          <p style={{ fontSize: "14px", lineHeight: "24px" }}>
            {addComma(formatPrice(baseAmount))} {marketInfo.baseAsset.symbol} @{" "}
            {addComma(["USDC", "USDT", "DAI", "FRAX"].includes(
              marketInfo.quoteAsset.symbol
            )
              ? parseFloat(price).toFixed(2)
              : formatPrice(price))}{" "}
            {marketInfo.quoteAsset.symbol}
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
        price,
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
      toast.error(e.message);
    }

    if (!this.props.settings.disableOrderNotification) {
      toast.dismiss(orderPendingToast);
    }

    newstate = { ...this.state };
    this.setState(newstate);
  }

  amountPercentOfMax() {
    if (!this.props.user.id) return 0;
    if (this.props.side === "s") {
      let baseBalance = this.getBaseBalance() 
      baseBalance -= this.getBaseFee(baseBalance);
      const baseAmount = this.state.baseAmount || 0;
      return Math.round((baseAmount / baseBalance) * 100);
    } else if (this.props.side === "b") {
      let quoteBalance = this.getQuoteBalance();
      quoteBalance -= this.getQuoteFee(quoteBalance);
      const quoteAmount = this.state.quoteAmount || 0;
      return Math.round((quoteAmount / quoteBalance) * 100);
    }
  }

  currentPrice() {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;

    if (this.props.orderType === "limit" && this.state.price) {
      return this.state.price;
    } else {
      if (api.isZksyncChain()) {
        return this.getLadderPriceZkSync_v1();
      } else {
        return this.getLadderPrice();
      }
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
      let amount = (baseBalance * val) / 100;
      const fee = this.getBaseFee(amount);
      amount -= fee;
      if (amount < fee) {
        newstate.baseAmount = "";
        newstate.quoteAmount = "";
      } else {
        newstate.baseAmount = amount;
        newstate.quoteAmount = amount * this.currentPrice();
      }
    } else if (this.props.side === "b") {
      let quoteBalance = this.getQuoteBalance();
      let amount = (quoteBalance * val) / 100;
      const fee = this.getQuoteFee(amount);
      amount -= fee;
      if (amount < fee) {
        newstate.quoteAmount = "";
        newstate.baseAmount = "";
      } else {
        newstate.quoteAmount = amount;
        newstate.baseAmount = amount / this.currentPrice();
      }
    }

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
      (
        this.props.lastPrice !== prevProps.lastPrice ||
        this.props.balances !== prevProps.balances
      ) && this.state.maxSizeSelected
    ) {
      this.rangeSliderHandler(null, 100);
    }

    if (this.props.orderType !== prevProps.orderType) {
      const newState = { ...this.state };
      if (this.props.side === 'b') {
        // for buy quoteAmount should be fixed
        newState.baseAmount = newState.quoteAmount / this.currentPrice();
        newState.baseAmount = newState.baseAmount === 0 ? "" : newState.baseAmount;
      } else {
        // for sell baseAmount should be fixed
        newState.quoteAmount = this.currentPrice() * newState.baseAmount;
        newState.quoteAmount = newState.quoteAmount === 0 ? "" : newState.quoteAmount;
      }
      this.setState(newState);
    }    

    if (this.props.currentMarket !== prevProps.currentMarket) {
      this.setState((state) => ({
        ...state,
        price: "",
        baseAmount: "",
        quoteAmount: "",
      }));
    }
  }

  showLabel() {    
   if(this.props.network === 42161) {
      return (
        <div>
          <p>Arbitrum's network swap fees are dynamic and sit around ~$1</p>
          <p>covered by the ZigZag operator, but paid by the taker</p>
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
    if (isNaN(baseBalance)) {
      baseBalance = 0;
    }
    if (isNaN(quoteBalance)) {
      quoteBalance = 0;
    }

    const balance1Html = (
      <Text
        font="primaryExtraSmallSemiBold"
        color="foregroundMediumEmphasis"
        textAlign="right"
      >
        {formatToken(quoteBalance, marketInfo && marketInfo.quoteAsset?.symbol)}{" "}
        {marketInfo && marketInfo.quoteAsset?.symbol}
      </Text>
    );

    const balance2Html = (
      <Text
        font="primaryExtraSmallSemiBold"
        color="foregroundMediumEmphasis"
        textAlign="right"
      >
        {formatToken(baseBalance, marketInfo && marketInfo.baseAsset?.symbol)}{" "}
        {marketInfo && marketInfo.baseAsset?.symbol}
      </Text>
    );

    let buttonText, feeAmount, buttonType, approveNeeded = false;
    if (this.props.side === "b") {
      buttonType = "BUY";
      if (quoteAmount > quoteAllowance)  {
        buttonText = `Approve ${(marketInfo && marketInfo.quoteAsset?.symbol)}`;
        approveNeeded = true;
      } else {
        buttonText = `BUY ${(marketInfo && marketInfo.baseAsset?.symbol)}`;
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
              formatToken(
                Number(this.getQuoteFee(quoteAmount)),
                marketInfo && marketInfo.quoteAsset.symbol
              )}{" "}
            {marketInfo && marketInfo.quoteAsset.symbol}
          </Text>
        </FormHeader>
      );
    } else if (this.props.side === "s") {
      buttonType = "SELL";
      if (baseAmount > baseAllowance)  {
        buttonText = `Approve ${marketInfo && marketInfo.baseAsset?.symbol}`;
        approveNeeded = true;
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
              formatToken(
                Number(this.getBaseFee(baseAmount)),
                marketInfo && marketInfo.baseAsset.symbol
              )}{" "}
            {marketInfo && marketInfo.baseAsset.symbol}
          </Text>
        </FormHeader>
      );
    }

    return (
      <>
      <StyledForm isMobile={isMobile}>
        <InputBox>
        {this.props.orderType !== "market" && <IconButton
            variant="secondary"
            startIcon={<MinusIcon />}
            onClick={this.decreasePrice.bind(this)}
          ></IconButton>}
          <InputField
            type="text"
            pattern="\d+(?:[.,]\d+)?"
            placeholder={`Price (${
              marketInfo && marketInfo.quoteAsset?.symbol
            }-${
              marketInfo && marketInfo.baseAsset?.symbol
            })`}
            value={this.currentPrice() !== ""
            ? ['.',',','0'].includes(this.currentPrice().toString().at(-1)) 
              ? this.currentPrice()
              : addComma(formatPrice(this.currentPrice()))
            : ""
          }
            onChange={this.updatePrice.bind(this)}
            disabled={this.props.orderType === "market"}
          />
          {this.props.orderType !== "market" && <IconButton
            variant="secondary"
            startIcon={<PlusIcon />}
            onClick={this.increasePrice.bind(this)}
          ></IconButton>}
        </InputBox>
        <InputBox>
          <IconButton
            variant="secondary"
            startIcon={<MinusIcon />}
            onClick={this.decreaseAmount.bind(this)}
          ></IconButton>
          <InputField
            type="text"
            pattern="\d+(?:[.,]\d+)?"
            placeholder={`Amount (${
              marketInfo && marketInfo.baseAsset?.symbol
            })`}
            value={this.state.baseAmount !== ""
              ? ['.',',','0'].includes(this.state.baseAmount.toString().at(-1)) 
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
          ></IconButton>
        </InputBox>
        <FormHeader>
          <Text font="primaryTiny" color="foregroundMediumEmphasis">
            Available balance
          </Text>
          {balance2Html}
        </FormHeader>
        <InputBox>
          <IconButton
            variant="secondary"
            startIcon={<MinusIcon />}
            onClick={this.decreaseAmount.bind(this)}
          ></IconButton>
          <InputField
            type="text"
            pattern="\d+(?:[.,]\d+)?"
            placeholder={`Total (${
              marketInfo && marketInfo.quoteAsset?.symbol
            })`}
            value={this.state.quoteAmount !== ""
              ? ['.',',','0'].includes(this.state.quoteAmount.toString().at(-1)) 
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
          ></IconButton>
        </InputBox>
        <FormHeader>
          <Text font="primaryTiny" color="foregroundMediumEmphasis">
            Available balance
          </Text>
          {balance1Html}
        </FormHeader>
        <RangeWrapper>
          <RangeSlider
            value={this.amountPercentOfMax()}
            onChange={this.rangeSliderHandler.bind(this)}
          />
        </RangeWrapper>
          {this.props.user.id ? (
            <div className="">
              <Button
                variant={buttonType.toLowerCase()}
                width="100%"
                scale="imd"
                disabled={
                  this.isInvalidNumber(this.state.quoteAmount) ||
                  this.isInvalidNumber(this.state.baseAmount) ||
                  this.isInvalidNumber(this.currentPrice())
                }
                onClick={approveNeeded ? this.approveHandler.bind(this) : this.buySellHandler.bind(this)}
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
  gap: ${({ isMobile }) => (isMobile ? "11px" : "5px")};
  padding: ${({ isMobile }) =>
    isMobile ? "0px 5px 8px 5px" : "0px 20px 20px 20px"};
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
  width: 98%;
  padding-left: 10px;

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
