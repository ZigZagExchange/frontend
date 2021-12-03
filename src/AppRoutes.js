import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Trade from 'components/pages/TradePage/TradePage'
import Bridge from 'components/pages/BridgePage/BridgePage'

const AppRoutes = () => {
  return (
    <>
      <Router>
        <Switch>
          <Route exact path="/" component={Trade} />
          <Route exact path="/bridge" component={Bridge} />
        </Switch>
      </Router>
    </>
  )
}

export default AppRoutes
