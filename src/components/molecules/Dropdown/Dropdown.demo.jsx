import React from "react";
import styled from 'styled-components'
import Dropdown from "./Dropdown";
import AccountDropdown from "./AccountDropdown";
import { DocumentIcon, FAQIcon, DiscordIcon, DeleteIcon } from '../../atoms/Svg'

const Row = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 15px;
  padding: 10px;
`
const data1 = [
    {text:'zkSync - Mainnet',url:'#'},
    {text:'zkSync - Rinkeby',url:'#'}
]
const data2 = [
    {text:'DOCS',url:'#', icon: <DocumentIcon />},
    {text:'FAQ',url:'#', icon: <FAQIcon />},
    {text:'LIVE SUPPORT',url:'#', icon: <DiscordIcon />}
]
const data3 = [
    {text:'0x83AD...83H4',url:'#', icon: <DeleteIcon />},
    {text:'0x12BV...b89G',url:'#', icon: <DeleteIcon />}
]

const DropdownDemo = () => {

  const clickItem = (text) => {
    alert(text)
  }

  return (
    <>
        <Row>
            <Dropdown width ={242} item={data1} context="Simple" clickFunction={clickItem}/>
            <Dropdown width ={242} item={data2} leftIcon context="Left Icon Dropdown" clickFunction={clickItem}/>
            <Dropdown width ={242} item={data3} rightIcon context="Right Icon Dropdown" clickFunction={clickItem}/>
            <AccountDropdown width ={242} item={data3} rightIcon clickFunction={clickItem}/>
        </Row>
    </>
  );
};

export default DropdownDemo;
