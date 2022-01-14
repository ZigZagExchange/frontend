import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { networkSelector } from "lib/store/features/api/apiSlice";
import { DefaultTemplate } from "components";
import api from "lib/api";
import Pool from "./Pool/Pool.jsx";
import PoolIncompatible from "./Pool/PoolIncompatible";
import "./PoolPage.style.css";

export default function BridgePage() {
  const network = useSelector(networkSelector);
  const isPoolCompatible = useMemo(
    () => network && api.isImplemented("depositL2"),
    [network]
  );

  return (
    <DefaultTemplate>
      <div className="pool_section">
        <div className="pool_container" style={{ flex: "1 1 auto" }}>
          {isPoolCompatible ? <Pool /> : <PoolIncompatible />}
        </div>
      </div>
    </DefaultTemplate>
  );
}
