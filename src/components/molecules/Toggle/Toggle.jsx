import React, { useState } from "react";
import StyledToggle, { Input, Handle, ToggleWrapper } from "./StyledToggle";
import { scales } from "./types";
import Text from '../../atoms/Text/Text'

const Toggle = ({ isChecked = false, scale = scales.MD, font = "primarySmall", leftLabel, rightLabel, ...props }) => {
  const [checked, setChecked] = useState(isChecked)
  const toggle = (e) => {
    props.onChange(e);
    setChecked(!checked)
  }
  return (
    <ToggleWrapper>
      {leftLabel && <Text font={font} color={leftLabel && rightLabel && !checked ? 'foregroundDisabled' : 'foregroundHighEmphasis'}>{leftLabel}</Text>}
      <StyledToggle isChecked={checked} scale={scale}>
        <Input scale={scale} {...props} type="checkbox" onChange={toggle} />
        <Handle scale={scale} isChecked={checked} />
      </StyledToggle>
      {rightLabel && <Text font={font} color={leftLabel && rightLabel && checked ? 'foregroundDisabled' : 'foregroundHighEmphasis'}>{rightLabel}</Text>}
    </ToggleWrapper>
  );
};

export default Toggle;