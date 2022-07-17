import React, { useEffect, useState } from "react";
import { Modal } from "../../atoms/Modal";
import { x } from "@xstyled/styled-components";
import { BsFillCheckCircleFill } from "react-icons/all";
import { Link } from "react-router-dom";
import styled from "@xstyled/styled-components";
import axios from "axios";
import Loader from "react-loader-spinner";
import ExternalLink from "./ExternalLink";
import api from "lib/api";

export const marketQueryParam = "market";
export const networkQueryParam = "network";

const StyledLink = styled(Link)`
  color: blue-gray-400;
  fontsize: 16;
  &:hover {
    color: blue-100;
  }
`;

const SuccessModal = ({ txid, show, onClose }) => {
  const [pairNetwork, setPairNetwork] = useState();
  const [baseAsset, setBaseAsset] = useState();
  const [quoteAsset, setQuoteAsset] = useState();
  const [alias, setAlias] = useState();

  const viewMarketURL = `https://zigzag-exchange.herokuapp.com/api/v1/marketinfos?market=${txid}`;

  useEffect(() => {
    if (show) {
      axios
        .get(viewMarketURL)
        .then((res) => {
          const data = Object.values(res.data)[0];
          setAlias(data.alias);
          setBaseAsset(data.baseAsset.symbol);
          setQuoteAsset(data.quoteAsset.symbol);

          const chainId = Number(data.zigzagChainId);
          setPairNetwork(api.getNetworkName(chainId));
        })
        .catch((err) => console.error(err));
    }
  }, [show]);

  return (
    <Modal show={show} onClose={onClose}>
      <x.div
        mb={3}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
        flexDirection={"column"}
      >
        <BsFillCheckCircleFill size={55} color={"teal-200"} />
        <x.div
          mb={3}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          flexDirection={"column"}
        >
          <x.div fontSize={32}>Market Listed</x.div>
          {alias ? (
            <x.div fontSize={18} color={"blue-gray-500"}>
              {alias} on {pairNetwork}
            </x.div>
          ) : (
            <Loader
              type={"TailSpin"}
              color={"#64748b"}
              height={22}
              width={22}
            />
          )}
        </x.div>
      </x.div>
      <x.div
        w={"full"}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        mb={6}
        fontSize={14}
      >
        <ExternalLink href={"trade.zigzag.exchange"}>
          View your market
        </ExternalLink>
        <StyledLink
          to={{
            pathname: "/",
            search: `?${marketQueryParam}=${baseAsset}-${quoteAsset}&${networkQueryParam}=${pairNetwork}`,
          }}
        >
          Trade your market
        </StyledLink>
      </x.div>
      <x.div fontSize={12} textAlign={"center"} color={"blue-gray-600"} mb={3}>
        arweave tx: {txid}
      </x.div>
    </Modal>
  );
};

export default SuccessModal;
