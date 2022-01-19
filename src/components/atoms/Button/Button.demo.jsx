import React from "react";
import { x } from "@xstyled/styled-components";
import {Button} from "./Button";
import ConnectWalletButton from "../ConnectWalletButton/ConnectWalletButton";

const ButtonDemo = () => {
  return <x.div>
    <x.div display={"grid"} gridTemplateColumns={2}>
      <x.div display={"flex"} flexDirection={"column"} alignItems={"center"} spaceY={4}>
        <Button size={"xs"}>xs</Button>
        <Button>sm</Button>
        <Button size={"md"}>md</Button>
      </x.div>
      <x.div display={"flex"} flexDirection={"column"} alignItems={"center"} spaceY={4}>
        <Button size={"xs"} variant={"secondary"}>xs</Button>
        <Button variant={"secondary"}>sm</Button>
        <Button size={"md"} variant={"secondary"}>md</Button>
      </x.div>
    </x.div>
  </x.div>
}

export default ButtonDemo
