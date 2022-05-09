import React from 'react'

import ListBox from 'components/atoms/ListBox'

const networkLists = [
    {id: 1, name:'zkSync - Mainnet', value: 1, url:'#'},
    {id: 2, name:'zkSync - Rinkeby', value: 1000, url:'#'}
  ]

const NetworkSelection = ({className}) => {
  return (
    <div className={className}>
        <ListBox options= {networkLists} />
    </div>
  )
}

export default NetworkSelection