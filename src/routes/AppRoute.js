import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
//import Home from "../pages/Home";
import Trade from "../pages/Trade";
import Bridge from "../pages/Bridge";

const AppRoute = () => {
  return (
    <>
      <Router>
        <Switch>
          <Route exact path="/" component={Trade} />
          <Route exact path="/bridge" component={Bridge} />
        </Switch>
      </Router>
    </>
  );
};

export default AppRoute;
