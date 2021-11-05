import React from "react";
import { toast } from "react-toastify";
// css
import "./SpotForm.css";
// components
import RangeSlider from "../RangeSlider/RangeSlider";
import Button from "../Button/Button";
import darkPlugHead from "../../assets/icons/dark-plug-head.png";
//helpers
import { submitorder } from "../../helpers";

class SpotForm extends React.Component {
  constructor(props) {
      super(props);
      this.state = { userHasEditedPrice: false, price: null, amount: "" }
  }

  updatePrice(e) {
    const newState = { ...this.state }
    newState.price = e.target.value;
    newState.userHasEditedPrice = true;
    this.setState(newState);
  }

  updateAmount(e) {
    const newState = { ...this.state }
    newState.amount = e.target.value;
    this.setState(newState);
  }

  async buySellHandler(e) {
    let baseBalance, quoteBalance;
    if (this.props.user.address) {
      baseBalance = this.props.user.committed.balances.ETH / Math.pow(10, 18);
      quoteBalance = this.props.user.committed.balances.USDT / Math.pow(10, 6);
    } else {
      baseBalance = "-";
      quoteBalance = "-";
    }
    const price = this.currentPrice();

    if (this.props.side === 's' && typeof baseBalance === "number" && this.state.amount > baseBalance) {
        toast.error("Amount exceeds ETH balance");
        return
    }
    else if (this.props.side === 'b' && typeof quoteBalance === "number" && this.state.amount*price > quoteBalance) {
        toast.error("Total exceeds USDT balance");
        return
    }

    try {
      await submitorder(this.props.chainId, "ETH-USDT", this.props.side, price, this.state.amount);
    } catch (e) {
      console.log(e);
      toast.error(e.message);
    }
  }

  priceIsDisabled() {
      return this.props.orderType === "market";
  }

  amountPercentOfMax() {
      if (!this.props.user.address) return 0;

      if (this.props.side === 's') {
          const baseBalance = this.props.user.committed.balances.ETH / Math.pow(10, 18);
          const amount = this.state.amount || 0;
          return Math.round(amount / baseBalance * 100)
      }
      else if (this.props.side === 'b') {
          const quoteBalance = this.props.user.committed.balances.USDT / Math.pow(10, 6);
          const amount = this.state.amount || 0;
          const total = amount * this.currentPrice()
          return Math.round(total / quoteBalance * 100)
      }
  }

  currentPrice() {
      let price;
      if (this.state.userHasEditedPrice) {
          price = this.state.price;
      }
      else if (this.props.initPrice) {
          if (this.props.side === 'b')
              price = Math.round(this.props.initPrice*1.002);
          else if (this.props.side === 's')
              price = Math.round(this.props.initPrice*0.998);
      }
      else {
          price = 0;
      }
      return price;
  }

  rangeSliderHandler(e, val) {
      if (!this.props.user.address) return false;

      const newstate = { ...this.state }
      if (this.props.side === 's') {
          const baseBalance = this.props.user.committed.balances.ETH / Math.pow(10, 18);
          newstate.amount = parseFloat((baseBalance * val / 100).toPrecision(6))
      }
      else if (this.props.side === 'b') {
          const quoteBalance = this.props.user.committed.balances.USDT / Math.pow(10, 6);
          const quoteAmount = quoteBalance * val / 100;
          newstate.amount = parseFloat((quoteAmount / this.currentPrice()).toPrecision(6))
      }
      this.setState(newstate);
  }

  render() {
      let price = this.currentPrice();
      if (price === 0) price = "";

      let baseBalance, quoteBalance;
      if (this.props.user.address) {
        baseBalance = this.props.user.committed.balances.ETH / Math.pow(10, 18);
        quoteBalance = this.props.user.committed.balances.USDT / Math.pow(10, 6);
      } else {
        baseBalance = "-";
        quoteBalance = "-";
      }

      const balanceHtml =
        this.props.side === "b" ? (
          <strong>{quoteBalance} USDT</strong>
        ) : (
          <strong>{baseBalance} ETH</strong>
        );

      let buySellBtnClass, buttonText;
      if (this.props.side === 'b') {
          buySellBtnClass = "bg_btn buy_btn";
          buttonText = "BUY";
      }
      else if (this.props.side === 's') {
          buySellBtnClass = "bg_btn sell_btn";
          buttonText = "SELL";
      }

      return (
        <>
          <form className="spot_form">
            <div className="spf_head">
              <span>Avbl</span>
              {balanceHtml}
            </div>
            <div className="spf_input_box">
              <span className="spf_desc_text">Price</span>
              <input type="text" value={price} onChange={this.updatePrice.bind(this)} disabled={this.priceIsDisabled()}  />
              <span className={this.priceIsDisabled() ? "text-disabled" : ""}>USDT</span>
            </div>
            <div className="spf_input_box">
              <span className="spf_desc_text">Amount</span>
              <input type="text" value={this.state.amount} onChange={this.updateAmount.bind(this)}/>
              <span>ETH</span>
            </div>
            <div className="spf_range">
              <RangeSlider value={this.amountPercentOfMax()} onChange={this.rangeSliderHandler.bind(this)} />
            </div>
            {this.props.user.address ? (
              <div className="spf_btn">
                <button
                  type="button"
                  className={buySellBtnClass}
                  onClick={this.buySellHandler.bind(this)}
                >
                  {buttonText}
                </button>
              </div>
            ) : (
              <div className="spf_btn">
                <Button
                  className="bg_btn"
                  text="CONNECT WALLET"
                  img={darkPlugHead}
                  onClick={this.props.signInHandler}
                />
              </div>
            )}
          </form>
        </>
      );
  }
};

export default SpotForm;
