import React from "react";
import styled from "styled-components";
import { IconButton as baseIcon } from "../IconButton";
import { CaretUpIcon, CaretDownIcon } from '../../atoms/Svg'
import Text from '../../atoms/Text/Text'

const IconButton = styled(baseIcon)`
    background-color: ${({ theme }) => theme.colors.foreground300};
	padding: 8px 16px;
	height: 32px;
`


const ExpandableButton = ({ ...props }) => {

	const { expanded, children, onClick } = props

	return (
		<IconButton variant="secondary" onClick={onClick} endIcon={expanded ? <CaretUpIcon /> : <CaretDownIcon />}>
			<Text font="primaryExtraSmallSemiBold" color="foregroundHighEmphasis">{children}</Text>
		</IconButton>
	)
}

export default ExpandableButton;
