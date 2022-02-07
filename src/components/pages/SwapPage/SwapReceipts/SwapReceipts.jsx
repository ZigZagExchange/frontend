import React from "react";

const SwapReceipts = () => {
  return (
    <div className="swap_box swap_box_receipts">
      <h6 className="swap_box_receipt_head">
        0 receipts (<span className="swap_link">Clear All</span>)
      </h6>
      <div className="swap_box_transactions">
        <h5 style={{ padding: 26 }}>No swap receipts yet.</h5>
      </div>
    </div>
  );
};

export default SwapReceipts;
