import React from "react";
import styled from 'styled-components'
import CheckBox from "./CheckBox";

const Row = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-gap: 15px;
`

const CheckBoxDemo = () => {
    const handleChange = (val) => {
        console.log("ValueChanged: ".concat(val))
    }
  return (
    <>
        <Row>
			<CheckBox Size="Medium" onChange={handleChange}></CheckBox>
			<CheckBox Size="Medium" onChange={handleChange} isChecked></CheckBox>
			<CheckBox Size="Medium" onChange={handleChange} labelLeft>Label</CheckBox>
			<CheckBox Size="Medium" onChange={handleChange} labelLeft isChecked>Label</CheckBox>
			<CheckBox Size="Medium" onChange={handleChange} labelRight>Label</CheckBox>
			<CheckBox Size="Medium" onChange={handleChange} labelRight isChecked>Label</CheckBox>
        </Row>
    </>
  );
};

export default CheckBoxDemo;
