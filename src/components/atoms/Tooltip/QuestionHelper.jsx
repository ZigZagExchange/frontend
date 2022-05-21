import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { InfoIcon } from '../Svg'
import Tooltip from './Tooltip'

const QuestionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  border: none;
  background: none;
  outline: none;
  cursor: pointer;
  border-radius: 36px;
`

export default function QuestionHelper({ text }) {
  const [show, setShow] = useState(false)

  const open = () => setShow(!show)

  return (
    <Tooltip text={text} show={show}>
        <QuestionWrapper onClick={open}>
            <InfoIcon />
        </QuestionWrapper>
    </Tooltip>
  )
}
