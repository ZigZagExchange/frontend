import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
//import Home from "../pages/Home";
import Trade from "../pages/Trade";
const AppRoute = () => {
  return (
    <>
      <Router>
        <Switch>
          <Route exact path="/" component={Trade}></Route>
        </Switch>
      </Router>
    </>
  );
};

export default AppRoute;
