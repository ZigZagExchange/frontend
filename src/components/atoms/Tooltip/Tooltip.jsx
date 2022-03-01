import React from "react";
import RCTooltip from "rc-tooltip";
import Pane from "../Pane/Pane";
import "rc-tooltip/assets/bootstrap.css";
import "./Tooltip.css";

const TooltipOverlay = ({ children }) => {
  return (
    <Pane
      fontSize={12}
      size={"xs"}
      bg={"#0b0e15"}
      display={"inline-block"}
      color={"blue-gray-400"}
    >
      {children}
    </Pane>
  );
};

export const Tooltip = ({ placement, label, children }) => {
  return (
    <RCTooltip
      trigger={["hover"]}
      placement={placement}
      overlay={<TooltipOverlay>{label}</TooltipOverlay>}
      overlayClassName={"zz-tooltip"}
    >
      {children}
    </RCTooltip>
  );
};
