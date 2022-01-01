import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import TradePage from 'components/pages/TradePage/TradePage'
import BridgePage from 'components/pages/BridgePage/BridgePage'
import PoolPage from 'components/pages/PoolPage/PoolPage'
import ListPairPage from 'components/pages/ListPairPage/ListPairPage'

const AppRoutes = () => {
  return (
    <>
      <Router>
        <Switch>
          <Route exact path="/" component={TradePage} />
          <Route exact path="/bridge/:tab?" component={BridgePage} />
          <Route exact path="/pool" component={PoolPage} />
          <Route exact path="/list-pair" component={ListPairPage} />
        </Switch>
      </Router>
    </>
  )
}

export default AppRoutes
