import React, { useRef } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import api from "lib/api";
import { RangeSlider, QuestionHelper } from "components";
import { formatPrice, formatToken } from "lib/utils";
import "./SpotForm.css";
import { Button, ConnectWalletButton } from "components/molecules/Button";
import InputField from "components/atoms/InputField/InputField";
import Text from "components/atoms/Text/Text";
import { IconButton as BaseIcon } from "../IconButton";
import { InfoIcon, MinusIcon, PlusIcon } from "components/atoms/Svg";
import { setHighSlippageModal } from "lib/store/features/api/apiSlice";

const rx_live = /^\d*(?:[.,]\d*)?$/;
class SpotForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userHasEditedPrice: false,
      price: props.lastPrice,
      baseAmount: "",
      totalAmount: "",
      quoteAmount: "",
      orderButtonDisabled: true,
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
    newState.userHasEditedPrice = true;
    newState.totalAmount =
      this.props.orderType === "limit"
        ? (newState.price * newState.baseAmount).toPrecision(6)
        : (this.props.marketSummary.price * newState.baseAmount).toPrecision(6);
    newState.orderButtonDisabled = this.isInvalidNumber(newState.totalAmount);
    this.setState(newState);
  }

  increasePrice(e) {
    e.preventDefault();
    const newState = { ...this.state };
    newState.price = (Number(this.state.price) + 1).toString();
    newState.userHasEditedPrice = true;
    newState.totalAmount =
      this.props.orderType === "limit"
        ? (this.currentPrice() * newState.baseAmount).toPrecision(6)
        : (this.props.marketSummary.price * newState.baseAmount).toPrecision(6);
    newState.orderButtonDisabled = this.isInvalidNumber(newState.totalAmount);
    this.setState(newState);
  }

  decreasePrice(e) {
    e.preventDefault();
    const newState = { ...this.state };
    newState.price =
      Number(this.state.price) - 1 < 0
        ? "0"
        : (Number(this.state.price) - 1).toString();
    newState.userHasEditedPrice = true;
    newState.totalAmount =
      this.props.orderType === "limit"
        ? (this.currentPrice() * newState.baseAmount).toPrecision(6)
        : (this.props.marketSummary.price * newState.baseAmount).toPrecision(6);
    newState.orderButtonDisabled = this.isInvalidNumber(newState.totalAmount);
    this.setState(newState);
  }

  updateAmount(e) {
    const newState = { ...this.state };

    newState.baseAmount = rx_live.test(e.target.value)
      ? e.target.value
      : this.state.baseAmount;
    newState.quoteAmount = "";
    newState.baseAmount === ""
      ? (newState.totalAmount = "")
      : (newState.totalAmount =
          this.props.orderType === "limit"
            ? (this.currentPrice() * newState.baseAmount).toPrecision(6)
            : (
                this.props.marketSummary.price * newState.baseAmount
              ).toPrecision(6));
    newState.orderButtonDisabled = this.isInvalidNumber(newState.totalAmount);
    this.setState(newState);
  }

  updateTotalAmount(e) {
    const newState = { ...this.state };

    newState.totalAmount = rx_live.test(e.target.value)
      ? e.target.value
      : this.state.totalAmount;
    newState.quoteAmount = "";
    newState.totalAmount === ""
      ? (newState.baseAmount = "")
      : (newState.baseAmount =
          this.props.orderType === "limit"
            ? (newState.totalAmount / this.currentPrice()).toPrecision(6)
            : (
                newState.totalAmount / this.props.marketSummary.price
              ).toPrecision(6));
    newState.orderButtonDisabled = this.isInvalidNumber(newState.totalAmount);
    this.setState(newState);
  }

  increaseAmount(e) {
    e.preventDefault();
    const newState = { ...this.state };
    newState.baseAmount = (Number(this.state.baseAmount) + 1).toString();
    newState.quoteAmount = "";
    newState.baseAmount === ""
      ? (newState.totalAmount = "")
      : (newState.totalAmount =
          this.props.orderType === "limit"
            ? (this.currentPrice() * newState.baseAmount).toPrecision(6)
            : (
                this.props.marketSummary.price * newState.baseAmount
              ).toPrecision(6));
    newState.orderButtonDisabled = this.isInvalidNumber(newState.totalAmount);
    this.setState(newState);
  }

  decreaseAmount(e) {
    e.preventDefault();
    const newState = { ...this.state };
    newState.baseAmount =
      Number(this.state.baseAmount) - 1 < 0
        ? "0"
        : (Number(this.state.baseAmount) - 1).toString();
    newState.quoteAmount = "";
    newState.maxSizeSelected = false;
    newState.baseAmount === ""
      ? (newState.totalAmount = "")
      : (newState.totalAmount =
          this.props.orderType === "limit"
            ? (this.currentPrice() * newState.baseAmount).toPrecision(6)
            : (
                this.props.marketSummary.price * newState.baseAmount
              ).toPrecision(6));
    newState.orderButtonDisabled = this.isInvalidNumber(newState.totalAmount);
    this.setState(newState);
  }

  getBaseBalance() {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;
    return (
      this.props.user.committed.balances[marketInfo.baseAsset.symbol] /
      Math.pow(10, marketInfo.baseAsset.decimals)
    );
  }

  getQuoteBalance() {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;
    return (
      this.props.user.committed.balances[marketInfo.quoteAsset.symbol] /
      Math.pow(10, marketInfo.quoteAsset.decimals)
    );
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
    return formatPrice(price);
  }

  //getLadderPrice() {
  //  let baseAmount = this.state.baseAmount;
  //  const side = this.props.side;
  //
  //  if (!baseAmount) baseAmount = 0;
  //
  //  let price;
  //  if (side === "b") {
  //    // get order book
  //
  //    for (let i = 0; i < asks.length; i++) {
  //      if (asks[i][2] >= baseAmount || i === asks.length - 1) {
  //        price = asks[i][1];
  //        break;
  //      }
  //    }
  //  } else if (side === "s") {
  //    // get order book
  //
  //    for (let i = 0; i < bids.length; i++) {
  //      if (bids[i][2] >= baseAmount || i === bids.length - 1) {
  //        price = bids[i][1];
  //        break;
  //      }
  //    }
  //  }
  //  if (!price) return 0;
  //  return formatPrice(price);
  //}

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
    let baseBalance, quoteBalance;
    if (this.props.user.id) {
      baseBalance = this.getBaseBalance();
      quoteBalance = this.getQuoteBalance();
    } else {
      baseBalance = 0;
      quoteBalance = 0;
    }

    const marketInfo = this.props.marketInfo;
    baseBalance = parseFloat(baseBalance);
    quoteBalance = parseFloat(quoteBalance);
    let baseAmountMsg;
    if (this.props.side === "s") {
      baseAmount = baseAmount ? baseAmount : quoteAmount / price;
      quoteAmount = 0;
      baseAmountMsg = formatPrice(baseAmount);

      if (isNaN(baseBalance)) {
        toast.error(`No ${marketInfo.baseAsset.symbol} balance`, {
          toastId: `No ${marketInfo.baseAsset.symbol} balance`,
        });
        return;
      }

      if (baseAmount && baseAmount + marketInfo.baseFee > baseBalance) {
        toast.error(`Amount exceeds ${marketInfo.baseAsset.symbol} balance`, {
          toastId: `Amount exceeds ${marketInfo.baseAsset.symbol} balance`,
        });
        return;
      }

      if (baseAmount && baseAmount < marketInfo.baseFee) {
        toast.error(
          `Minimum order size is ${marketInfo.baseFee.toPrecision(5)} ${
            marketInfo.baseAsset.symbol
          }`
        );
        return;
      }

      const askPrice = this.getFirstAsk();
      const delta = ((askPrice - price) / askPrice) * 100;
      if (
        delta > 10 &&
        this.props.orderType === "limit" &&
        !this.props.settings.disableSlippageWarning
      ) {
        this.props.setHighSlippageModal({ open: true, delta: delta });
      }
      this.props.setHighSlippageModal({ open: true, delta: delta });

      if (
        this.props.orderType === "market" &&
        !this.props.settings.disableSlippageWarning
      ) {
        price *= 0.9985;
        if (delta > 2) {
          this.props.setHighSlippageModal({ open: true, delta: delta });
        }
      }
    } else if (this.props.side === "b") {
      quoteAmount = quoteAmount ? quoteAmount : baseAmount * price;
      baseAmount = 0;
      baseAmountMsg = formatPrice(quoteAmount / price);

      if (isNaN(quoteBalance)) {
        this.props.setHighSlippageModal({ open: true, delta: delta });

        return;
      }

      if (quoteAmount && quoteAmount + marketInfo.quoteFee > quoteBalance) {
        this.props.setHighSlippageModal({ open: true, delta: delta });

        return;
      }

      if (quoteAmount && quoteAmount < marketInfo.quoteFee) {
        this.props.setHighSlippageModal({ open: true, delta: delta });

        return;
      }

      const bidPrice = this.getFirstBid();
      const delta = ((price - bidPrice) / bidPrice) * 100;

      if (
        delta > 10 &&
        this.props.orderType === "limit" &&
        !this.props.settings.disableSlippageWarning
      ) {
        this.props.setHighSlippageModal({ open: true, delta: delta });
      }

      if (
        this.props.orderType === "market" &&
        !this.props.settings.disableSlippageWarning
      ) {
        price *= 1.0015;
        if (delta > 2) {
          this.props.setHighSlippageModal({ open: true, delta: delta });
        }
      }
    }
  }

  async handleOrder() {
    let baseAmountMsg;
    let baseAmount = this.state.baseAmount;
    let quoteAmount = this.state.quoteAmount;
    let price = this.state.price;
    const marketInfo = this.props.marketInfo;
    baseAmount = baseAmount ? baseAmount : quoteAmount / price;
    quoteAmount = 0;
    baseAmountMsg = formatPrice(baseAmount);

    const renderGuidContent = () => {
      return (
        <div>
          <p style={{ fontSize: "14px", lineHeight: "24px" }}>
            {this.props.side === "s" ? "Sell" : "Buy"} Order pending
          </p>
          <p style={{ fontSize: "14px", lineHeight: "24px" }}>
            {baseAmountMsg} {marketInfo.baseAsset.symbol} @{" "}
            {["USDC", "USDT", "DAI", "FRAX"].includes(
              marketInfo.quoteAsset.symbol
            )
              ? price.toFixed(2)
              : formatPrice(price)}{" "}
            {marketInfo.quoteAsset.symbol}
          </p>
          <p style={{ fontSize: "14px", lineHeight: "24px" }}>
            Sign or Cancel to continue...
          </p>
        </div>
      );
    };

    if (this.props.confirmed) {
      let newstate = { ...this.state };
      newstate.orderButtonDisabled = true;
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
      newstate.orderButtonDisabled = false;
      this.setState(newstate);
    }
  }

  priceIsDisabled() {
    return this.props.orderType === "market";
  }

  amountPercentOfMax() {
    if (!this.props.user.id) return 0;

    const marketInfo = this.props.marketInfo;
    if (!this.props.marketInfo) return 0;

    if (this.props.side === "s") {
      const baseBalance = this.getBaseBalance() - marketInfo.baseFee;
      const baseAmount = this.state.baseAmount || 0;
      return Math.round((baseAmount / baseBalance) * 100);
    } else if (this.props.side === "b") {
      const quoteBalance = this.getQuoteBalance() - marketInfo.quoteFee;
      if (this.state.quoteAmount) {
        const quoteAmount = this.state.quoteAmount || 0;
        return Math.round((quoteAmount / quoteBalance) * 100);
      } else {
        const baseAmount = this.state.baseAmount || 0;
        const total = baseAmount * this.currentPrice();
        return Math.round((total / quoteBalance) * 100);
      }
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
        console.log("this.getLadderPrice() not implemented for not zkSync_v1");
        // return this.getLadderPrice();
      }
    }
  }

  getFirstAsk() {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;
    const asks = this.props.liquidity
      .filter((l) => l[0] === "s")
      .map((l) => l[1]);
    return formatPrice(Math.min(...asks));
  }

  getFirstBid() {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;
    const bids = this.props.liquidity
      .filter((l) => l[0] === "b")
      .map((l) => l[1]);
    return formatPrice(Math.max(...bids));
  }

  rangeSliderHandler(e, val) {
    const marketInfo = this.props.marketInfo;
    if (!marketInfo) return 0;
    if (!this.props.user.id) return false;

    const newstate = { ...this.state };
    if (val === 100) {
      newstate.maxSizeSelected = true;
      if (this.props.side === "b") {
        val = 99.9;
      }
      if (this.props.side === "s") {
        val = 99.9;
      }
    } else {
      newstate.maxSizeSelected = false;
    }
    if (this.props.side === "s") {
      const baseBalance = this.getBaseBalance();
      const decimals = marketInfo.baseAsset.decimals;
      let displayAmount = (baseBalance * val) / 100;
      displayAmount -= marketInfo.baseFee;
      displayAmount = parseFloat(displayAmount.toFixed(decimals));
      displayAmount =
        displayAmount > 9999
          ? displayAmount.toFixed(0)
          : displayAmount.toPrecision(5);

      if (displayAmount < 1e-5) {
        newstate.baseAmount = 0;
      } else {
        newstate.baseAmount = displayAmount;
      }

      newstate.baseAmount === ""
        ? (newstate.totalAmount = "")
        : (newstate.totalAmount =
            this.props.orderType === "limit"
              ? (this.currentPrice() * newstate.baseAmount).toPrecision(6)
              : (
                  this.props.marketSummary.price * newstate.baseAmount
                ).toPrecision(6));
    } else if (this.props.side === "b") {
      const quoteBalance = this.getQuoteBalance();
      const quoteDecimals = marketInfo.quoteAsset.decimals;
      const baseDecimals = marketInfo.baseAsset.decimals;
      let displayAmount = (quoteBalance * val) / 100;
      displayAmount -= marketInfo.quoteFee;
      displayAmount = parseFloat(displayAmount.toFixed(quoteDecimals));
      displayAmount =
        displayAmount > 9999
          ? displayAmount.toFixed(0)
          : displayAmount.toPrecision(5);

      if (displayAmount < 1e-5) {
        newstate.quoteAmount = 0;
      } else {
        newstate.quoteAmount = displayAmount;
        const baseDisplayAmount = parseFloat(
          (displayAmount / this.currentPrice()).toFixed(baseDecimals)
        );
        newstate.baseAmount =
          baseDisplayAmount > 9999
            ? baseDisplayAmount.toFixed(0)
            : baseDisplayAmount.toPrecision(5);
        newstate.totalAmount =
          baseDisplayAmount > 9999
            ? baseDisplayAmount.toFixed(0) * this.currentPrice()
            : baseDisplayAmount.toPrecision(5) * this.currentPrice();
      }
    }

    if (isNaN(newstate.baseAmount)) newstate.baseAmount = 0;
    if (isNaN(newstate.totalAmount)) newstate.totalAmount = 0;
    if (isNaN(newstate.quoteAmount)) newstate.quoteAmount = 0;
    newstate.orderButtonDisabled = this.isInvalidNumber(newstate.totalAmount);
    this.setState(newstate);
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
    return (
      <div>
        <p>zkSync's network swap fees are dynamic and sit around ~$0.10</p>
        <p>covered by the market maker, but paid by the trader</p>
      </div>
    );
  }

  render() {
    // const ethInput = useRef(null);
    // const usdInput = useRef(null);
    const isMobile = window.innerWidth < 430;
    const marketInfo = this.props.marketInfo;

    let price = this.currentPrice();
    if (price === 0) price = "";

    let baseBalance, quoteBalance;
    if (this.props.user.id) {
      baseBalance = this.getBaseBalance();
      quoteBalance = this.getQuoteBalance();
    } else {
      baseBalance = "-";
      quoteBalance = "-";
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
        {formatToken(baseBalance, marketInfo && marketInfo.baseAsset?.symbol)} {marketInfo && marketInfo.baseAsset?.symbol}
      </Text>
    );

    let buttonText, feeAmount, buttonType;
    if (this.props.side === "b") {
      buttonType = "BUY";
      buttonText =
        buttonType + " " + (marketInfo && marketInfo.baseAsset?.symbol);
      feeAmount = (
        <FormHeader>
          <InfoWrapper>
            <Text font="primaryTiny" color="foregroundMediumEmphasis">
              Buy Fee
            </Text>
            <QuestionHelper text={this.showLabel()} />
          </InfoWrapper>
          <Text
            font="primaryExtraSmallSemiBold"
            color="foregroundMediumEmphasis"
          >
            {marketInfo &&
              marketInfo.quoteFee &&
              formatToken(Number(marketInfo.quoteFee), marketInfo && marketInfo.quoteAsset.symbol)}{" "}
            {marketInfo && marketInfo.quoteAsset.symbol}
          </Text>
        </FormHeader>
      );
    } else if (this.props.side === "s") {
      buttonType = "SELL";
      buttonText =
        buttonType + " " + (marketInfo && marketInfo.baseAsset?.symbol);
      feeAmount = (
        <FormHeader>
          <InfoWrapper>
            <Text font="primaryTiny" color="foregroundMediumEmphasis">
              Sell Fee
            </Text>
            <QuestionHelper text={this.showLabel()} />
          </InfoWrapper>
          <Text
            font="primaryExtraSmallSemiBold"
            color="foregroundMediumEmphasis"
          >
            {marketInfo &&
              marketInfo.baseFee &&
              formatToken(Number(marketInfo.baseFee), marketInfo && marketInfo.baseAsset.symbol)}{" "}
            {marketInfo && marketInfo.baseAsset.symbol}
          </Text>
        </FormHeader>
      );
    }

    return (
      <>
        <StyledForm isMobile={isMobile}>
          <InputBox>
            <IconButton
              variant="secondary"
              startIcon={<MinusIcon />}
              disabled={this.priceIsDisabled()}
              onClick={this.decreasePrice.bind(this)}
            ></IconButton>
            <InputField
              type="text"
              pattern="\d+(?:[.,]\d+)?"
              placeholder={`Price (${
                marketInfo && marketInfo.quoteAsset?.symbol
              })`}
              value={
                this.state.userHasEditedPrice
                  ? this.state.price
                  : this.currentPrice()
              }
              onChange={this.updatePrice.bind(this)}
              disabled={this.priceIsDisabled()}
            />
            <IconButton
              variant="secondary"
              startIcon={<PlusIcon />}
              disabled={this.priceIsDisabled()}
              onClick={this.increasePrice.bind(this)}
            ></IconButton>
            {/* <span className={this.priceIsDisabled() ? "text-disabled" : ""}>
              {marketInfo && marketInfo.quoteAsset.symbol}
            </span> */}
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
              value={this.state.baseAmount}
              onChange={this.updateAmount.bind(this)}
            />
            <IconButton
              variant="secondary"
              startIcon={<PlusIcon />}
              onClick={this.increaseAmount.bind(this)}
            ></IconButton>
            {/* <span>{marketInfo && marketInfo.baseAsset.symbol}</span> */}
          </InputBox>
          <RangeWrapper>
            <RangeSlider
              value={this.amountPercentOfMax()}
              onChange={this.rangeSliderHandler.bind(this)}
            />
          </RangeWrapper>
          <FormHeader>
            <Text font="primaryTiny" color="foregroundMediumEmphasis">
              {marketInfo && marketInfo.quoteAsset?.symbol} balance
            </Text>
            {balance1Html}
          </FormHeader>
          <FormHeader>
            <Text font="primaryTiny" color="foregroundMediumEmphasis">
              {marketInfo && marketInfo.baseAsset?.symbol} balance
            </Text>
            {balance2Html}
          </FormHeader>
          <InputBox>
            {/* <IconButton variant="secondary" startIcon={<MinusIcon />}></IconButton> */}
            <InputField
              type="text"
              pattern="\d+(?:[.,]\d+)?"
              placeholder={`Total (${
                marketInfo && marketInfo.quoteAsset?.symbol
              })`}
              value={this.state.totalAmount}
              onChange={this.updateTotalAmount.bind(this)}
            />
            {/* <IconButton variant="secondary" startIcon={<PlusIcon />}></IconButton> */}
            {/* <span>{marketInfo && marketInfo.baseAsset.symbol}</span> */}
          </InputBox>
          {feeAmount}
          {this.props.user.id ? (
            <div className="">
              <Button
                variant={buttonType.toLowerCase()}
                width="100%"
                scale="imd"
                disabled={this.state.orderButtonDisabled}
                onClick={this.buySellHandler.bind(this)}
              >
                {buttonText}
              </Button>
            </div>
          ) : (
            <ConnectWalletButton />
          )}
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
