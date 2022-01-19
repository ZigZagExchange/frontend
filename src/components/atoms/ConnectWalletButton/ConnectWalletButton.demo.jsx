import React from "react";
import ConnectWalletButton from "./ConnectWalletButton";
import {x} from "@xstyled/styled-components"

const ConnectWalletButtonDemo = () => {
  return <x.div display={"flex"} justifyContent={"center"}>
    <x.div maxW={"xs"} mt={6}>
      <ConnectWalletButton />
    </x.div>
  </x.div>
}

export default ConnectWalletButtonDemo
