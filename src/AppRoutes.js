import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import TradePage from "components/pages/TradePage/TradePage";
import BridgePage from "components/pages/BridgePage/BridgePage";
import SwapPage from "components/pages/SwapPage/SwapPage";
import PoolPage from "components/pages/PoolPage/PoolPage";
import ListPairPage from "components/pages/ListPairPage/ListPairPage";
import { Dev } from "./lib/helpers/env";
import DSLPage from "./components/pages/DSLPage/DSLPage";

const AppRoutes = () => {
  return (
    <>
      <Router>
        <Switch>
          <Route exact path="/" component={TradePage} />
          <Route exact path="/bridge/:tab?" component={BridgePage} />
          <Route exact path="/swap/:tab?" component={SwapPage} />
          <Route exact path="/pool" component={PoolPage} />
          <Route exact path="/list-pair" component={ListPairPage} />
          <Dev>
            <Route exact path="/dsl" component={DSLPage} />
          </Dev>
        </Switch>
      </Router>
    </>
  );
};

export default AppRoutes;
