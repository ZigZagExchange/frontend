import React from "react";
import styled from "styled-components";
import { DefaultTemplate } from "../../templates/DefaultTemplate";
import Pane from "../../atoms/Pane/Pane";
import TextDemo from "../../atoms/Text/Text.demo";
import SvgDemo from "../../atoms/Svg/Svg.demo";
import ButtonDemo from "../../molecules/Button/Button.demo";
import InputFieldDemo from "../../atoms/InputField/InputField.demo";
import CheckBoxDemo from "../../atoms/CheckBox/CheckBox.demo";
import ToggleDemo from "../../molecules/Toggle/Toggle.demo";
import DropdownDemo from "../../molecules/Dropdown/Dropdown.demo";
import TabMenuDemo from "../../molecules/TabMenu/TabMenu.demo";
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
`;

const DSLSpan = styled.span`
  font-size: 24px;
  margin-bottom: 3px;
  margin-top: 5px;
`;

const DSLItemsWrapper = styled.div`
  display: grid;
  grid-auto-flow: row;
  gap: 6px;
`;

const DSLItemTitle = styled.div`
  font-size: 18px;
`;

const DSLPage = () => {
  return (
    <DefaultTemplate>
      <div style={{ minHeight: "calc(100vh - 56px)" }}>
        <DSLWrapper>
          <DSLSpan>DSL</DSLSpan>
          <DSLItemsWrapper>
            <DSLItem title={"Text Demo"}>
              <TextDemo />
            </DSLItem>
            <DSLItem title={"Button Demo"}>
              <ButtonDemo />
            </DSLItem>
            <DSLItem title={"Svg Icons Demo"}>
              <SvgDemo />
            </DSLItem>
            <DSLItem title={"Input Demo"}>
              <InputFieldDemo />
            </DSLItem>
            <DSLItem title={"CheckBox Demo"}>
              <CheckBoxDemo />
            </DSLItem>
            <DSLItem title={"Toggle Demo"}>
              <ToggleDemo />
            </DSLItem>
            <DSLItem title={"Dropdown Demo"}>
              <DropdownDemo />
            </DSLItem>
            <DSLItem title={"TabMenu Demo"}>
              <TabMenuDemo />
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
