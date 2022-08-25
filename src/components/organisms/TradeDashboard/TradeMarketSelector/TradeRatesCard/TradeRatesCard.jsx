import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { formatPrice, addComma } from "lib/utils";
import { SettingsIcon } from "components/atoms/Svg";
import Button from "components/molecules/Button/Button";
import Text from "components/atoms/Text/Text";
import SettingsModal from "./SettingsModal";
import { TokenPairDropdown } from "components/molecules/Dropdown";
import useModal from "components/hooks/useModal";
import useTheme from "components/hooks/useTheme";
import {
  settingsSelector,
  setUISettings,
  networkSelector,
} from "lib/store/features/api/apiSlice";
import { userSelector } from "lib/store/features/auth/authSlice";
import {
  fetchFavourites,
  addFavourite,
  removeFavourite,
} from "lib/helpers/storage/favourites";
import { ActivatedStarIcon, StarIcon } from "components/atoms/Svg";
import { Box } from "@material-ui/core";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import _ from "lodash";
import { darkColors, lightColors } from "lib/theme/colors";
import { requestTokens } from "lib/api/constants";
import api from "lib/api";

const TradeRatesCard = ({
  updateMarketChain,
  marketSummary,
  rowData,
  currentMarket,
  marketInfo,
}) => {
  const { isDark } = useTheme();

  const [lastPrice, setLastPrice] = useState(0);
  const [isIncrease, setIncrease] = useState(true);
  const [favourites, setFavourites] = useState(fetchFavourites());
  const [isOpen, setOpen] = useState(false);
  const [faucetButtonState, setFaucetButtonState] = useState("idle");
  const [faucetButtonText, setFaucetButtonText] = useState("Request tokens");

  const dispatch = useDispatch();

  const settings = useSelector(settingsSelector);
  const network = useSelector(networkSelector);
  const user = useSelector(userSelector);

  const waitForTx = async (txHash) => {
    try {
      await api.waitForTxL2(txHash);
    } catch (e) {
      console.error(e);
    }

    api.getBalances();
    setFaucetButtonState("received");
  };

  useEffect(() => {
    if (marketSummary.price > lastPrice) setIncrease(true);
    else if (marketSummary.price < lastPrice) setIncrease(false);
    setLastPrice(marketSummary.price);
  }, [marketSummary.price]);

  useEffect(() => {
    if (!user.address) {
      setFaucetButtonState("notConnected");
    } else if (user.address && faucetButtonState === "notConnected") {
      setFaucetButtonState("connected");
    }
  }, [user.address])

  useEffect(() => {
    let buttonText = "";
    switch (faucetButtonState) {
      case "success":
        buttonText = "Transaction pending...";
        break;
      case "failure":
        buttonText = "Request failed";
        break;
      case "requestAccepted":
        buttonText = "Awaiting faucet response...";
        break;
      case "requestDenied":
        buttonText = "Request denied";
        setTimeout(setFaucetButtonState, 30000, "idle");
        break;
      case "requested":
        buttonText = "Requesting tokens...";
        break;
      case "received":
        buttonText = "Tokens received";
        break;
      case "notConnected":
        buttonText = "No wallet connected";
        break;
      default:
        buttonText = "Request testnet tokens";
        break;
    }
    setFaucetButtonText(buttonText);
  }, [faucetButtonState]);

  const handleOnModalClose = () => {
    onSettingsModalClose();
  };

  const [onSettingsModal, onSettingsModalClose] = useModal(
    <SettingsModal onDismiss={() => handleOnModalClose()} />
  );

  const handleSettings = () => {
    onSettingsModal();
  };

  const handleMintRequest = () => {
    if (!user.address) {
      console.error("Address is null.");
      return;
    }

    const wsURL = "wss://faucet-zksync-v2.herokuapp.com";
    let ws = null;
    try {
      ws = new WebSocket(wsURL);
    } catch (error) {
      console.error(error);
      setFaucetButtonState("failure");
      return;
    }
    
    ws.onmessage = ({ data }) => {
      console.log(data);
      try {
        const msg = JSON.parse(data);
        if ("accepted" in msg) {
          const { accepted, error } = msg;
          if (accepted) {
            console.log("Server request accepted, processing...");
            setFaucetButtonState("requestAccepted");
          } else {
            setFaucetButtonState("requestDenied");
            console.error(error);
          }
        } else if ("status" in msg) {
          const { txhash, error } = msg;
          if (error === null) {
            console.log("Server sent tokens. Tx hash:", txhash);
            setFaucetButtonState("success");
            waitForTx(txhash);
          } else {
            console.error(error);
            setFaucetButtonState("failure");
          }
        }
        console.log("Message from server", msg);
      } catch (error) {
        console.error(error);
      }
    };
    ws.onclose = (ev) => {
      console.log(ev);
    };
    ws.onerror = (ev) => {
      console.error(ev);
    };

    ws.onopen = (ev) => {
      const msg = {
        address: user.address,
        chainId: network,
        tokens: requestTokens[network].join(","),
      };
      ws.send(JSON.stringify(msg));
      setFaucetButtonState("requested");
    };
  };

  const toggleLayout = () => {
    dispatch(setUISettings({ key: "editable", value: !settings.editable }));
  };

  const isMobile = window.innerWidth < 800;
  const isOverflow = window.innerWidth < 1210;

  const percentChange = (
    (marketSummary.priceChange / marketSummary.price) *
    100
  ).toFixed(2);

  const favouritePair = (pair) => {
    const isFavourited = fetchFavourites().includes(pair);

    let favourites = [];
    if (!isFavourited) {
      favourites = addFavourite(pair);
    } else {
      favourites = removeFavourite(pair);
    }

    setFavourites(favourites);
  };

  return (
    <Wrapper>
      <LeftWrapper>
        <MarketSelector>
          <TokenPairDropdown
            width={isMobile ? 83 : 223}
            transparent
            rowData={rowData}
            updateMarketChain={updateMarketChain}
            currentMarket={currentMarket}
            marketInfo={marketInfo}
            onFavourited={(items) => {
              setFavourites(items);
            }}
            favourited={favourites}
          />
        </MarketSelector>
        <RatesCardsWrapper>
          <Box
            style={{ cursor: "pointer" }}
            position="relative"
            onMouseEnter={() => {
              setOpen(true);
            }}
            onMouseLeave={() => {
              setOpen(false);
            }}
          >
            <Box display={"flex"} onClick={() => favouritePair(currentMarket)}>
              {_.indexOf(favourites, currentMarket) !== -1 ? (
                <ActivatedStarIcon />
              ) : (
                <StarIcon />
              )}
            </Box>
            {isOpen && (
              <Box
                position="absolute"
                left="-50px"
                top="calc(100% - 2px)"
                width="140px"
                borderRadius={"5px"}
                overflow="hidden"
                display="flex"
                flexDirection="column"
                zIndex={1000}
              >
                <Box
                  px="15px"
                  py="7px"
                  boxSizing="boder-box"
                  fontSize={16}
                  fontWeight="bold"
                  borderBottom={`1px solid ${
                    isDark
                      ? darkColors.foreground400
                      : lightColors.foreground400
                  }`}
                  bgcolor={
                    isDark
                      ? darkColors.backgroundLowEmphasis
                      : lightColors.backgroundLowEmphasis
                  }
                  color={
                    isDark
                      ? darkColors.foregroundHighEmphasis
                      : lightColors.foregroundHighEmphasis
                  }
                >
                  Favorites
                </Box>
                {_.map(favourites, (item, index) => {
                  return (
                    <FavItem
                      px="15px"
                      py="7px"
                      key={index}
                      boxSizing="boder-box"
                      fontSize={14}
                      borderBottom={
                        index !== favourites.length - 1
                          ? `1px solid ${
                              isDark
                                ? darkColors.foreground400
                                : lightColors.foreground400
                            }`
                          : ""
                      }
                      bgcolor={
                        isDark
                          ? darkColors.backgroundLowEmphasis
                          : lightColors.backgroundLowEmphasis
                      }
                      color={
                        isDark
                          ? darkColors.foregroundHighEmphasis
                          : lightColors.foregroundHighEmphasis
                      }
                      onClick={() => {
                        updateMarketChain(item);
                        setOpen(false);
                      }}
                    >
                      {item.replace("-", "/")}
                    </FavItem>
                  );
                })}
              </Box>
            )}
          </Box>
          <RatesCard>
            <Text
              font="primaryHeading6"
              color={
                percentChange === "NaN"
                  ? "text-gray-900"
                  : isIncrease
                  ? "successHighEmphasis"
                  : "dangerHighEmphasis"
              }
            >
              {marketSummary?.price ? (
                addComma(formatPrice(marketSummary.price))
              ) : (
                <Text font="primaryHeading6" color="foregroundHighEmphasis">
                  --
                </Text>
              )}
            </Text>
            <Text font="primaryTiny" color="foregroundHighEmphasis">
              ${" "}
              {marketInfo?.baseAsset?.usdPrice
                ? addComma(marketInfo.baseAsset.usdPrice)
                : "--"}
            </Text>
          </RatesCard>
          {isMobile ? (
            <></>
          ) : (
            <>
              <Divider />
              <RatesCard>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  <>
                    {settings.showNightPriceChange
                      ? "UTC Change"
                      : "24h Change"}
                  </>
                </Text>
                <Text
                  font="primaryMediumSmallSemiBold"
                  color={
                    percentChange === "NaN"
                      ? "white"
                      : parseFloat(marketSummary["priceChange"]) >= 0
                      ? "successHighEmphasis"
                      : "dangerHighEmphasis"
                  }
                >
                  {marketSummary.priceChange &&
                    `${addComma(
                      formatPrice(marketSummary.priceChange / 1)
                    )} | `}
                  {percentChange !== "NaN" ? (
                    `${percentChange}%`
                  ) : (
                    <Text
                      font="primaryMediumSmallSemiBold"
                      color="foregroundHighEmphasis"
                    >
                      -- | --
                    </Text>
                  )}
                </Text>
              </RatesCard>
              <Divider />
              <RatesCard>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  <>{settings.showNightPriceChange ? "UTC High" : "24h High"}</>
                </Text>
                <Text
                  font="primaryMediumSmallSemiBold"
                  color="foregroundHighEmphasis"
                >
                  {marketSummary && marketSummary["24hi"]
                    ? addComma(formatPrice(marketSummary["24hi"]))
                    : "--"}
                </Text>
              </RatesCard>
              <Divider />
              <RatesCard>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  <>{settings.showNightPriceChange ? "UTC Low" : "24h Low"}</>
                </Text>
                <Text
                  font="primaryMediumSmallSemiBold"
                  color="foregroundHighEmphasis"
                >
                  {marketSummary && marketSummary["24lo"]
                    ? addComma(formatPrice(marketSummary["24lo"]))
                    : "--"}
                </Text>
              </RatesCard>
              <Divider />
              <RatesCard>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  <>
                    {settings.showNightPriceChange
                      ? `UTC Volume(${
                          marketInfo && marketInfo.baseAsset.symbol
                            ? marketInfo.baseAsset.symbol
                            : " -- "
                        })`
                      : `24h Volume(${
                          marketInfo && marketInfo.baseAsset.symbol
                            ? marketInfo && marketInfo.baseAsset.symbol
                            : " -- "
                        })`}
                  </>
                </Text>
                <Text
                  font="primaryMediumSmallSemiBold"
                  color="foregroundHighEmphasis"
                >
                  {marketSummary && marketSummary.baseVolume
                    ? addComma(formatPrice(marketSummary.baseVolume))
                    : "--"}
                </Text>
              </RatesCard>
              <Divider />
              <RatesCard>
                <Text
                  font="primaryExtraSmallSemiBold"
                  color="foregroundLowEmphasis"
                >
                  <>
                    {settings.showNightPriceChange
                      ? `UTC Volume(${
                          marketInfo && marketInfo.quoteAsset.symbol
                            ? marketInfo.quoteAsset.symbol
                            : " -- "
                        })`
                      : `24h Volume(${
                          marketInfo && marketInfo.quoteAsset.symbol
                            ? marketInfo.quoteAsset.symbol
                            : " -- "
                        })`}
                  </>
                </Text>
                <Text
                  font="primaryMediumSmallSemiBold"
                  color="foregroundHighEmphasis"
                >
                  {marketSummary && marketSummary.quoteVolume
                    ? addComma(formatPrice(marketSummary.quoteVolume))
                    : "--"}
                </Text>
              </RatesCard>
            </>
          )}
        </RatesCardsWrapper>
      </LeftWrapper>
      {isOverflow ? (
        <div style={{ display: "flex" }}>
          {settings.editable ? (
            <LockIcon
              style={{ marginRight: "20px" }}
              onClick={toggleLayout}
            ></LockIcon>
          ) : (
            ""
          )}

          <SettingsIcon onClick={handleSettings} />
        </div>
      ) : (
        <div>
          {Object.keys(requestTokens).includes(network.toString()) ? (
            <Button
              variant="outlined"
              scale="imd"
              mr="20px"
              style={{ marginRight: "10px" }}
              onClick={handleMintRequest}
            >
              {faucetButtonText}
            </Button>
          ) : (
            ""
          )}

          {settings.editable ? (
            <Button
              endIcon={<LockOpenIcon />}
              variant="outlined"
              scale="imd"
              mr="20px"
              style={{ marginRight: "10px" }}
              onClick={toggleLayout}
            >
              Lock Interface
            </Button>
          ) : (
            ""
          )}

          <Button
            endIcon={<SettingsIcon />}
            variant="outlined"
            scale="imd"
            onClick={handleSettings}
          >
            Settings
          </Button>
        </div>
      )}
    </Wrapper>
  );
};

export default TradeRatesCard;

const Wrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 10px;
`;
const LeftWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
`;

const RatesCardsWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 20px;
  padding-left: 20px;
`;

const MarketSelector = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 10px;
  background-color: ${({ theme }) => theme.colors.backgroundLowEmphasis};
  padding: 0px 24px;
  height: 56px;
`;

const RatesCard = styled.div`
  display: grid;
  grid-auto-flow: row;
  align-items: center;
  justify-content: center;
  gap: 2px;
`;

const Divider = styled.div`
  width: 1px;
  height: 32px;
  background-color: ${({ theme, isDark }) =>
    isDark === "false"
      ? theme.colors.backgroundMediumEmphasis
      : theme.colors.foreground400};
`;

const FavItem = styled(Box)`
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundHighEmphasis};
  }
`;
