import React from "react";
import {Modal} from "../../atoms/Modal";
import {x} from "@xstyled/styled-components"
import {BsFillCheckCircleFill} from "react-icons/all";
import {Link} from "react-router-dom";
import styled from '@xstyled/styled-components'

export const idQueryParam = "market"

const StyledLink = styled(Link)`
  color: blue-gray-400;
  fontSize: 16;
  &:hover {
    color: blue-100;
  }
`

const SuccessModal = ({txid, show, onClose}) => {
  const viewMarketURL = `https://zigzag-markets.herokuapp.com/markets?id=${txid}`

  // test tx
  // {"arweave_txid":"-C60-kmz6VjDiWv_MsKzLXqNA_vC7c29sdaasOInaj8","remaining_bytes":499610}
  return <Modal show={show} onClose={onClose}>
    <x.div mb={3} display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"}>
      <BsFillCheckCircleFill size={55} color={"teal-200"}/>
      <x.div fontSize={32} mt={2}>
        Market Listed
      </x.div>
    </x.div>
    <x.div w={"full"} display={"flex"} flexDirection={"column"} alignItems={"center"} mb={6} fontSize={16}>
      <x.a href={viewMarketURL} target={"_blank"} mb={2} color={{_: "blue-gray-400", hover: "blue-100"}}>
        View your market
      </x.a>
      <StyledLink
        to={{
          pathname: '/',
          search: `?${idQueryParam}=${txid}`
        }}
      >
        Trade your market
      </StyledLink>
    </x.div>
    <x.div fontSize={12} textAlign={"center"} color={"blue-gray-600"} mb={3}>
      arweave tx: {txid}
    </x.div>
  </Modal>
}


export default SuccessModal;
