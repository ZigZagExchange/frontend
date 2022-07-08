import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import StyledToggle, { Input, Handle, ToggleWrapper } from "./StyledToggle";
import { scales } from "./types";
import Text from "../../atoms/Text/Text";
import { setUISettings } from "lib/store/features/api/apiSlice";

const Toggle = ({
  isChecked = false,
  scale = scales.MD,
  font = "primarySmall",
  leftLabel,
  rightLabel,
  settingKey,
  ...props
}) => {
  const [checked, setChecked] = useState(isChecked);
  const dispatch = useDispatch();

  useEffect(() => {
    setChecked(isChecked);
  }, [isChecked]);

  const toggle = (e) => {
    props.onChange(e);

    if (settingKey !== undefined) {
      dispatch(setUISettings({ key: settingKey, value: !checked }));
    }

    setChecked(!checked);
  };

  return (
    <ToggleWrapper>
      {leftLabel && (
        <Text
          font={font}
          color={
            leftLabel && rightLabel && !checked
              ? "foregroundDisabled"
              : "foregroundHighEmphasis"
          }
        >
          {leftLabel}
        </Text>
      )}
      <StyledToggle isChecked={checked} scale={scale}>
        <Input scale={scale} {...props} type="checkbox" onChange={toggle} />
        <Handle scale={scale} isChecked={checked} />
      </StyledToggle>
      {rightLabel && (
        <Text
          font={font}
          color={
            leftLabel && rightLabel && checked
              ? "foregroundDisabled"
              : "foregroundHighEmphasis"
          }
        >
          {rightLabel}
        </Text>
      )}
    </ToggleWrapper>
  );
};

export default Toggle;
