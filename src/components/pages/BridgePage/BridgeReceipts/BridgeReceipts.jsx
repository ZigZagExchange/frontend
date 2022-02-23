import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  bridgeReceiptsSelector,
  clearBridgeReceipts,
} from "lib/store/features/api/apiSlice";
import { formatDistance } from "date-fns";

const BridgeReceipts = () => {
  const receipts = useSelector(bridgeReceiptsSelector);
  const dispatch = useDispatch();
  return (
    <div className="bridge_box bridge_box_receipts">
      <h6 className="bridge_box_receipt_head">
        {receipts.length} receipts (
        <span
          onClick={() => dispatch(clearBridgeReceipts())}
          className="bridge_link"
        >
          Clear All
        </span>
        )
      </h6>
      <div className="bridge_box_transactions">
        {receipts.length === 0 && (
          <h5 style={{ padding: 26 }}>No bridge receipts yet.</h5>
        )}
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
      </div>
    </div>
  );
};

export default BridgeReceipts;
