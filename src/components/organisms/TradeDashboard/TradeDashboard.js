import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import GridLayoutRow from "./ReactGridLayout/ReactGridRow";
import GridLayoutCell from "./ReactGridLayout/ReactGridCell";
import styled from "@xstyled/styled-components";
import TradeSidebar from "./TradeSidebar/TradeSidebar";
import TradeMarketSelector from "./TradeMarketSelector/TradeMarketSelector";
import TradeTables from "./TradeTables/TradeTables";
// import TradeFooter from "./TradeFooter/TradeFooter";
import TradeChartArea from "./TradeChartArea/TradeChartArea";
import OrdersBook from "./TradeBooks/OrdersBook";
import TradesBook from "./TradeBooks/TradesBook";
import "react-toastify/dist/ReactToastify.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./ReactGridLayout/custom-grid-layout.css";
import { toast } from "react-toastify";
import {
    networkSelector,
    userOrdersSelector,
    userFillsSelector,
    currentMarketSelector,
    setCurrentMarket,
    resetData,
    layoutSelector,
    settingsSelector,
    setUISettings,
    marketSummarySelector,
} from "lib/store/features/api/apiSlice";
import { userSelector } from "lib/store/features/auth/authSlice";
import api from "lib/api";
import { useLocation, useHistory } from "react-router-dom";
import {
    marketQueryParam,
    networkQueryParam,
} from "../../pages/ListPairPage/SuccessModal";
import { HighSlippageModal } from "components/molecules/HighSlippageModal";
import _ from "lodash";
import { formatPrice, addComma } from "lib/utils";

const TradeContainer = styled.div`
    color: #aeaebf;
    height: calc(100vh - 56px);
    background: ${(p) => p.theme.colors.backgroundHighEmphasis};

    .react-resizable-handle {
        &::after {
            width: 10px !important;
            height: 10px !important;
            border-color: ${({ theme }) =>
                `${theme.colors.primaryHighEmphasis} !important`};
            border-right-width: 3px !important;
            border-bottom-width: 3px !important;
            cursor: nwse-resize;
        }
    }
`;

export function TradeDashboard() {
    const user = useSelector(userSelector);
    const network = useSelector(networkSelector);
    const currentMarket = useSelector(currentMarketSelector);
    const userOrders = useSelector(userOrdersSelector);
    const userFills = useSelector(userFillsSelector);
    const layout = useSelector(layoutSelector);
    const settings = useSelector(settingsSelector);
    const marketSummary = useSelector(marketSummarySelector);
    const [fixedPoint, setFixedPoint] = useState(2);
    const [side, setSide] = useState("all");
    const dispatch = useDispatch();

    const { search } = useLocation();
    const history = useHistory();

    const updateMarketChain = (market) => {
        dispatch(setCurrentMarket(market));
    };

    useEffect(() => {
        if (_.isEmpty(marketSummary)) return;
        document.title = `${addComma(formatPrice(marketSummary.price))} | ${
            marketSummary.market ?? "--"
        } | ZigZag Exchange`;
    }, [marketSummary]);

    useEffect(() => {
        const urlParams = new URLSearchParams(search);
        const marketFromURL = urlParams.get(marketQueryParam);
        const networkFromURL = urlParams.get(networkQueryParam);
        const chainid = api.getChainIdFromName(networkFromURL);
        if (marketFromURL && currentMarket !== marketFromURL) {
            updateMarketChain(marketFromURL);
        }
        if (chainid && network !== chainid) {
            api.setAPIProvider(chainid);
            api.signOut();
        }
        api.getWalletBalances();
    }, []);

    // Update URL when market or network update
    useEffect(() => {
        let networkText;
        if (network === 1) {
            networkText = "zksync";
        } else if (network === 1000) {
            networkText = "zksync-rinkeby";
        } else if (network === 42161) {
            networkText = "arbitrum";
        }
        history.push(`/?market=${currentMarket}&network=${networkText}`);
    }, [network, currentMarket]);

    useEffect(() => {
        if (user.address && !user.id) {
            history.push("/bridge");
            toast.error(
                "Your zkSync account is not activated. Please use the bridge to deposit funds into zkSync and activate your zkSync wallet.",
                {
                    autoClose: 60000,
                }
            );
        }
        const sub = () => {
            dispatch(resetData());
            api.subscribeToMarket(currentMarket, settings.showNightPriceChange);
        };

        if (api.ws && api.ws.readyState === 0) {
            api.on("open", sub);
        } else {
            sub();
        }

        return () => {
            if (api.ws && api.ws.readyState !== 0) {
                api.unsubscribeToMarket(currentMarket);
            } else {
                api.off("open", sub);
            }
        };
    }, [network, currentMarket, api.ws, settings.showNightPriceChange]);

    const changeFixedPoint = (point) => {
        setFixedPoint(point);
    };

    const changeSide = (side) => {
        setSide(side);
    };

    const activeOrderStatuses = ["o", "m", "b"];
    const activeUserOrders = Object.values(userOrders).filter((order) =>
        activeOrderStatuses.includes(order[9])
    ).length;

    return (
        <TradeContainer>
            <TradeMarketSelector
                updateMarketChain={updateMarketChain}
                currentMarket={currentMarket}
            />
            <GridLayoutRow
                rowHeight={(window.innerHeight - 112) / 30}
                layouts={settings.layouts}
                autoSize={false}
                onChange={(_, layout) => {
                    dispatch(setUISettings({ key: "layouts", value: layout }));
                    dispatch(
                        setUISettings({ key: "layoutsCustomized", value: true })
                    );
                }}
                margin={[0, 0]}
                isDraggable={settings.editable}
                isResizable={settings.editable}
                draggableHandle=".grid-item__title"
                editable={settings.editable}
                useCSSTransforms={false}
            >
                <div key="a">
                    <GridLayoutCell editable={settings.editable}>
                        <TradeSidebar
                            updateMarketChain={updateMarketChain}
                            currentMarket={currentMarket}
                            user={user}
                            activeOrderCount={activeUserOrders}
                        />
                    </GridLayoutCell>
                </div>
                {/* TradePriceTable, TradePriceHeadSecond */}
                <div key="g">
                    <GridLayoutCell editable={settings.editable}>
                        <OrdersBook
                            currentMarket={currentMarket}
                            changeFixedPoint={changeFixedPoint}
                            changeSide={changeSide}
                        />
                    </GridLayoutCell>
                </div>
                <div key="h">
                    <GridLayoutCell editable={settings.editable}>
                        <TradesBook
                            currentMarket={currentMarket}
                            fixedPoint={fixedPoint}
                            side={side}
                        />
                    </GridLayoutCell>
                </div>
                <div key="c">
                    <GridLayoutCell editable={settings.editable}>
                        <TradeChartArea />
                    </GridLayoutCell>
                </div>
                <div key="d">
                    <GridLayoutCell editable={settings.editable}>
                        <TradeTables
                            userFills={userFills}
                            userOrders={userOrders}
                            user={user}
                        />
                    </GridLayoutCell>
                </div>
            </GridLayoutRow>
            <HighSlippageModal />
        </TradeContainer>
    );
}
