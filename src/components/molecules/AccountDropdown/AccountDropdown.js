import React, { useState, useEffect } from 'react'
import styled, { css } from '@xstyled/styled-components'
import { useSelector } from 'react-redux'
import { userSelector } from 'lib/store/features/auth/authSlice'

const DropdownDisplay = styled.div`
    position: absolute;
    z-index: 99;
    border-radius: 8px;
    transition: all 0.2s ease-in-out;
    box-shadow: 0 10px 20px 10px rgba(0, 0, 0, 0.3);
    margin-top: 10px;
    width: 360px;
    height: 400px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(4px);
    top: 100%;
    right: 0;
    transform: translateY(20px);
    opacity: 0;
    pointer-events: none;
`

const DropdownButton = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 78px;
    transition: all 0.12s ease-in-out;
    color: rgba(255, 255, 255, 0.4);
    background: rgba(0, 0, 0, 0.5);
    user-select: none;
    cursor: pointer;
    font-weight: bold;
    padding: 0 16px;
    &:focus { outline: 0; }

    &:hover {
        background: rgba(0, 0, 0, 0.9);
        color: rgba(255, 255, 255, 0.6);
    }
`

const AvatarImg = styled.img`
    width: 26px;
    height: 26px;
    border-radius: 35px;
    margin-right: 10px;
`


const DropdownContainer = styled.div`
    position: relative;

    ${props => props.show && css`
        ${DropdownDisplay} {
            pointer-events: all;
            transform: translateY(0);
            opacity: 1;
        }
    `}
`

const DropdownHeader = styled.h3`
    font-size: 16px;
    padding: 20px;
    color: #3F4B6A;
    text-shadow: 1px 1px 1px #eee;
`

export const AccountDropdown = () => {
    const user = useSelector(userSelector)
    const [show, setShow] = useState(false)
    const { profile } = user

    useEffect(() => {
        const hideDisplay = () => setShow(false)
        document.addEventListener('click', hideDisplay, false)
        return () => {
            document.removeEventListener('click', hideDisplay)
        }
    }, [])

    const handleKeys = e => {
        if(~[32, 13, 27].indexOf(e.which)) {
            e.preventDefault()
            setShow(!show)
        }
    }

    return (
        <DropdownContainer onKeyDown={handleKeys} onClick={e => e.stopPropagation()} show={show} tabIndex="0">
            <DropdownButton onClick={() => setShow(!show)} tabIndex="0">
                <AvatarImg src={profile.image} alt={profile.name} />
                {profile.name}
            </DropdownButton>
            <DropdownDisplay>
                <DropdownHeader>
                    Your Wallet
                </DropdownHeader>
            </DropdownDisplay>
        </DropdownContainer>
    )
}