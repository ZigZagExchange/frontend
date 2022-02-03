import React, { useMemo } from 'react'
import { useTranslation } from "react-i18next";
import "../../../translations/i18n";
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom'
import { networkSelector } from 'lib/store/features/api/apiSlice';
import { BridgeTemplate } from 'components';
import cx from 'classnames';
import api from 'lib/api';
import Bridge from './Bridge/Bridge'
import BridgeReceipts from './BridgeReceipts/BridgeReceipts'
import BridgeIncompatible from './Bridge/BridgeIncompatible'
import './BridgePage.style.css'

export default function BridgePage() {
  const network = useSelector(networkSelector);
  const isBridgeCompatible = useMemo(() => network && api.isImplemented('depositL2'), [network])
  const tab = useParams().tab || 'bridge'
  const { t } = useTranslation();

  return (
    <BridgeTemplate>
      <div className="bridge_section">
        <div className="bridge_container">
          <div className="bridge_head_tabs">
            <Link className={cx({ 'bridge_head_tab_active': tab === 'bridge' })} to="/bridge">{t("bridge")}</Link>
            <Link className={cx({ 'bridge_head_tab_active': tab === 'receipts' })} to="/bridge/receipts">{t("receipts")}</Link>
          </div>
        </div>
        <div className="bridge_container" style={{ flex: '1 1 auto' }}>
          {isBridgeCompatible
            ? tab === 'bridge' ? <Bridge /> : <BridgeReceipts />
            : <BridgeIncompatible />}
        </div>
      </div>
    </BridgeTemplate>
  )
}
