import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RiErrorWarningLine } from "react-icons/all";
import { userSelector } from "lib/store/features/auth/authSlice";
import {
  arweaveAllocationSelector,
  networkSelector,
} from "lib/store/features/api/apiSlice";
import api from "lib/api";
import { x } from "@xstyled/styled-components";
import styled from "styled-components";
import "bootstrap";

import { DefaultTemplate } from "components";
import Text from "../../atoms/Text/Text";
import AllocationModal from "./AllocationModal";
import { Button, ConnectWalletButton } from "components/molecules/Button";
import { jsonify } from "../../../lib/helpers/strings";
import SuccessModal from "./SuccessModal";
import { HiExternalLink } from "react-icons/hi";
import ListPairForm from "./ListPairForm";
import { sleep } from "../../../lib/utils";
import TradeFooter from "components/organisms/TradeDashboard/TradeFooter/TradeFooter";

export const TRADING_VIEW_CHART_KEY = "tradingViewChart";

const ListPage = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 113px);
  padding: 0 2rem;
  // background-color: ${(p) => p.theme.colors.bridgeBackground};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  flex-direction: column;

  .bg_btn {
    height: 29px;
    font-size: 12px;
  }
`;

const ListContainer = styled.div`
  width: 100%;
  max-width: 470px;
  margin: 0 auto;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  svg {
    display: inline;
  }

  @media screen and (max-width: 480px) {
    padding: 0 10px;
  }
`;

export default function ListPairPage() {
  const user = useSelector(userSelector);
  const isUserLoggedIn = user.id !== null && user.id !== undefined;

  const arweaveAllocation = useSelector(arweaveAllocationSelector);
  const arweaveAllocationKB = Number(arweaveAllocation) / 1000;
  const [isArweaveAllocationSufficient, setIsArweaveAllocationSufficient] =
    useState(false);

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const [txid, setTxId] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const network = useSelector(networkSelector);
  const isUserConnectedToMainnet = network === 1;

  // we purchase 500k bytes at once so the user does not have to
  // repeatedly repurchase space if wanting to list more than 1 market
  const bytesToPurchase = 500000;

  const refreshUserArweaveAllocation = () => {
    return api.refreshArweaveAllocation(user.address);
  };

  const onFormSubmit = async (formData, resetForm) => {
    return new Promise(async (resolve, reject) => {
      const toFile = {};
      for (const [key] of Object.entries(formData)) {
        if (key === TRADING_VIEW_CHART_KEY) {
          if (formData[key] !== "") {
            toFile[key] = formData[key];
          }
        } else {
          toFile[key] = Number(formData[key]);
        }
      }
      const fileData = new TextEncoder().encode(jsonify(toFile));
      const file = new File(
        [fileData],
        `${toFile.baseAssetId}-${toFile.quoteAssetId}.json`
      );

      if (file.size > arweaveAllocation) {
        setFileToUpload(file);
        setIsAllocationModalOpen(true);
        setHasAttemptedSubmit(true);
        reject();
        return;
      }

      const timestamp = Date.now();
      const message = `${user.address}:${timestamp}`;
      try {
        const signature = await api.signMessage(message);
        const response = await api.uploadArweaveFile(
          user.address,
          timestamp,
          signature,
          file
        );
        setTxId(response.arweave_txid);

        setIsSuccessModalOpen(true);
        setHasAttemptedSubmit(false);
        resetForm();
      } catch (e) {
        reject(e);
        return;
      }
      refreshUserArweaveAllocation();
      resolve();
    });
  };

  useEffect(() => {
    document.title = "ZigZag List Pair";
  }, []);

  useEffect(() => {
    refreshUserArweaveAllocation();
    setHasAttemptedSubmit(false);
  }, [user.address]);

  useEffect(() => {
    if (fileToUpload) {
      if (fileToUpload.size <= arweaveAllocation) {
        setIsArweaveAllocationSufficient(true);
      } else {
        setIsArweaveAllocationSufficient(false);
      }
    }
  }, [arweaveAllocation]);

  return (
    <DefaultTemplate>
      <ListPage>
        <ListContainer>
          <x.div mb={4}>
            <p className="mb-5 mt-10 text-3xl font-semibold font-work ">
              List New Pair
            </p>

            <x.div
              fontSize={{ xs: "xs", md: "14px" }}
              lineHeight={1}
              color={"blue-gray-400"}
            >
              <x.div marginBottom="4px">No Internal ID?</x.div>
              <x.div>
                <x.a
                  target={"_blank"}
                  color={{
                    _: "foregroundHighEmphasis",
                    hover: "foregroundLowEmphasis",
                  }}
                  href={"https://zkscan.io/explorer/tokens"}
                >
                  List your token on zkSync
                  <HiExternalLink
                    size="14px"
                    style={{ marginLeft: "6px", marginBottom: "2px" }}
                  />
                </x.a>
              </x.div>
            </x.div>
          </x.div>

          <ListPairForm onSubmit={onFormSubmit}>
            {fileToUpload && !isArweaveAllocationSufficient && (
              <x.div
                display={"flex"}
                alignItems={"center"}
                justifyContent={"space-between"}
                mb={4}
              >
                <x.div display={"flex"} alignItems={"center"}>
                  <RiErrorWarningLine size={18} color={"red"} />
                  <x.div ml={1} fontSize={12} color={"blue-gray-400"}>
                    Insufficient Arweave allocation
                  </x.div>
                </x.div>
                <x.div color={"blue-gray-400"}>{arweaveAllocationKB} kB</x.div>
              </x.div>
            )}

            {/* <Dev>
              <x.div
                fontSize={12}
                color={"blue-gray-500"}
                mb={3}
                textAlign={"right"}
              >
                arweave allocation: {arweaveAllocationKB} kB
              </x.div>
            </Dev> */}

            {(() => {
              if (!isUserLoggedIn) {
                return <ConnectWalletButton width="100%" />;
              } else {
                if (isUserConnectedToMainnet) {
                  return (
                    <Button width="100%">
                      {!isArweaveAllocationSufficient && hasAttemptedSubmit
                        ? "PURCHASE ALLOCATION"
                        : "SUBMIT"}
                    </Button>
                  );
                } else {
                  return (
                    <Button width="100%" variant="outlined" disabled>
                      Please connect to Mainnet
                    </Button>
                  );
                }
              }
            })()}
          </ListPairForm>
        </ListContainer>
      </ListPage>

      <AllocationModal
        onClose={() => setIsAllocationModalOpen(false)}
        show={isAllocationModalOpen}
        bytesToPurchase={bytesToPurchase}
        onSuccess={async () => {
          // API cache needs a bit of time to update. Arweave bridge runs on a 5 second loop
          // we timeout here so we make sure we get fresh data
          await sleep(5000);
          await refreshUserArweaveAllocation();
          setFileToUpload(null);
          setIsAllocationModalOpen(false);
        }}
      />
      <SuccessModal
        txid={txid}
        show={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          setTxId(null);
        }}
      />
      {/* <TradeFooter /> */}
    </DefaultTemplate>
  );
}
