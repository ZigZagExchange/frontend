import styled from 'styled-components';

import { Box } from '@material-ui/core';
import { CheckMarkCircleIcon } from 'components/atoms/Svg';
import Text from 'components/atoms/Text/Text';

const NotificationContainer = styled.div`
    display: none;
    margin-bottom: 2rem;
    padding: 22px;
    border-radius: 8px;
    background: ${(p) => p.theme.colors.successDisabled};

    .notification-icon {
        margin-right: 20px;
    }

    svg {
        width: 53px !important;
        height: 53px !important;
    }

    path {
        fill: ${(p) => p.theme.colors.successMediumEmphasis} !important;
    }
`

const ConnectNotification = () => {
    return (
        <NotificationContainer className="connect-notification">
            <Box className='notification-icon'>
                <CheckMarkCircleIcon />
            </Box>

            <Box className='notification-text'>
                <Text font='primaryHeading6' marginBottom='8px'>
                    Wallet Connected
                </Text>

                <Text font='primarySmall' style={{ display: 'block' }}>
                    Bridge your funds and activate your account and to <b>get started.</b>
                </Text>
            </Box>
        </NotificationContainer >
    )
}

export default ConnectNotification;