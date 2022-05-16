import React from 'react'
import { InfoIcon, EditIcon } from "components/atoms/Svg";

const TransactionSettings = () => {
  return (
    <div className="p-4 mt-4 border-t border-b border-l border-r rounded-lg dark:border-foreground-400 border-primary-500">
        <p className="text-lg font-semibold font-work">Transaction Settings</p>
        <div className="flex justify-between mt-3">
            <p className="flex items-center gap-2 text-base font-light font-work">Slippage Tolerance<InfoIcon size={16} /></p>
            <p className="flex items-center gap-2 text-base font-work">2.00%<EditIcon size={16} /></p>
        </div>
        <div className="flex justify-between mt-3">
            <p className="flex items-center gap-2 text-base font-light font-work">Estimated gas fee:</p>
            <p className="flex items-center gap-2 text-base font-work">--</p>
        </div>
    </div>
  )
}

export default TransactionSettings