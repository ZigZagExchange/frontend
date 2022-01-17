import React from 'react';
import { toast } from 'react-toastify';
import api from 'lib/api';
import { RangeSlider } from 'components';
import './SpotForm.css';
import ConnectWalletButton from "../../atoms/ConnectWalletButton/ConnectWalletButton";

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
            WBTC: 0.0002,
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
        const marketInfo = this.props.marketInfo;
        amount = parseFloat(amount.toFixed(marketInfo.baseAsset.decimals));
        if (
            this.props.activeOrderCount > 0 &&
            api.isZksyncChain()
        ) {
            toast.error("Only one active order permitted at a time");
            return;
        }
        let baseBalance, quoteBalance;
        if (this.props.user.id) {
            baseBalance = await this.getBaseBalance();
            quoteBalance = await this.getQuoteBalance();
        } else {
            baseBalance = 0;
            quoteBalance = 0;
        }
        const price = this.currentPrice();

        baseBalance = parseFloat(baseBalance);
        quoteBalance = parseFloat(quoteBalance);
        if (this.props.side === "s" && isNaN(baseBalance)) {
            toast.error(`No ${marketInfo.baseAsset.symbol} balance`);
            return;
        } else if (this.props.side === "b" && isNaN(quoteBalance)) {
            toast.error(`No ${marketInfo.quoteAsset.symbol} balance`);
            return;
        } else if (this.props.side === "s" && amount > baseBalance) {
            toast.error(`Amount exceeds ${marketInfo.baseAsset.symbol} balance`);
            return;
        } else if (this.props.side === "b" && amount * price > quoteBalance) {
            toast.error(`Total exceeds ${marketInfo.quoteAsset.symbol} balance`);
            return;
        } else if (amount < this.MINIMUM_AMOUNTS[marketInfo.baseAsset.symbol]) {
            toast.error(
                `Minimum order size is ${this.MINIMUM_AMOUNTS[marketInfo.baseAsset.symbol]} ${marketInfo.baseAsset.symbol}`
            );
            return;
        } else if (
            isNaN(price) ||
            price > this.props.lastPrice * 1.2 ||
            price < this.props.lastPrice * 0.8
        ) {
            toast.error("Price must be within 20% of spot");
            return;
        } else if (
            (this.props.side === 'b' && price > this.getFirstAsk() * 1.005) ||
            (this.props.side === 's' && price < this.getFirstBid() * 0.995)
        ) {
            toast.error("Limit orders cannot exceed 0.5% beyond spot");
            return;
        }

        let newstate = { ...this.state };
        newstate.orderButtonDisabled = true;
        this.setState(newstate);
        let orderPendingToast;
        if (api.isZksyncChain()) {
            orderPendingToast = toast.info(
                "Order pending. Sign or Cancel to continue..."
            );
        }

        try {
            await api.submitOrder(
                this.props.currentMarket,
                this.props.side,
                price,
                amount,
                this.props.orderType
            );
        } catch (e) {
            console.log(e);
            toast.error(e.message);
        }

        if (api.isZksyncChain()) {
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

        const marketInfo = this.props.marketInfo;
        if (!this.marketInfo) return 0;

        if (this.props.side === "s") {
            const baseBalance = this.getBaseBalance() - marketInfo.baseFee;
            const amount = this.state.amount || 0;
            return Math.round((amount / baseBalance) * 100);
        } else if (this.props.side === "b") {
            const quoteBalance = this.getQuoteBalance();
            const amount = this.state.amount || 0;
            const total = amount * this.currentPrice();
            return Math.round(
                (total / (quoteBalance - marketInfo.quoteFee)) *
                    100
            );
        }
    }

    currentPrice() {
        const marketInfo = this.props.marketInfo;
        if (!marketInfo) return 0;

        if (this.props.orderType === "limit" && this.state.price) {
            return this.state.price;
        }

        let spread, stableSpread;
        if (this.props.side === "b") {
            return (this.getFirstAsk() * 1.0003).toFixed(marketInfo.pricePrecisionDecimals);
        }
        else if (this.props.side === "s") {
            return (this.getFirstBid() * 0.9997).toFixed(marketInfo.pricePrecisionDecimals);
        }
        return 0;
    }

    getFirstAsk() {
        const marketInfo = this.props.marketInfo;
        if (!marketInfo) return 0;
        const asks = this.props.liquidity.filter(l => l[0] == "s").map(l => l[1]);
        return Math.min(...asks).toFixed(marketInfo.pricePrecisionDecimals);
    }

    getFirstBid() {
        const marketInfo = this.props.marketInfo;
        if (!marketInfo) return 0;
        const bids = this.props.liquidity.filter(l => l[0] == "b").map(l => l[1]);
        return Math.max(...bids).toFixed(marketInfo.pricePrecisionDecimals);
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
        } else {
            newstate.maxSizeSelected = false;
        }
        if (this.props.side === "s") {
            const baseBalance = this.getBaseBalance();
            const decimals = marketInfo.baseAsset.decimals;
            let displayAmount = (baseBalance * val) / 100;
            displayAmount -= marketInfo.baseFee;
            displayAmount = parseFloat(displayAmount.toFixed(decimals)).toPrecision(7);
            if (displayAmount < 1e-5) {
                newstate.amount = 0;
            } else {
                newstate.amount = parseFloat(displayAmount.slice(0, -1));
            }
        } else if (this.props.side === "b") {
            const quoteBalance = this.getQuoteBalance();
            const decimals = marketInfo.baseFee;
            let quoteAmount =
                ((quoteBalance - marketInfo.quoteFee) * val) /
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

        const balanceHtml =
            this.props.side === "b" ? (
                <strong>
                    {quoteBalance.toPrecision(8)} {marketInfo && marketInfo.quoteAsset.symbol}
                </strong>
            ) : (
                <strong>
                    {baseBalance.toPrecision(8)} {marketInfo && marketInfo.baseAsset.symbol}
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
              <span className={this.priceIsDisabled() ? "text-disabled" : ""}>{marketInfo && marketInfo.quoteAsset.symbol}</span>
            </div>
            <div className="spf_input_box">
              <span className="spf_desc_text">Amount</span>
              <input type="text" value={this.state.amount} placeholder="0.00" onChange={this.updateAmount.bind(this)}/>
              <span>{marketInfo && marketInfo.baseAsset.symbol}</span>
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
                <ConnectWalletButton/>
              </div>
            )}
          </form>
        </>
      );
  }
};
