import React, { useCallback, useState } from "react";
import styled from "styled-components";
import Popover from "./Popover";

const TooltipContainer = styled.div`
  width: fit-content;
  padding: 0.6rem 1rem;
  line-height: 150%;
  font-weight: 400;
`;

export default function Tooltip({ text, ...rest }) {
  return (
    <Popover content={<TooltipContainer>{text}</TooltipContainer>} {...rest} />
  );
}

