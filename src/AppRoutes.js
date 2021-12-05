import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import TradePage from 'components/pages/TradePage/TradePage'
import BridgePage from 'components/pages/BridgePage/BridgePage'

const AppRoutes = () => {
  return (
    <>
      <Router>
        <Switch>
          <Route exact path="/" component={TradePage} />
          <Route exact path="/bridge" component={BridgePage} />
        </Switch>
      </Router>
    </>
  )
}

export default AppRoutes
