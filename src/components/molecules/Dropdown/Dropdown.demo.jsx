import React, { useState } from "react";
import styled from "styled-components";
import Dropdown from "./Dropdown";
import AccountDropdown from "./AccountDropdown";
import {
  DocumentIcon,
  FAQIcon,
  DiscordIcon,
  DeleteIcon,
} from "../../atoms/Svg";

const Row = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 15px;
  padding: 10px;
`;
const data1 = [
  { text: "zkSync - Mainnet", value: 1, url: "#" },
  { text: "zkSync - Rinkeby", value: 1000, url: "#" },
];
const data2 = [
  { text: "DOCS", url: "#", icon: <DocumentIcon /> },
  { text: "FAQ", url: "#", icon: <FAQIcon /> },
  { text: "LIVE SUPPORT", url: "#", icon: <DiscordIcon /> },
];
const data3 = [
  { text: "0x83AD...83H4", url: "#", icon: <DeleteIcon /> },
  { text: "0x12BV...b89G", url: "#", icon: <DeleteIcon /> },
];

const DropdownDemo = () => {
  const [context1, setContext1] = useState(data1[0].text);
  const [context2, setContext2] = useState(data2[0].text);
  const [context3, setContext3] = useState(data3[0].text);
  const clickItem1 = (text) => {
    setContext1(text);
  };
  const clickItem2 = (text) => {
    setContext2(text);
  };
  const clickItem3 = (text) => {
    setContext3(text);
  };
  const clickItem4 = (text) => {
    alert(text);
  };

  return (
    <>
      <Row>
        <Dropdown
          width={242}
          item={data1}
          context={context1}
          clickFunction={clickItem1}
        />
        <Dropdown
          width={242}
          item={data2}
          leftIcon
          context={context2}
          clickFunction={clickItem2}
        />
        <Dropdown
          width={242}
          item={data3}
          rightIcon
          context={context3}
          clickFunction={clickItem3}
        />
        <AccountDropdown
          width={242}
          item={data3}
          rightIcon
          clickFunction={clickItem4}
        />
      </Row>
    </>
  );
};

export default DropdownDemo;
