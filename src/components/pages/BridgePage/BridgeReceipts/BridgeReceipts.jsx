import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { format } from "date-fns";
import {
  bridgeReceiptsSelector,
  clearBridgeReceipts,
} from "lib/store/features/api/apiSlice";
import api from "lib/api";

const RecepitHeader = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  justify-content: space-between;
`;

const RecepitSection = styled.div`
  display: block;

  h3 {
    font-size: 14px;
    font-weight: 600;
  }

  h4 {
    font-size: 12px;
    font-weight: 600;
  }

  h5 {
    font-size: 12px;
    font-weight: 400;

    &.bridge_link {
      color: ${(p) => p.theme.colors.primaryHighEmphasis};
    }
  }
`;

const ReceiptBox = styled.div`
  &:not(:last-child) {
    margin-bottom: 2rem;
  }

  .receipt-header {
    margin-bottom: 12px;
  }

  .layer-wrapper {
    border: 1px solid ${(p) => p.theme.colors.foreground400};
    border-radius: 8px;
  }

  .layer {
    display: grid;
    grid-template-columns: 222px 138px;
    padding: 20px;
    justify-content: space-between;
    cursor: pointer;

    &:not(:last-child) {
      border-bottom: 1px solid ${(p) => p.theme.colors.foreground400};
    }

    .layer-left,
    .layer-right {
      display: flex;
      justify-content: space-between;
    }

    .layer-left {
      h3 {
        font-size: 12px;
        &:first-child {
          padding: 4px 8px;
          border: 1px solid ${(p) => p.theme.colors.foreground400};
          border-radius: 8px;
        }

        &:last-child {
          line-height: 25px;
          padding-right: 20px;
        }
      }
      .amountWrapper {
        display: flex;
        flex-direction: row;
        gap: 8px;

        .currencyIcon > img {
          width: 16px;
          height: 16px;
          object-fit: contain;
        }
      }
    }

    .layer-right {
      color: ${(p) => p.theme.colors.foregroundLowEmphasis};
      h5 {
        line-height: 25px;
        padding-left: 10px;
      }

      h4 {
        line-height: 25px;
      }
    }
  }
`;

const BridgeReceipts = () => {
  const receipts = useSelector(bridgeReceiptsSelector);
  const dispatch = useDispatch();
  const [groupArray, setGroupArray] = useState([]);

  useEffect(() => {
    let tempArray = [];
    let tempObj = { date: "", items: [] };
    receipts.forEach((item, key) => {
      const mdate = format(item.date, "MMM d, Y");
      if (tempObj.date === "") {
        tempObj = { date: mdate, items: [] };
      }
      if (tempObj.date !== mdate) {
        tempArray.push(tempObj);
        tempObj = { date: mdate, items: [] };
      }
      tempObj.items.push(item);
      if (key === receipts.length - 1) {
        tempArray.push(tempObj);
      }
    });
    setGroupArray(tempArray);
  }, []);

  return (
    <RecepitSection>
      <RecepitHeader>
        <h3>Viewing {receipts.length} transfers</h3>
        <h5
          onClick={() => dispatch(clearBridgeReceipts())}
          className="bridge_link"
        >
          Clear All
        </h5>
      </RecepitHeader>

      {receipts.length === 0 && <h3>No bridge receipts yet.</h3>}
      {groupArray.map((item) => {
        return (
          <>
            <ReceiptBox>
              <h3 className="receipt-header">{item.date}</h3>
              <div className="layer-wrapper">
                {item.items.map((rr) => {
                  const mtime = format(rr.date, "H:mm");
                  const currency = api.getCurrencyInfo(rr.token);
                  const image = api.getCurrencyLogo(rr.token);
                  return (
                    <div
                      className="layer"
                      onClick={() => window.open(rr.txUrl)}
                    >
                      <div className="layer-left">
                        <h3>
                          {rr.type === "eth_to_zksync" ? "Deposit" : "Withdraw"}
                        </h3>
                        <div className="amountWrapper">
                          <div className="currencyIcon">
                            <img
                              src={image && image}
                              alt={currency && currency.symbol}
                            />
                          </div>
                          <h3>
                            {rr.amount} {rr.token}
                          </h3>
                        </div>
                      </div>

                      <div className="layer-right">
                        <h5>{`${rr.txId.substr(0, 6)}...${rr.txId.substr(
                          -6
                        )}`}</h5>

                        <h4>{mtime}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ReceiptBox>
          </>
        );
      })}
    </RecepitSection>
  );
};

export default BridgeReceipts;
