import React from "react";
import { x } from "@xstyled/styled-components";
import { Tooltip } from "components";

const TooltipDemo = () => {
  return (
    <x.div>
      <Tooltip placement={"right"} label={"We like the hover"}>
        <x.span>hover me 🕴</x.span>
      </Tooltip>
    </x.div>
  );
};

export default TooltipDemo;
