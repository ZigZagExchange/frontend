import React from "react";
import styled from "@xstyled/styled-components";
import { SpinnerIcon } from "../Svg";
import "./LoadingSpinner.css";

const SpinnerWrapper = styled(SpinnerIcon)`
  margin: 0px;
  width: 16px;
  height: 16px;
  -webkit-animation-name: spin;
  -webkit-animation-duration: 1000ms;
  -webkit-animation-iteration-count: infinite;
  -webkit-animation-timing-function: linear; //cubic-bezier(0.71, 0, 0.2, 1);
  -moz-animation-name: spin;
  -moz-animation-duration: 1000ms;
  -moz-animation-iteration-count: infinite;
  -moz-animation-timing-function: linear; //cubic-bezier(0.71, 0, 0.2, 1);
  -ms-animation-name: spin;
  -ms-animation-duration: 1000ms;
  -ms-animation-iteration-count: infinite;
  -ms-animation-timing-function: linear; //cubic-bezier(0.71, 0, 0.2, 1);

  animation-name: spin;
  animation-duration: 1000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear; //cubic-bezier(0.71, 0, 0.2, 1);
`;

export const LoadingSpinner = (props) => {
  return <SpinnerWrapper />;
};
