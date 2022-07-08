import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import Text from "components/atoms/Text/Text";
import { GenericModal } from "components/molecules/GenericModal";
import { Toggle } from "components/molecules/Toggle";
import { RestartIcon, EditIcon } from "components/atoms/Svg";
import {
  settingsSelector,
  resetUISettings,
  resetTradeLayout,
  setUISettings,
} from "lib/store/features/api/apiSlice";

const SettingModalWrapper = styled(GenericModal)`
  position: relative;
`;

const ModalHeader = styled.div`
  display: grid;
  grid-auto-flow: row;
  gap: 3px;
`;

const ResetAllSettingsWrapper = styled.div`
  display: inline-flex;
  gap: 7px;
  justify-content: end;
  svg path {
    fill: ${({ theme }) => theme.colors.primaryHighEmphasis};
  }
`;

const ActionWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 7px;
`;

const ActionsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: 10px;
  gap: 34px;
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.foreground400};
  margin: 15px 0px;
`;

const ModalBody = styled.div`
  display: grid;
  grid-auto-flow: row;
  gap: 17px;
`;

const ToggleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
`;

const SettingsModal = ({ onDismiss }) => {
  const settings = useSelector(settingsSelector);
  const [checked, setChecked] = useState(false);
  const toggle = () => setChecked(!checked);
  const dispatch = useDispatch();

  const resetSettings = () => {
    dispatch(resetUISettings());
  };

  const resetLayout = () => {
    dispatch(resetTradeLayout());
  };

  const editLayout = () => {
    dispatch(setUISettings({ key: "editable", value: !settings.editable }));
  };

  return (
    <SettingModalWrapper isOpened onClose={onDismiss}>
      <ModalHeader>
        <Text font="primaryHeading6" color="foregroundHighEmphasis">
          Settings
        </Text>
        <ActionsWrapper>
          <ActionWrapper onClick={editLayout}>
            <EditIcon />
            <Text
              font="primaryMediumBody"
              color="foregroundHighEmphasis"
              style={{ cursor: "pointer" }}
            >
              {settings.editable ? "Fix Layout" : "Edit Layout"}
            </Text>
          </ActionWrapper>
          <ActionWrapper onClick={resetLayout}>
            <RestartIcon />
            <Text
              font="primaryMediumBody"
              color="foregroundHighEmphasis"
              style={{ cursor: "pointer" }}
            >
              Reset Layout
            </Text>
          </ActionWrapper>
        </ActionsWrapper>
      </ModalHeader>
      <Divider />
      <ModalBody>
        <ToggleWrapper>
          <Toggle
            isChecked={settings.showCancelOrders}
            scale="md"
            onChange={toggle}
            settingKey="showCancelOrders"
          />
          <Text font="primarySmall" color="foregroundHighEmphasis">
            Enable Cancel All button on Open Orders tab
          </Text>
        </ToggleWrapper>
        <ToggleWrapper>
          <Toggle
            isChecked={settings.disableSlippageWarning}
            scale="md"
            onChange={toggle}
            settingKey="disableSlippageWarning"
          />
          <Text font="primarySmall" color="foregroundHighEmphasis">
            Disable high slippage warning
          </Text>
        </ToggleWrapper>
        <ToggleWrapper>
          <Toggle
            isChecked={settings.disableOrderBookFlash}
            scale="md"
            onChange={toggle}
            settingKey="disableOrderBookFlash"
          />
          <Text font="primarySmall" color="foregroundHighEmphasis">
            Disable orderbook and trade flashes
          </Text>
        </ToggleWrapper>
        <ToggleWrapper>
          <Toggle
            isChecked={settings.disableOrderNotification}
            scale="md"
            onChange={toggle}
            settingKey="disableOrderNotification"
          />
          <Text font="primarySmall" color="foregroundHighEmphasis">
            Disable order notifications (pending/placed/filled/cancelled)
          </Text>
        </ToggleWrapper>
        <ToggleWrapper>
          <Toggle
            isChecked={settings.disableTradeIDCard}
            scale="md"
            onChange={toggle}
            settingKey="disableTradeIDCard"
          />
          <Text font="primarySmall" color="foregroundHighEmphasis">
            Disable Trade ID card notification
          </Text>
        </ToggleWrapper>
        <ToggleWrapper>
          <Toggle
            isChecked={settings.hideAddress}
            scale="md"
            onChange={toggle}
            settingKey="hideAddress"
          />
          <Text font="primarySmall" color="foregroundHighEmphasis">
            Hide addresses
          </Text>
        </ToggleWrapper>
        <ToggleWrapper>
          <Toggle
            isChecked={settings.hideBalance}
            scale="md"
            onChange={toggle}
            settingKey="hideBalance"
          />
          <Text font="primarySmall" color="foregroundHighEmphasis">
            Hide balances
          </Text>
        </ToggleWrapper>
        <ToggleWrapper>
          <Toggle
            isChecked={settings.showNightPriceChange}
            scale="md"
            onChange={toggle}
            settingKey="showNightPriceChange"
          />
          <Text font="primarySmall" color="foregroundHighEmphasis">
            Show price change since midnight UTC instead of 24h change
          </Text>
        </ToggleWrapper>
        <ToggleWrapper>
          <Toggle
            isChecked={settings.stackOrderbook}
            scale="md"
            onChange={() => {
              toggle();
              dispatch(resetTradeLayout());
            }}
            settingKey="stackOrderbook"
          />
          <Text font="primarySmall" color="foregroundHighEmphasis">
            Stack orderbooks
          </Text>
        </ToggleWrapper>
        <ResetAllSettingsWrapper>
          <button
            className="flex float-right gap-2 hover:opacity-75"
            onClick={resetSettings}
          >
            <RestartIcon />
            <Text
              font="primaryMediumBody"
              color="primaryHighEmphasis"
              style={{ textDecoration: "underline", cursor: "pointer" }}
              textAlign="right"
            >
              Reset All Settings
            </Text>
          </button>
        </ResetAllSettingsWrapper>
      </ModalBody>
    </SettingModalWrapper>
  );
};

export default SettingsModal;
