import React, { useState, cloneElement, isValidElement, useRef } from 'react'
import styled from 'styled-components'
import { ExpandableButton } from '../ExpandableButton'
import { IconButton as baseIcon } from "../IconButton";
import Text from '../../atoms/Text/Text'
import { HideMenuOnOutsideClicked } from 'lib/utils'

const DropdownWrapper = styled.div`
    position: relative;

    &.size-wide {
        position: static;
    }

    &:hover {
        .button-title {
            color: ${({ theme }) => `${theme.colors.primaryHighEmphasis} !important`};
            // transition: color .25s;
        }
        
        svg path {
            fill: ${({ theme }) => `${theme.colors.primaryHighEmphasis} !important`};
            // transition: color .25s;
        }
    }

`

export const Wrapper = styled.div`
    position: absolute;
    // min-width: ${({ width }) => `${width}px`};
    width: 100%;
    background-color: ${({ theme }) => theme.colors.backgroundMediumEmphasis};
    border: 1px solid ${({ theme }) => theme.colors.foreground400};
    box-shadow: 0px 8px 16px 0px #0101011A;
    backdrop-filter: blur(8px);
    padding: 8px 0;
    border-radius: 8px;
    display: grid;
    // gap: 10px;
    align-items: start;
    z-index: 100;

    &.side-dropdown {
        padding: 8px 0;
        gap: 0;
    }

    &.lang-dropdown {
        margin-left: -8px;
        gap: 0;
        width: auto;
    }
`

const DropdownListContainer = styled.div`
    display: grid;
    // grid-auto-flow: column;
    // height: 31px;
    align-items: center;
    grid-template-columns: ${({ leftIcon }) => leftIcon ? '32px 1fr' : '1fr 16px'};
    cursor: pointer;

    &:hover, &.active {
        background-color: ${({ theme }) => theme.colors.backgroundLowEmphasis}
    }

    &.side-dropdown {
        padding: 8px 1rem;
    }

    &.lang-dropdown {
        padding: 8px 0px 8px 14px;
    }

    &.network-dropdown {
        display: flex;
        width: 100%;
        padding: 8px 10px;
        align-items: center;
    }
`

const IconButton = styled(baseIcon)`
    width: 24px;
    height: 24px;
    background: transparent;
    border-radius: 9999px;
    padding: 0px !important;
    svg {
        margin-right: 0px !important;
        margin-left: 0px !important;
    }

    &:not(.network-dropdown) {
        border: 1px solid ${({ theme }) => theme.colors.foreground400};
    }

    &.network-dropdown path {
        fill: ${(p) => p.theme.colors.foregroundHighEmphasis};
    }
`

const Dropdown = ({ width, item, context, leftIcon, rightIcon, transparent, clickFunction, isMobile = false, adClass = ""}) => {
    const [isOpened, setIsOpened] = useState(false)
    const wrapperRef = useRef(null)

    HideMenuOnOutsideClicked(wrapperRef, setIsOpened)

    const toggle = () => {
        setIsOpened(!isOpened)
    }

    const handleClick = (url, text, value) => {
        if (url !== '#') {
            window.location.href = url
        } else {
            clickFunction(text, value)
            toggle()
        }
    }

    return (
        <DropdownWrapper ref={wrapperRef} className={adClass}>
            <ExpandableButton width={width} transparent={transparent} expanded={isOpened} onClick={toggle}>{context}</ExpandableButton>
            {isOpened &&
                <Wrapper width={width} className={`${adClass} ${isMobile ? "mobile-mode" : ""}`} >
                    {item.map((items) => {
                        const { text, value, url, icon, selectedIcon, iconSelected } = items
                        const menuIcon = iconSelected ? selectedIcon : icon;
                        return (
                            <DropdownListContainer className={`${adClass} ${iconSelected ? "active" : ""}`} key={items.text} leftIcon={leftIcon} onClick={() => handleClick(url, text, value)}>
                                {/* {leftIcon && isValidElement(menuIcon) && <IconButton className={adClass} variant="secondary" startIcon={cloneElement(menuIcon)}></IconButton>} */}
                                <Text font="primaryExtraSmallSemiBold" color="foregroundHighEmphasis" className={!iconSelected ? "selected-icon" : ""}>
                                    {items.image != "" ? <img src={items.image} style={{width: 14, height: 14, borderRadius: "50%"}} /> : null}
                                    {text}
                                </Text>
                                {/* {rightIcon && isValidElement(menuIcon) && <IconButton className={adClass} variant="secondary" endIcon={cloneElement(menuIcon)}></IconButton>} */}
                            </DropdownListContainer>
                        )
                    })}
                </Wrapper>
            }
        </DropdownWrapper >
    )
}

export default Dropdown