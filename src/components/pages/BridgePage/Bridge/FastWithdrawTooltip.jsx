import {x} from "@xstyled/styled-components";
import ExternalLink from "../../ListPairPage/ExternalLink";
import {HiExternalLink} from "react-icons/hi";
import {Tooltip} from "components";
import {AiOutlineQuestionCircle} from "react-icons/all";
import React from "react";

const FastWithdrawTooltip = () => {
  const renderLabel = () => {
    return <x.div>
      <x.div mb={2}>
        Fast: receive ETH, UST and FRAX within seconds through ZigZag's Fast Withdrawal bridge.
      </x.div>
      <x.div mb={2}>
        Normal: use zkSync's bridge and receive funds after a few hours.
      </x.div>
      <x.div><ExternalLink href={"https://docs.zigzag.exchange/zksync/fast-withdraw-bridge"}>
        Learn more<HiExternalLink/>
      </ExternalLink></x.div>
    </x.div>
  }

  return <>
    <Tooltip placement={"right"} label={renderLabel()}>
      <x.div display={"inline-flex"} color={"blue-gray-600"} ml={2} alignItems={"center"}>
        <AiOutlineQuestionCircle size={16}/>
      </x.div>
    </Tooltip>
  </>
}

export default FastWithdrawTooltip;
