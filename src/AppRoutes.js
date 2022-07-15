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
import ConvertPage from "components/pages/ConvertPage/ConvertPage";
import PoolPage from "components/pages/PoolPage/PoolPage";
import ListPairPage from "components/pages/ListPairPage/ListPairPage";
import { Dev } from "./lib/helpers/env";
import DSLPage from "./components/pages/DSLPage/DSLPage";
import WrapPage from "./components/pages/WrapPage/WrapPage";

const AppRoutes = () => {
    const settings = useSelector(settingsSelector);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!settings.layouts) {
            dispatch(resetTradeLayout());
        }
        if (!settings.layouts) {
            dispatch(setUISettings({ key: "editable", value: false }));
        }
    }, []);

    return (
        <>
            <Router>
                <Switch>
                    <Route exact path="/" component={TradePage} />
                    <Route exact path="/bridge/:tab?" component={BridgePage} />
                    <Route
                        exact
                        path="/convert/:tab?"
                        component={ConvertPage}
                    />
                    <Route exact path="/pool" component={PoolPage} />
                    <Route exact path="/list-pair" component={ListPairPage} />
                    <Route exact path="/wrap" component={WrapPage} />
                    <Dev>
                        <Route exact path="/dsl" component={DSLPage} />
                    </Dev>
                </Switch>
            </Router>
        </>
    );
};

export default AppRoutes;
