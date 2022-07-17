import React, { useState } from "react";
import styled from "styled-components";
import TabMenu from "./TabMenu";
import Tab from "./Tab";
import { ExternalLinkIcon } from "components/atoms/Svg";

const Row = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 15px;
  padding: 10px;
`;

const TabMenuDemo = () => {
  const [index, setIndex] = useState(0);
  const handleClick = (newIndex) => setIndex(newIndex);

  return (
    <>
      <Row>
        <TabMenu activeIndex={index} onItemClick={handleClick}>
          <Tab>TRADE</Tab>
          <Tab>BRIDGE</Tab>
          <Tab>LIST PAIR</Tab>
          <Tab>
            DOCS
            <ExternalLinkIcon size={12} />
          </Tab>
        </TabMenu>
      </Row>
    </>
  );
};

export default TabMenuDemo;
