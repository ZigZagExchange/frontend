import React from "react";
import styled from "styled-components";
import { IconButton as baseIcon } from "../IconButton";
import { CaretUpIcon, CaretDownIcon } from "../../atoms/Svg";
import Text from "../../atoms/Text/Text";

const IconButton = styled(baseIcon)`
  background-color: ${({ theme, transparent }) =>
    transparent ? "transparent" : theme.colors.foreground300};
  padding: ${({ transparent }) => (transparent ? "0px" : "8px 16px")};
  height: 32px;
  max-width: ${({ width }) => width}px;
  width: 100%;
  justify-content: ${({ transparent }) =>
    transparent ? "flex-start" : "space-between"};
`;

const CustomText = styled(Text)`
  white-space: nowrap;
`;

const ExpandableButton = ({ ...props }) => {
  const { expanded, transparent, children, width, onClick } = props;

  return (
    <IconButton
      width={width}
      variant="secondary"
      transparent={transparent}
      onClick={onClick}
      endIcon={expanded ? <CaretUpIcon /> : <CaretDownIcon />}
    >
      <CustomText
        font="primaryMediumSmallSemiBold"
        color="foregroundHighEmphasis"
        className="button-title"
      >
        {children}
      </CustomText>
    </IconButton>
  );
};

export default ExpandableButton;
