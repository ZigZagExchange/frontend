import React from "react";
import styled from "styled-components";
import Input from "./InputField";

const Row = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-gap: 15px;
`;

const InputFieldDemo = () => {
  return (
    <>
      <Row>
        <Input type="text" placeholder="Placeholder text" />
        <Input
          type="text"
          placeholder="Search for a token pair"
          label="Label"
        />
        <Input
          type="text"
          placeholder="Search for a token pair"
          label="Label"
          fontSize="12px"
        />
        <Input
          type="text"
          placeholder="Search for a token pair"
          label="Label"
          inline
        />
        <Input
          type="text"
          placeholder="Search for a token pair"
          label="Label"
          fontSize="12px"
          inline
        />
        <Input
          type="text"
          placeholder="Search for a token pair"
          icon="search"
        />
        <Input
          type="text"
          placeholder="Search for a token pair"
          label="Label"
          icon="search"
        />
        <Input
          type="text"
          placeholder="Search for a token pair"
          label="Label"
          fontSize="12px"
          icon="search"
        />
        <Input
          type="text"
          placeholder="Search for a token pair"
          label="Label"
          inline
          icon="search"
        />
        <Input
          type="text"
          placeholder="Search for a token pair"
          label="Label"
          fontSize="12px"
          inline
          icon="search"
        />
      </Row>
    </>
  );
};

export default InputFieldDemo;
