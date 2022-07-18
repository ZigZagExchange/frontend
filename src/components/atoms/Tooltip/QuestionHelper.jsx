import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { InfoIcon } from "../Svg";
import Tooltip from "./Tooltip";

const QuestionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  border: none;
  background: none;
  outline: none;
  cursor: pointer;
  border-radius: 36px;
`;

export default function QuestionHelper({ text, placement }) {
  const [show, setShow] = useState(false);

  return (
    <Tooltip text={text} show={show} placement={placement}>
      <QuestionWrapper
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <InfoIcon />
      </QuestionWrapper>
    </Tooltip>
  );
}
