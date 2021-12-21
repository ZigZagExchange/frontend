import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import TradePage from 'components/pages/TradePage/TradePage'
import BridgePage from 'components/pages/BridgePage/BridgePage'
import SwapPage from 'components/pages/SwapPage/SwapPage'
import PoolPage from 'components/pages/PoolPage/PoolPage'

const AppRoutes = () => {
  return (
    <>
      <Router>
        <Switch>
          <Route exact path="/" component={TradePage} />
          <Route exact path="/bridge/:tab?" component={BridgePage} />
          <Route exact path="/swap/:tab?" component={SwapPage} />
          <Route exact path="/pool" component={PoolPage} />
        </Switch>
      </Router>
    </>
  )
}

export default AppRoutes
