import React from "react";
import styled from "@xstyled/styled-components";
import api from "lib/api";

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: transparent;
  border-radius: 10px;
  padding: 10px;
  border: 1px solid rgba(255,255,255,0.2);
  position: relative;
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  

  &:hover{
    border: 1px solid rgba(255,255,255,0.4);
  }

  input,
  input:focus {
    font-family: 'Iceland', sans-serif;
    width: calc(100% - 148px);
    height: 30px;
    background: transparent;
    padding: 10px;
    font-size: 28px;
    border: none;
    outline: none;
    text-align: right;
    -webkit-appearance: none;
    appearance: none;
    color: #fff;
  }

  .maxLink {
    color: #69f;
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    user-select: none;
    text-decoration: none;

    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }
  }

  .leftGroup {
    min-width: 100px;
    font-size: 16px;
    font-weight: bold;
  }
`;

const BalanceText = styled.div`
  margin: 5px 11px 10px 0px;
  text-align: right;
  color: rgba(250,250,250,0.5);
  font-family: monospace;
`

const PoolModalInput = (props) => {
  

  return (
    <>
    <InputContainer>
      <div className="leftGroup">
        <img src={api.currencies[props.currency].image.default} alt={props.currency.name}  className="pool_token_image"/> {props.currency}
      </div>
      <input placeholder="0.00" type="text" />
      <a className="maxLink" href="#max">
        Max
      </a>
    </InputContainer>
    <BalanceText>Balance: {props.balance}</BalanceText>
    </>
  );
};

export default PoolModalInput;
