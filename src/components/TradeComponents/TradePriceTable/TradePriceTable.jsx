import React from "react";
// css
import "./TradePriceTable.css";
class TradePriceTable extends React.Component {

    scrollToBottom = () => {
        if (this.props.scrollToBottom) {
            this.tableDiv.scrollTop = this.tableDiv.scrollHeight;
        }
    }

    componentDidMount() {
      this.scrollToBottom();
    }

    componentDidUpdate() {
      this.scrollToBottom();
    }


    render() {
      const baseCurrency = this.props.currentMarket.split("-")[0];
      const quoteCurrency = this.props.currentMarket.split("-")[1];

      const maxQuantity = Math.max(...this.props.priceTableData.map((d) => d.td2));
      let onClickRow;
      if (this.props.onClickRow) onClickRow = this.props.onClickRow;
      else onClickRow = () => null;

      return (
        <>
          <table className={`trade_price_table ${this.props.className}`} ref={el => this.tableDiv = el}>
            <thead>
              <tr>
                <th>Price</th>
                <th>Amount</th>
                <th>Total({quoteCurrency})</th>
              </tr>
            </thead>
            <tbody>
              {this.props.priceTableData.map((d, i) => {
                const color = d.side === "b" ? "#27302F" : "#2C232D";
                const breakpoint = Math.round((d.td2 / maxQuantity) * 100);
                let rowStyle;
                if (this.props.useGradient) {
                  rowStyle = {
                    backgroundImage: `linear-gradient(to left, ${color}, ${color} ${breakpoint}%, #171c28 0%)`,
                  };
                } else {
                  rowStyle = {};
                }
                const price = typeof d.td1 === "number" ? d.td1.toPrecision(6) : d.td1;
                const amount = typeof d.td2 === "number" ? d.td2.toPrecision(6) : d.td2;
                const total = typeof d.td3 === "number" ? d.td3.toPrecision(6) : d.td3;
                return (
                  <tr key={i} style={rowStyle} onClick={() => onClickRow(d)}>
                    <td className={d.side === "b" ? "up_value" : "down_value"}>
                      {price}
                    </td>
                    <td>{amount}</td>
                    <td>{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      );
    }
};

export default TradePriceTable;
