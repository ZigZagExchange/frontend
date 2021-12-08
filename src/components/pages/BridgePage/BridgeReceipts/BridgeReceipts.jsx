import React from 'react'
import { useSelector } from 'react-redux'
import { bridgeReceiptsSelector } from 'lib/store/features/api/apiSlice'

const BridgeReceipts = () => {
    const receipts = useSelector(bridgeReceiptsSelector)

    return (
        <div className="bridge_box bridge_box_receipts">
            <h6 className="bridge_box_receipt_head">
                {receipts.length} receipts
                {' '}(<span className="bridge_link">Clear All</span>)
            </h6>
            <div className="bridge_box_transactions">
                {receipts.map((r) => (
                    <div key={r.txId} className="bridge_box_transaction">
                        <div className={`bridge_box_transaction_txType_${r.type}`}>
                            {r.type}
                        </div>
                        <div className="bridge_box_transaction_txId">
                            {`${r.txId.substr(0, 8)}...${r.txId.substr(-8)}`}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default BridgeReceipts