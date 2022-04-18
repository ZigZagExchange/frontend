import React from "react";
import styled from "styled-components";
import { IconButton as baseIcon } from "../IconButton";
import { CaretUpIcon, CaretDownIcon } from '../../atoms/Svg'
import Text from '../../atoms/Text/Text'

const IconButton = styled(baseIcon)`
    background-color: ${({ theme, transparent }) => transparent ? 'transparent' : theme.colors.foreground300};
	padding: ${({ transparent }) => transparent ? '0px' : '8px 16px'};
	height: 32px;
	justify-content: space-between;
`


const ExpandableButton = ({ ...props }) => {

	const { expanded, transparent, children, onClick } = props

	return (
		<IconButton variant="secondary" transparent={transparent} onClick={onClick} endIcon={expanded ? <CaretUpIcon /> : <CaretDownIcon />}>
			<Text font="primaryExtraSmallSemiBold" color="foregroundHighEmphasis">{children}</Text>
		</IconButton>
	)
}

export default ExpandableButton;
