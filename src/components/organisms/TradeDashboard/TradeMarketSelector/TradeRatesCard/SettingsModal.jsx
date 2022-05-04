import React, { useState } from 'react'
import styled from 'styled-components'
import Text from 'components/atoms/Text/Text'
import { GenericModal } from 'components/molecules/GenericModal'
import { Toggle } from 'components/molecules/Toggle'
import { RestartIcon, EditIcon } from 'components/atoms/Svg'


const SettingModalWrapper = styled(GenericModal)`
  position: relative;
`

const ModalHeader = styled.div`
  display: grid;
  grid-auto-flow: row;
  gap: 3px;
`

const ResetAllSettingsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 7px;
  svg path {
      fill : ${({ theme }) => theme.colors.primaryHighEmphasis};
  }
`

const ActionWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 7px;
`

const ActionsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 34px;
`

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.foreground400};
  margin: 20px 0px;
`

const ModalBody = styled.div`
  display: grid;
  grid-auto-flow: row;
  gap: 17px;
`

const ToggleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
`

const SettingsModal = ({ onDismiss }) => {
  const [checked, setChecked] = useState(false)
  const toggle = () => setChecked(!checked)
  
  return (
    <SettingModalWrapper isOpened onClose={onDismiss}>
      <ModalHeader>
        <Text font='primaryHeading6' color="foregroundHighEmphasis">Settings</Text>
        <ResetAllSettingsWrapper>
            <RestartIcon />
            <Text font='primaryMediumBody' color="primaryHighEmphasis" style={{textDecoration: 'underline', cursor: 'pointer'}}>Reset All Settings</Text>
        </ResetAllSettingsWrapper>
      </ModalHeader>
      <Divider />
      <ModalBody>
        <ActionsWrapper>
            <ActionWrapper>
                <RestartIcon />
                <Text font='primaryMediumBody' color="foregroundHighEmphasis" style={{cursor: 'pointer'}}>Reset Layout</Text>
            </ActionWrapper>
            <ActionWrapper>
                <EditIcon />
                <Text font='primaryMediumBody' color="foregroundHighEmphasis" style={{cursor: 'pointer'}}>Edit Layout</Text>
            </ActionWrapper>
        </ActionsWrapper>
        <ToggleWrapper>
            <Toggle isChecked scale="md" onChange={toggle} />
            <Text font='primarySmall' color="foregroundHighEmphasis">Show price change since midnight UTC instead of 24h change</Text>
        </ToggleWrapper>
        <ToggleWrapper>
            <Toggle scale="md" onChange={toggle} />
            <Text font='primarySmall' color="foregroundHighEmphasis">Cancel all orders button enabled</Text>
        </ToggleWrapper>
        <ToggleWrapper>
            <Toggle scale="md" onChange={toggle} />
            <Text font='primarySmall' color="foregroundHighEmphasis">Show notifications for fills</Text>
        </ToggleWrapper>
        <ToggleWrapper>
            <Toggle scale="md" onChange={toggle} />
            <Text font='primarySmall' color="foregroundHighEmphasis">Show order and trade sizes in USD</Text>
        </ToggleWrapper>
        <ToggleWrapper>
            <Toggle isChecked scale="md" onChange={toggle} />
            <Text font='primarySmall' color="foregroundHighEmphasis">Stack orderbooks</Text>
        </ToggleWrapper>
        <ToggleWrapper>
            <Toggle scale="md" onChange={toggle} />
            <Text font='primarySmall' color="foregroundHighEmphasis">Disable high slippage warning</Text>
        </ToggleWrapper>
        <ToggleWrapper>
            <Toggle isChecked scale="md" onChange={toggle} />
            <Text font='primarySmall' color="foregroundHighEmphasis">Disable orderbook and trade flashes</Text>
        </ToggleWrapper>
        <ToggleWrapper>
            <Toggle scale="md" onChange={toggle} />
            <Text font='primarySmall' color="foregroundHighEmphasis">Hide addresses</Text>
        </ToggleWrapper>
        <ToggleWrapper>
            <Toggle scale="md" onChange={toggle} />
            <Text font='primarySmall' color="foregroundHighEmphasis">Hide balances</Text>
        </ToggleWrapper>
      </ModalBody>
    </SettingModalWrapper>
  )
}

export default SettingsModal
