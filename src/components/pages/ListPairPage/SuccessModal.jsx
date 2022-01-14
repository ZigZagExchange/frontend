import React from "react";
import {Modal} from "../../atoms/Modal";
import {x} from "@xstyled/styled-components"
import {BsFillCheckCircleFill} from "react-icons/all";
import {useHistory, useLocation} from "react-router-dom";
import {Button} from "../../atoms/Form/Submit";

export const idQueryParam = "market"

const SuccessModal = ({txid, show, onClose}) => {
  const viewMarketURL = `https://zigzag-markets.herokuapp.com/?id=${txid}`
  const tradeMarketURL = `https://trade.zigzag.exchange/trade?market=${txid}`

  const history = useHistory()

  return <Modal show={show} onClose={onClose}>

    <x.div mb={3} display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"}>
      <BsFillCheckCircleFill size={55} color={"teal-200"}/>
      <x.div fontSize={32} mt={2}>
        Market Listed
      </x.div>
    </x.div>
    <x.div w={"full"} display={"flex"} flexDirection={"column"} alignItems={"center"} mb={6}>
      <Link link={viewMarketURL}>View your market</Link>
      <Link link={tradeMarketURL}>Trade your market</Link>
      <Button variant={"secondary"} onClick={() => {
        alert(`pushing to: ${txid}`)
        history.push({
          pathname: '/',
          search: `?${idQueryParam}=${txid}`
        })
      }}>Trade your market</Button>
    </x.div>
    <x.div fontSize={12} textAlign={"center"} color={"blue-gray-600"} mb={3}>
      arweave tx: {txid}
    </x.div>
  </Modal>
}

const Link = ({link, children}) => {
  return <x.a
    fontSize={18}
    href={link}
    target={"_blank"}
  >
    {children}
  </x.a>
}

export default SuccessModal;
