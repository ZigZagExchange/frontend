import React from "react";
import styled from "@xstyled/styled-components";
import Text from "components/atoms/Text/Text";

const ToggleButtonWrapper = styled.ul`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: ${({ theme }) => theme.colors.backgroundHighEmphasis};
  border: 1px solid ${({ theme }) => theme.colors.foreground300};
  border-radius: 12px;
  width: fit-content;
  padding: 4px;
`;

const ToggleItem = styled.li`
  display: block;
  width: ${({ width }) => width}px;
  border-radius: 8px;
  padding-top: ${({ size }) => (size === "sm" ? "4px" : "8px")};
  padding-bottom: ${({ size }) => (size === "sm" ? "4px" : "8px")};
  // padding-left: ${({ type }) => (type === "option" ? "16px" : "40.5px")};
  // padding-right: ${({ type }) => (type === "option" ? "16px" : "40.5px")};
  box-shadow: ${({ theme, show }) =>
    show ? theme.colors.gradientBtnBoxShadow : "unset"};
  text-align: center;
  text-transform: uppercase;
  user-select: none;
  cursor: pointer;
  background: ${({ show, theme, type, leftLabel, rightLabel }) =>
    show && type === "option"
      ? `linear-gradient(93.46deg, ${theme.colors.primaryHighEmphasis} 16.94%, ${theme.colors.secondaryHighEmphasis} 97.24%)`
      : show && leftLabel === "BUY"
      ? theme.colors.successHighEmphasis
      : show && rightLabel === "SELL"
      ? theme.colors.dangerHighEmphasis
      : "transparent"};
  opacity: 1;
  div {
    transition: color 0.25s;
  }

  &:hover div {
    color: ${({ show, theme, leftLabel }) =>
      !show
        ? `${theme.colors.primaryHighEmphasis} !important`
        : leftLabel
        ? `${theme.colors.backgroundHighEmphasis}`
        : `${theme.colors.foregroundHighEmphasis}`};
  }
  &:hover {
    opacity: 0.7;
  }
`;

const ToggleButton = ({ ...props }) => {
  const {
    type,
    leftLabel,
    size,
    width,
    rightLabel,
    selectedLayer = 1,
    toggleClick = () => {},
  } = props;

  return (
    <ToggleButtonWrapper {...props}>
      <ToggleItem
        onClick={() => toggleClick(1)}
        show={selectedLayer === 1}
        type={type}
        size={size}
        width={width}
        leftLabel={leftLabel}
      >
        <Text
          font="primaryBoldDisplay"
          color={
            selectedLayer === 1 && leftLabel === "BUY"
              ? "backgroundMediumEmphasis"
              : "foregroundHighEmphasis"
          }
          textAlign="center"
        >
          {leftLabel}
        </Text>
      </ToggleItem>
      <ToggleItem
        onClick={() => toggleClick(2)}
        show={selectedLayer === 2}
        type={type}
        size={size}
        width={width}
        rightLabel={rightLabel}
      >
        <Text
          font="primaryBoldDisplay"
          color="foregroundHighEmphasis"
          textAlign="center"
        >
          {rightLabel}
        </Text>
      </ToggleItem>
    </ToggleButtonWrapper>
  );
};

export default ToggleButton;
