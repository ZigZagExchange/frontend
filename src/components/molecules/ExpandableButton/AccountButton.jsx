import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { userSelector } from "lib/store/features/auth/authSlice";
import { settingsSelector } from "lib/store/features/api/apiSlice";
import { IconButton as baseIcon } from "../IconButton";
import { CaretUpIcon, CaretDownIcon } from "../../atoms/Svg";
import Text from "../../atoms/Text/Text";

const IconButton = styled(baseIcon)`
  background-color: transparent;
  padding: 0px;
  height: 32px;
`;

const AvatarImg = styled.img`
  border: 1px solid ${({ theme }) => theme.colors.foreground400};
  width: ${({ notext }) => (notext ? "23px" : "15px")};
  height: ${({ notext }) => (notext ? "23px" : "15px")};
  border-radius: 35px;
  margin-right: ${({ notext }) =>
    notext ? "0px !important" : "10px !important"};
`;

const AccountButton = ({ ...props }) => {
  const user = useSelector(userSelector);
  const settings = useSelector(settingsSelector);
  const { profile } = user;

  const { expanded, notext, onClick } = props;

  return user.address ? (
    <IconButton
      variant="secondary"
      onClick={onClick}
      startIcon={
        <AvatarImg notext={notext} src={profile.image} alt={profile.name} />
      }
      endIcon={expanded ? <CaretUpIcon /> : <CaretDownIcon />}
    >
      {notext ? null : (
        <Text font="primaryExtraSmallSemiBold" color="foregroundHighEmphasis">
          {settings.hideAddress ? "*****...*****" : profile.name}
        </Text>
      )}
    </IconButton>
  ) : null;
};

export default AccountButton;
