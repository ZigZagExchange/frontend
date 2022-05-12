import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  bridgeReceiptsSelector,
  clearBridgeReceipts,
} from "lib/store/features/api/apiSlice";
import { formatDistance } from "date-fns";
import styled from "styled-components";

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
      color: ${(p) => p.theme.colors.primaryHighEmphasis}
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
    display: flex;
    padding: 1.5rem 1rem;
    justify-content: space-between;

    &:not(:last-child) {
      border-bottom: 1px solid ${(p) => p.theme.colors.foreground400}
    }

    .layer-left, .layer-right {
      display: flex;
      justify-content: space-between;
    }

    .layer-left {
      h3 {
        margin-right: 20px;

        &.first-child {
          padding: 3px;
          border: 1px solid ${(p) => p.theme.colors.foreground400}
        }

        &.last-child {
          margin-left: 8px;
        }
      }
    }

    .layer-right {
      opacity: .48;

      h5 {
        margin-right: 1rem;
      }
    }
  }
`

const BridgeReceipts = () => {
  const receipts = useSelector(bridgeReceiptsSelector);
  const dispatch = useDispatch();
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

      {/* {receipts.length === 0 && (
        <h3>No bridge receipts yet.</h3>
      )} */}

      <ReceiptBox>
        <h3 className="receipt-header">March 13, 2022</h3>

        <div className="layer-wrapper">
          <div className="layer">
            <div className="layer-left">
              <h3>Deposit</h3>

              <h3>0.01ETH</h3>
            </div>

            <div className="layer-right">
              <h5>0x3ad7...eaa331</h5>

              <h4>2:03 PM</h4>
            </div>
          </div>

          <div className="layer">
            <div className="layer-left">
              <h3>Deposit</h3>

              <h3>0.01ETH</h3>
            </div>

            <div className="layer-right">
              <h5>0x3ad7...eaa331</h5>

              <h4>2:03 PM</h4>
            </div>
          </div>
        </div>
      </ReceiptBox>

      <ReceiptBox>
        <h3 className="receipt-header">March 13, 2022</h3>

        <div className="layer-wrapper">
          <div className="layer">
            <div className="layer-left">
              <h3>Deposit</h3>

              <h3>0.01ETH</h3>
            </div>

            <div className="layer-right">
              <h5>0x3ad7...eaa331</h5>

              <h4>2:03 PM</h4>
            </div>
          </div>

          <div className="layer">
            <div className="layer-left">
              <h3>Deposit</h3>

              <h3>0.01ETH</h3>
            </div>

            <div className="layer-right">
              <h5>0x3ad7...eaa331</h5>

              <h4>2:03 PM</h4>
            </div>
          </div>
        </div>
      </ReceiptBox>

      {/* <div className="bridge_box_transactions">
      {receipts.map((r) => (
        <div
          onClick={() => window.open(r.txUrl)}
          key={r.txId}
          className="bridge_box_transaction"
        >
          <div className="bridge_contain">
            <div className={`bridge_box_transaction_txType_${r.type}`}>
              {r.type} {r.isFastWithdraw && "(FAST)"}
            </div>
            <div className="bridge_box_transaction_amount">
              {r.amount} {r.token}
            </div>
          </div>
          <div className="bridge_box_transaction_txId">
            {formatDistance(r.date, new Date(), { addSuffix: true })} &bull;{" "}
            {`${r.txId.substr(0, 6)}...${r.txId.substr(-6)}`}
          </div>
        </div>
      ))}
      </div> */}
    </RecepitSection>
  );
};

export default BridgeReceipts;
