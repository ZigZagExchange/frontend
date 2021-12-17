import { useSelector } from 'react-redux'
import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import TradePage from 'components/pages/TradePage/TradePage'
import BridgePage from 'components/pages/BridgePage/BridgePage'
import PoolPage from 'components/pages/PoolPage/PoolPage'
import { networkSelector } from 'lib/store/features/api/apiSlice'
import api from 'lib/api'

const AppRoutes = () => {
  // persist login across sessions
  const network = useSelector(networkSelector)
  if (localStorage.getItem("zksync:seed") && api.isZksyncChain(network)) {
    api.signIn(network);
  }

  return (
    <>
      <Router>
        <Switch>
          <Route exact path="/" component={TradePage} />
          <Route exact path="/bridge/:tab?" component={BridgePage} />
          <Route exact path="/pool" component={PoolPage} />
        </Switch>
      </Router>
    </>
  )
}

export default AppRoutes
