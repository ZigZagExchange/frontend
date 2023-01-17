import React, { useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  resetTradeLayout,
  settingsSelector,
  setUISettings,
} from "lib/store/features/api/apiSlice";
import TradePage from "components/pages/TradePage/TradePage";
import BridgePage from "components/pages/BridgePage/BridgePage";
import ListPairPage from "components/pages/ListPairPage/ListPairPage";
import NotFoundPage from "components/pages/NotFoundPage/NotFoundPage";

const AppRoutes = () => {
  const settings = useSelector(settingsSelector);
  const dispatch = useDispatch();

  const resetLayout = () => {
    if (!settings.layoutsCustomized) {
      dispatch(resetTradeLayout());
    }
  };

  useEffect(() => {
    dispatch(setUISettings({ key: "editable", value: false }));
    resetLayout();
    window.addEventListener("resize", resetLayout);
  }, []);

  return (
    <>
      <Router>
        <Switch>
          <Route exact path="/" component={TradePage} />
          <Route exact path="/bridge/:tab?" component={BridgePage} />
          <Route exact path="/list-pair" component={ListPairPage} />
          <Route path="*" component={NotFoundPage} />
        </Switch>
      </Router>
    </>
  );
};

export default AppRoutes;
