import React from 'react';
import { toast } from 'react-toastify';
import api from 'lib/api';
import { RangeSlider, Button } from 'components';
import darkPlugHead from 'assets/icons/dark-plug-head.png';
import './SpotForm.css';

export class SpotForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userHasEditedPrice: false,
            price: null,
            amount: "",
            orderButtonDisabled: false,
            maxSizeSelected: false,
        };
        this.MINIMUM_AMOUNTS = {
            ETH: 0.0002,
            WETH: 0.0001,
            USDC: 1,
            USDT: 1,
            WBTC: 0.00003,
            DAI: 1,
            FRAX: 1,
            FXS: 0.1,
        };
    }

    updatePrice(e) {
        const newState = { ...this.state };
        newState.price = e.target.value;
        newState.userHasEditedPrice = true;
        this.setState(newState);
    }

    updateAmount(e) {
        const newState = { ...this.state };
        newState.amount = e.target.value;
        this.setState(newState);
    }

    getBaseBalance() {
        const baseCurrency = this.props.currentMarket.split("-")[0];
        return (
            this.props.user.committed.balances[baseCurrency] /
            Math.pow(10, api.currencies[baseCurrency].decimals)
        );
    }

    getQuoteBalance() {
        const quoteCurrency = this.props.currentMarket.split("-")[1];
        return (
            this.props.user.committed.balances[quoteCurrency] /
            Math.pow(10, api.currencies[quoteCurrency].decimals)
        );
    }

    async buySellHandler(e) {
        let amount;
        if (typeof this.state.amount === "string") {
            amount = parseFloat(this.state.amount.replace(",", "."));
        } else {
            amount = this.state.amount;
        }
        if (isNaN(amount)) {
            toast.error("Amount is not a number");
            return;
        }
        const baseCurrency = this.props.currentMarket.split("-")[0];
        const quoteCurrency = this.props.currentMarket.split("-")[1];
        amount = parseFloat(amount.toFixed(api.currencies[baseCurrency].decimals));
        if (
            this.props.activeOrderCount > 0 &&
            api.isZksyncChain(this.props.chainId)
        ) {
            toast.error("Only one active order permitted at a time");
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
        const price = this.currentPrice();

        baseBalance = parseFloat(baseBalance);
        quoteBalance = parseFloat(quoteBalance);
        if (this.props.side === "s" && isNaN(baseBalance)) {
            toast.error(`No ${baseCurrency} balance`);
            return;
        } else if (this.props.side === "b" && isNaN(quoteBalance)) {
            toast.error(`No ${quoteCurrency} balance`);
            return;
        } else if (this.props.side === "s" && amount > baseBalance) {
            toast.error(`Amount exceeds ${baseCurrency} balance`);
            return;
        } else if (this.props.side === "b" && amount * price > quoteBalance) {
            toast.error(`Total exceeds ${quoteCurrency} balance`);
            return;
        } else if (amount < this.MINIMUM_AMOUNTS[baseCurrency]) {
            toast.error(
                `Minimum order size is ${this.MINIMUM_AMOUNTS[baseCurrency]} ${baseCurrency}`
            );
            return;
        } else if (
            isNaN(price) ||
            price > this.props.lastPrice * 1.1 ||
            price < this.props.lastPrice * 0.9
        ) {
            toast.error("Price must be within 10% of spot");
            return;
        }

        let newstate = { ...this.state };
        newstate.orderButtonDisabled = true;
        this.setState(newstate);
        let orderPendingToast;
        if (api.isZksyncChain(this.props.chainId)) {
            orderPendingToast = toast.info(
                "Order pending. Sign or Cancel to continue..."
            );
        }

        try {
            await api.submitOrder(
                this.props.currentMarket,
                this.props.side,
                price,
                amount
            );
        } catch (e) {
            console.log(e);
            toast.error(e.message);
        }

        if (api.isZksyncChain(this.props.chainId)) {
            toast.dismiss(orderPendingToast);
        }
        newstate = { ...this.state };
        newstate.orderButtonDisabled = false;
        this.setState(newstate);
    }

    priceIsDisabled() {
        return this.props.orderType === "market";
    }

    amountPercentOfMax() {
        if (!this.props.user.id) return 0;

        const baseCurrency = this.props.currentMarket.split("-")[0];
        const quoteCurrency = this.props.currentMarket.split("-")[1];
        if (this.props.side === "s") {
            const baseBalance =
                this.getBaseBalance() - api.currencies[baseCurrency].gasFee;
            const amount = this.state.amount || 0;
            return Math.round((amount / baseBalance) * 100);
        } else if (this.props.side === "b") {
            const quoteBalance = this.getQuoteBalance();
            const amount = this.state.amount || 0;
            const total = amount * this.currentPrice();
            return Math.round(
                (total / (quoteBalance - api.currencies[quoteCurrency].gasFee)) *
                    100
            );
        }
    }

    currentPrice() {
        const baseCurrency = this.props.currentMarket.split("-")[0];
        if (this.props.orderType === "limit" && this.state.price) {
            return this.state.price;
        }

        let spread, stableSpread;
        if (api.isZksyncChain(this.props.chainId)) {
            spread = 0.001;
            stableSpread = 0.0004;
        } else {
            spread = 0.002;
            stableSpread = 0.0007;
        }
        if (this.props.side === "b" && (["WBTC", "ETH", "FXS", "WETH"]).includes(baseCurrency))
            return parseFloat(
                (this.props.lastPrice * (1 + spread)).toPrecision(6)
            );
        else if (this.props.side === "s" && (["WBTC", "ETH", "FXS", "WETH"]).includes(baseCurrency))
            return parseFloat(
                (this.props.lastPrice * (1 - spread)).toPrecision(6)
            );
        else if (this.props.side === "b" && (["USDC", "USDT", "DAI", "FRAX"]).includes(baseCurrency))
            return parseFloat(
                (this.props.lastPrice * (1 + stableSpread)).toPrecision(6)
            );
        else if (this.props.side === "s" && (["USDC", "USDT", "DAI", "FRAX"]).includes(baseCurrency))
            return parseFloat(
                (this.props.lastPrice * (1 - stableSpread)).toPrecision(6)
            );
        return 0;
    }

    rangeSliderHandler(e, val) {
        if (!this.props.user.id) return false;

        const newstate = { ...this.state };
        if (val === 100) {
            newstate.maxSizeSelected = true;
            if (this.props.side === "b") {
                val = 99.9;
            }
        } else {
            newstate.maxSizeSelected = false;
        }
        if (this.props.side === "s") {
            const baseBalance = this.getBaseBalance();
            const baseCurrency = this.props.currentMarket.split("-")[0];
            const decimals = api.currencies[baseCurrency].decimals;
            let displayAmount = (baseBalance * val) / 100;
            displayAmount -= api.currencies[baseCurrency].gasFee;
            displayAmount = parseFloat(displayAmount.toFixed(decimals)).toPrecision(7);
            if (displayAmount < 1e-5) {
                newstate.amount = 0;
            } else {
                newstate.amount = parseFloat(displayAmount.slice(0, -1));
            }
        } else if (this.props.side === "b") {
            const quoteBalance = this.getQuoteBalance();
            const baseCurrency = this.props.currentMarket.split("-")[0];
            const quoteCurrency = this.props.currentMarket.split("-")[1];
            const decimals = api.currencies[baseCurrency].decimals;
            let quoteAmount =
                ((quoteBalance - api.currencies[quoteCurrency].gasFee) * val) /
                100 /
                this.currentPrice();
            quoteAmount = parseFloat(quoteAmount.toFixed(decimals)).toPrecision(7);
            if (quoteAmount < 1e-5) {
                newstate.amount = 0;
            } else {
                newstate.amount = parseFloat(quoteAmount.slice(0, -1));
            }
        }

        if (isNaN(newstate.amount)) newstate.amount = 0;
        this.setState(newstate);
    }

    componentDidUpdate(prevProps, prevState) {
        // Prevents bug where price volatility can cause buy amount to be too large
        // by refreshing a maxed out buy amount to match the new price
        if (
            this.props.lastPrice !== prevProps.lastPrice &&
            this.state.maxSizeSelected
        ) {
            this.rangeSliderHandler(null, 100);
        }
    }

    render() {
        let price = this.currentPrice();
        if (price === 0) price = "";

        const baseCurrency = this.props.currentMarket.split("-")[0];
        const quoteCurrency = this.props.currentMarket.split("-")[1];

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

        const balanceHtml =
            this.props.side === "b" ? (
                <strong>
                    {quoteBalance.toPrecision(8)} {quoteCurrency}
                </strong>
            ) : (
                <strong>
                    {baseBalance.toPrecision(8)} {baseCurrency}
                </strong>
            );

        let buySellBtnClass, buttonText;
        if (this.props.side === "b") {
            buySellBtnClass = "bg_btn buy_btn";
            buttonText = "BUY";
        } else if (this.props.side === "s") {
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
              <input type="text" value={!isNaN(price) ? price : ''} onChange={this.updatePrice.bind(this)} disabled={this.priceIsDisabled()}  />
              <span className={this.priceIsDisabled() ? "text-disabled" : ""}>{quoteCurrency}</span>
            </div>
            <div className="spf_input_box">
              <span className="spf_desc_text">Amount</span>
              <input type="text" value={this.state.amount} placeholder="0.00" onChange={this.updateAmount.bind(this)}/>
              <span>{baseCurrency}</span>
            </div>
            <div className="spf_range">
              <RangeSlider value={this.amountPercentOfMax()} onChange={this.rangeSliderHandler.bind(this)} />
            </div>
            {this.props.user.id ? (
              <div className="spf_btn">
                <button
                  type="button"
                  className={buySellBtnClass}
                  onClick={this.buySellHandler.bind(this)}
                  disabled={this.state.orderButtonDisabled}
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
