import React, {useState} from "react";
import {x} from "@xstyled/styled-components"
import Toggle from "./Toggle";

const ToggleDemo = () => {
  const [toggleSM, setToggleSM] = useState(false)
  const [toggleMD, setToggleMD] = useState(false)

  return <x.div row>
    <x.div col>
      <x.div display={"flex"} flexDirection={"column"} alignItems={"center"}>
        <Toggle value={toggleSM} onClick={setToggleSM}/>
        <x.div mt={2} display={"inline-block"} color={"blue-gray-400"}>sm</x.div>
      </x.div>
    </x.div>
    <x.div col>
      <x.div display={"flex"} flexDirection={"column"} alignItems={"center"}>
        <Toggle value={toggleMD} size={"md"} onClick={setToggleMD}/>
        <x.div display={"inline-block"} mt={2} color={"blue-gray-400"}>md</x.div>
      </x.div>
    </x.div>
  </x.div>
}

export default ToggleDemo;
