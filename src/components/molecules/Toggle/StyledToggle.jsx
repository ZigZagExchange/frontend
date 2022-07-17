import styled from "styled-components";
import { scales } from "./types";

const scaleKeyValues = {
  sm: {
    handleWidth: "18px",
    handleTop: "-2px",
    checkedLeft: "calc(100% - 14px)",
    toggleHeight: "14px",
    toggleWidth: "30px",
  },
  md: {
    handleWidth: "20px",
    handleTop: "-2px",
    checkedLeft: "calc(100% - 16px)",
    toggleHeight: "16px",
    toggleWidth: "40px",
  },
  lg: {
    handleWidth: "22px",
    handleTop: "-2px",
    checkedLeft: "calc(100% - 18px)",
    toggleHeight: "18px",
    toggleWidth: "50px",
  },
};
const getScale =
  (property) =>
  ({ scale = scales.MD }) => {
    return scaleKeyValues[scale][property];
  };

export const ToggleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export const Handle = styled.div`
  background: ${({ theme, isChecked }) =>
    !isChecked ? theme.colors.foreground500 : theme.colors.primaryHighEmphasis};
  border-radius: 50%;
  cursor: pointer;
  height: ${getScale("handleWidth")};
  left: ${({ isChecked }) => (!isChecked ? "0px" : getScale("checkedLeft"))};
  top: ${getScale("handleTop")};
  position: absolute;
  transition: left 200ms ease-in;
  width: ${getScale("handleWidth")};
  z-index: 1;
`;

export const Input = styled.input`
  cursor: pointer;
  opacity: 0;
  height: 100%;
  position: absolute;
  width: 100%;
  z-index: 3;

  // &:checked + ${Handle} {
  //   left: ${getScale("checkedLeft")};
  // }
`;

const StyledToggle = styled.div`
  align-items: center;
  background-color: ${({ theme, isChecked }) =>
    !isChecked ? theme.colors.foreground500 : theme.colors.primaryLowEmphasis};
  border-radius: 40px;
  cursor: pointer;
  height: ${getScale("toggleHeight")};
  position: relative;
  transition: background-color 200ms;
  width: ${getScale("toggleWidth")};
  border-image-slice: 0;
`;

export default StyledToggle;
