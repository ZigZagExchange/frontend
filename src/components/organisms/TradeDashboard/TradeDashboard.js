import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { default as WidthProvider } from "./ReactGridLayout/ReactGridProvider";
import GridLayoutRow from "./ReactGridLayout/ReactGridRow";
import GridLayoutCell from "./ReactGridLayout/ReactGridCell";
import { Responsive } from "react-grid-layout";
import styled from "@xstyled/styled-components";
import MenuIcon from "@mui/icons-material/Menu";
import TradeSidebar from "./TradeSidebar/TradeSidebar";
import TradeMarketSelector from "./TradeMarketSelector/TradeMarketSelector";
import TradeTables from "./TradeTables/TradeTables";
import TradeFooter from "./TradeFooter/TradeFooter";
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
    setLayout,
    resetData,
    settingsSelector,
    setUISettings,
    marketSummarySelector,
} from "lib/store/features/api/apiSlice";
import { userSelector } from "lib/store/features/auth/authSlice";
import api from "lib/api";
import { useLocation, useHistory } from "react-router-dom";
import {
    getChainIdFromMarketChain,
    marketQueryParam,
    networkQueryParam,
} from "../../pages/ListPairPage/SuccessModal";
import TradesTable from "./TradeBooks/TradesTable";
import { HighSlippageModal } from "components/molecules/HighSlippageModal";
import _ from "lodash";

const ResponsiveGridLayout = WidthProvider(Responsive);

const TradeContainer = styled.div`
    color: #aeaebf;
    height: calc(100vh - 56px);
    background: ${(p) => p.theme.colors.backgroundHighEmphasis};
`;

const TradeGrid = styled.article`
    display: grid;
    grid-template-rows: ${({ isLeft }) =>
        isLeft ? "56px 2fr 1fr" : "56px 613px 1fr"};
    grid-template-columns: ${({ isLeft }) =>
        isLeft ? "300px 253.5px 253.5px 1fr" : "300px 507px 1fr"};
    grid-template-areas: ${({ isLeft }) =>
        isLeft
            ? `"marketSelector marketSelector marketSelector marketSelector"
  "sidebar orders trades chart"
  "tables tables tables tables"`
            : `"marketSelector marketSelector marketSelector"
  "sidebar stack chart"
  "tables tables tables"`};

    height: calc(100vh - 56px);
    gap: 0px;

    @media screen and (max-width: 991px) {
        height: auto;
        grid-template-rows: ${({ isLeft }) =>
            isLeft
                ? "56px 410px 459px 508px 362px"
                : "56px 410px 459px 519px 362px"};
        grid-template-columns: ${({ isLeft }) => (isLeft ? "1fr 1fr" : "1fr")};
        grid-template-areas: ${({ isLeft }) =>
            isLeft
                ? `"marketSelector marketSelector"
      "chart chart"
      "sidebar orders"
      "trades trades"
      "tables tables"
      `
                : `"marketSelector"
      "chart"
      "sidebar"
      "stack"
      "tables"
      `};
    }

    > div,
    > aside,
    > header,
    > section,
    > main {
        background: ${(p) => p.theme.colors.zzDarkest};
    }
`;

export function TradeDashboard() {
    const user = useSelector(userSelector);
    const network = useSelector(networkSelector);
    const currentMarket = useSelector(currentMarketSelector);
    const userOrders = useSelector(userOrdersSelector);
    const userFills = useSelector(userFillsSelector);
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
        document.title = `${marketSummary.price} | ${
            marketSummary.market ?? "--"
        } | ZigZag Exchange`;
    }, [marketSummary]);

    useEffect(() => {
        const urlParams = new URLSearchParams(search);
        const marketFromURL = urlParams.get(marketQueryParam);
        const networkFromURL = urlParams.get(networkQueryParam);
        const chainid = getChainIdFromMarketChain(networkFromURL);
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

    const StyledGridLayoutRow = styled(GridLayoutRow)`
        .react-grid-item {
            padding: ${({ editable }) => editable && "10px"};
            background: ${({ editable, theme }) =>
                editable && theme.colors.backgroundMediumEmphasis};
        }

        .react-resizable-handle::after {
            border-color: ${({ theme }) =>
                `${theme.colors.primaryHighEmphasis} !important`};
        }
    `;

    return (
        <TradeContainer>
            <TradeMarketSelector
                updateMarketChain={updateMarketChain}
                currentMarket={currentMarket}
            />
            <StyledGridLayoutRow
                rowHeight={283}
                layouts={settings.layouts}
                autoSize={false}
                onChange={(_, layout) => {
                    dispatch(setUISettings({ key: "layouts", value: layout }));
                }}
                margin={[0, 0]}
                isDraggable={settings.editable}
                isResizable={settings.editable}
                draggableHandle=".grid-item__title"
                editable={settings.editable}
            >
                <div key={settings.stackOrderbook ? "a" : "b"}>
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
                <div key={settings.stackOrderbook ? "g" : "e"}>
                    <GridLayoutCell editable={settings.editable}>
                        <OrdersBook
                            currentMarket={currentMarket}
                            changeFixedPoint={changeFixedPoint}
                            changeSide={changeSide}
                        />
                    </GridLayoutCell>
                </div>
                <div key={settings.stackOrderbook ? "h" : "f"}>
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
            </StyledGridLayoutRow>
            <HighSlippageModal />
        </TradeContainer>
    );
}
