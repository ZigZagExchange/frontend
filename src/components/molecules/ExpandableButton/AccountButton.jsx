import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { userSelector } from "lib/store/features/auth/authSlice";
import { IconButton as baseIcon } from "../IconButton";
import { CaretUpIcon, CaretDownIcon } from '../../atoms/Svg'
import Text from '../../atoms/Text/Text'

const IconButton = styled(baseIcon)`
    background-color: transparent;
	padding: 8px 16px;
	height: 32px;
`

const AvatarImg = styled.img`
    border: 1px solid ${({ theme }) => theme.colors.foreground400};
    width: 15px;
    height: 15px;
    border-radius: 35px;
    margin-right: 10px;
`;

const AccountButton = ({ ...props }) => {
    const user = useSelector(userSelector);
    const { profile } = user;

	const { expanded, onClick } = props

	return (
		user.id && user.address ? <IconButton variant="secondary" onClick={onClick} startIcon={<AvatarImg src={profile.image} alt={profile.name} />} endIcon={expanded ? <CaretUpIcon /> : <CaretDownIcon />}>
			<Text font="primaryExtraSmallSemiBold" color="foregroundHighEmphasis">{profile.name}</Text>
		</IconButton> : null
	)
}

export default AccountButton;
