import React, { useEffect, useState } from "react";
import styled from 'styled-components'
import Toggle from "./Toggle";

const Row = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 15px;
  padding: 10px;
`

const ToggleDemo = () => {
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        console.log(checked)
    }, [checked])
  
    const toggle = () => setChecked(!checked)

  return (
    <>
        <Row>
            <Toggle scale="md" onChange={toggle} />
            <Toggle scale="md" leftLabel="Label" onChange={toggle} />
            <Toggle scale="md" rightLabel="Label" onChange={toggle} />
            <Toggle scale="md" leftLabel="OFF" rightLabel="ON" onChange={toggle} />
        </Row>
    </>
  );
};

export default ToggleDemo;
