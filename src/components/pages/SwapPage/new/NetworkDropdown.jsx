import React, {useState} from 'react'

import {NetworkDropDownLabel} from './StyledComponents'
import Dropdown from 'components/molecules/Dropdown/Dropdown'
import { InfoIcon } from "components/atoms/Svg";
const NetworkDropdown = () => {

    const data1 = [
        {text:'zkSync - Mainnet', value: 1, url:'#'},
        {text:'zkSync - Rinkeby', value: 1000, url:'#'}
    ]
    const [context1, setContext1] = useState(data1[0].text)
  const clickItem1 = (text) => {
    setContext1(text)
  }
  return (
    <>
        <NetworkDropDownLabel>
            <p>Network</p>
            <InfoIcon size={16} />
        </NetworkDropDownLabel>
        <Dropdown width ={242} item={data1} context={context1} clickFunction={clickItem1}/> 
    </>
  )
}

export default NetworkDropdown