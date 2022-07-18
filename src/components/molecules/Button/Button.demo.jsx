import React from "react";
import { FaPlus, FaCaretRight } from "react-icons/fa";
import styled from "styled-components";
import Button from "./Button";
import { scales, variants } from "./types";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
const Row = styled.div`
  display: flex;
  flex-direction: row;
  padding: 5px;
`;

const ButtonDemo = () => {
  return (
    <>
      <Container>
        {Object.values(variants).map((variant) => {
          return (
            <Row key={variant}>
              {Object.values(scales).map((scale) => {
                return (
                  <Button key={scale} variant={variant} scale={scale} mr="8px">
                    {variant === "buy"
                      ? "BUY"
                      : variant === "sell"
                      ? "SELL"
                      : "CONNECT WALLET"}
                  </Button>
                );
              })}
            </Row>
          );
        })}
        <Row>
          <Button startIcon={<FaPlus />} variant="primary" scale="imd" mr="8px">
            CONNECT WALLET
          </Button>
          <Button
            endIcon={<FaCaretRight />}
            variant="primary"
            scale="imd"
            mr="8px"
          >
            CONNECT WALLET
          </Button>
        </Row>
        <Row>
          <Button mr="8px" disabled isLoading={true}>
            CONNECT WALLET
          </Button>
          <Button variant="outlined" mr="8px" disabled>
            CONNECT WALLET
          </Button>
          <Button variant="buy" mr="8px" width="127px" disabled>
            BUY
          </Button>
          <Button variant="sell" width="127px" disabled>
            SELL
          </Button>
        </Row>
      </Container>
    </>
  );
};

export default ButtonDemo;
