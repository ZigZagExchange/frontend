import React, { useEffect, useState } from "react";
import styled from 'styled-components'
import Toggle from "./Toggle";
import useTheme from "../../hooks/useTheme"
import ToggleTheme from "./ToggleTheme";
import ToggleButton from "./ToggleButton";

const Row = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 15px;
  padding: 10px;
  align-items: center;
`

const ToggleDemo = () => {
    const [checked, setChecked] = useState(false)
    const [selectedLayer, setSelectedLayer] = useState(2);
    const { isDark, toggleTheme } = useTheme()

    useEffect(() => {
        console.log(checked)
    }, [checked])
  
    const toggle = () => setChecked(!checked)

    const toggleClick = (num) => setSelectedLayer(num)

  return (
    <>
        <Row>
            <Toggle scale="md" onChange={toggle} />
            <Toggle scale="md" leftLabel="Label" onChange={toggle} />
            <Toggle scale="md" rightLabel="Label" onChange={toggle} />
            <Toggle scale="md" leftLabel="OFF" rightLabel="ON" onChange={toggle} />
            <ToggleTheme isDark={isDark} toggleTheme={toggleTheme} />
        </Row>
        <Row>
            <ToggleButton type="option" size="sm" leftLabel="l1" rightLabel="l2" />
            <ToggleButton type="option" size="sm" leftLabel="Option 1" rightLabel="Option 2" />
            <ToggleButton size="sm" leftLabel="BUY" rightLabel="SELL" />
        </Row>
        <Row>
            <ToggleButton type="option" leftLabel="l1" rightLabel="l2" />
            <ToggleButton type="option" leftLabel="Option1" rightLabel="Option2" />
            <ToggleButton leftLabel="BUY" rightLabel="SELL" selectedLayer={selectedLayer} toggleClick={toggleClick} />
        </Row>
    </>
  );
};

export default ToggleDemo;
