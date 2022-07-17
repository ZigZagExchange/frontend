import React from "react";
import styled from "styled-components";
import CheckBox from "./CheckBox";

const Row = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-gap: 15px;
`;

const Col = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 15px;
`;

const CheckBoxDemo = () => {
  const handleChange = (val) => {
    console.log("ValueChanged: ".concat(val));
  };
  return (
    <Col>
      <Row>
        <CheckBox Size="Medium" onChange={handleChange}></CheckBox>
        <CheckBox Size="Medium" onChange={handleChange} isChecked></CheckBox>
      </Row>
      <Row>
        <CheckBox Size="Medium" onChange={handleChange} labelLeft>
          Label Left
        </CheckBox>
        <CheckBox Size="Medium" onChange={handleChange} labelLeft isChecked>
          Label Left
        </CheckBox>
      </Row>
      <Row>
        <CheckBox Size="Medium" onChange={handleChange} labelRight>
          Label Right
        </CheckBox>
        <CheckBox Size="Medium" onChange={handleChange} labelRight isChecked>
          Label Right
        </CheckBox>
      </Row>
    </Col>
  );
};

export default CheckBoxDemo;
