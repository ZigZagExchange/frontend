import React from "react";
import styled from "styled-components";
import { DefaultTemplate } from "../../templates/DefaultTemplate";
import Pane from "../../atoms/Pane/Pane";
import FormDemo from "../../atoms/Form/Form.demo";
import TooltipDemo from "../../atoms/Tooltip/Tooltip.demo";
import RadioButtonsDemo from "../../atoms/RadioButtons/RadioButtons.demo";
import TextDemo from "../../atoms/Text/Text.demo";
import { Button } from "../../atoms/Form/Submit";
import { toast } from "react-toastify";

const DSLWrapper = styled.div`
  height: 100%;
  padding: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${(p) => p.theme.colors.backgroundHighEmphasis};
  color: white;
`

const DSLSpan = styled.span`
  font-size: 24px;
  margin-bottom: 3px;
  margin-top: 5px;
`

const DSLItemsWrapper = styled.div`
  display: grid;
  grid-auto-flow: row;
  gap: 6px;
`

const DSLItemTitle = styled.div`
  font-size: 18px;
`

const DSLPage = () => {
  return (
    <DefaultTemplate>
      <div style={{ minHeight: "calc(100vh - 48px)" }}>
        <DSLWrapper>
          <DSLSpan>
            DSL
          </DSLSpan>
          <DSLItemsWrapper>
            <DSLItem title={"Form"}>
              <FormDemo />
            </DSLItem>
            <DSLItem title={"Tooltip"}>
              <TooltipDemo />
            </DSLItem>
            <DSLItem title={"Radio Buttons"}>
              <RadioButtonsDemo />
            </DSLItem>
            <DSLItem title={"Text Demo"}>
              <TextDemo />
            </DSLItem>
            <DSLItem title={"Toast"}>
              <Button
                variant={"secondary"}
                onClick={() => toast.success("🍞🍞🍞", { closeOnClick: false })}
              >
                Success
              </Button>
            </DSLItem>
          </DSLItemsWrapper>
        </DSLWrapper>
      </div>
    </DefaultTemplate>
  );
};

const DSLItem = ({ title, children }) => {
  return (
    <Pane size={"sm"} variant={"dark"} w={"lg"}>
      <DSLItemTitle>{title}</DSLItemTitle>
      {children && children}
    </Pane>
  );
};

export default DSLPage;
