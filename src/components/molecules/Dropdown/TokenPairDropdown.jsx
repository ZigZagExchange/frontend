import React, { useState, useEffect, useRef } from "react";
import styled from 'styled-components'
import { ExpandableButton } from '../ExpandableButton'
import { HideMenuOnOutsideClicked } from "lib/utils";
import Text from "components/atoms/Text/Text";
import { StarIcon, ActivatedStarIcon, SortUpIcon, SortDownIcon, SortUpFilledIcon, SortDownFilledIcon } from "components/atoms/Svg";
import InputField from "components/atoms/InputField/InputField";
import { TabMenu, Tab } from "../TabMenu";
import api from "lib/api";
import { getStables } from "lib/helpers/categories";
import {
    addFavourite,
    removeFavourite,
    fetchFavourites,
} from "lib/helpers/storage/favourites";

const ButtonWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 8px;
  width: 130px;
  img {
    height: 1.6rem;
  }
`

const DropdownWrapper = styled.div`
    position: relative;
`

const DropdownDisplay = styled.div`
  position: absolute;
  z-index: 99;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  box-shadow: 0px 8px 16px 0px #0101011A;
  width: ${({ isMobile }) => isMobile ? '400px' : '469px'};
  height: 531px;
  background: ${({ theme }) => theme.colors.backgroundLowEmphasis};
  border: 1px solid ${({ theme }) => theme.colors.foreground400};
  top: 45px;
  left: -20px;
  opacity: 1;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(8px);
`

const DropdownHeader = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const Divider = styled.div`
  background: ${({ theme }) => theme.colors.foreground400};
  margin: 0px 20px;
  height: 1px;
`

const StyledTabMenu = styled(TabMenu)`
  margin: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.foreground400};
`

const TableContent = styled.div`
  height: 386px;
  
  table tbody tr {
    cursor: pointer;
    &:hover{
        background-color: ${({ theme }) => theme.colors.foreground400};
    }
  }

  tbody {
      display: block;
      height: 342px;
      overflow: overlay;

      ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
          position: relative;
          z-index: 20;
      }
  
      ::-webkit-scrollbar-track {
          border-radius: 0px;
          background: hsla(0, 0%, 100%, 0.15);
          height: 23px;
      }
  
      ::-webkit-scrollbar-thumb {
          border-radius: 0px;
          background: hsla(0, 0%, 100%, 0.4);
      }
  
      ::-webkit-scrollbar-thumb:window-inactive {
          background: #fff;
      }
  }

  thead, tbody tr {
      display: table;
      width: 100%;
      table-layout: fixed;
  }

  th:nth-child(1) {
      div {
        justify-content: start !important;
      }
  }

  th:nth-child(1), td:nth-child(1) {
    padding: 4px 0px 4px 20px;
  }
  
  th:nth-child(2), td:nth-child(2) {
    padding: 4px 0px;
  }
  
  th:nth-child(3), td:nth-child(3) {
    padding: 4px 0px 4px 0px;
  }

  th:nth-child(4), td:nth-child(4) {
    padding: 4px 20px 4px 0px;
  }
  
  thead {
    transition: opacity 0.2s ease-in-out;
    user-select: none;
    cursor: pointer;
  }

  thead tr {
    transition: opacity 0.2s ease-in-out;
    user-select: none;
    cursor: pointer;
    opacity: 0.8;
  }
  
  thead tr:hover, thead tr:focus {
    opacity: 1;
  }

  table tbody tr.selected {
    background-color: ${({ theme }) => theme.colors.foreground400};
  }

  table {
      width: 100%;
  }

`

const HeaderWrapper = styled.div`
  /* display: grid; */
  /* grid-auto-flow: column; */
  /* justify-content: end; */
  align-items: center;
  display: flex;
  justify-content: flex-end;
  /* gap: 10px; */
  svg {
      justify-self: center;
  }
`

const PairWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: start;
  gap: 3px;
  svg {
      justify-self: center;
  }
`

const SortIconWrapper = styled.div`
  display: grid;
  grid-auto-flow: row;
  align-items: center;
  justify-content: center;
  svg path {
    color: none;
  }
`

const DropdownContent = styled.div`
  flex: 1 1 auto;
  overflow-y: auto;
`;

const TokenPairDropdown = ({ width, transparent, currentMarket, marketInfo, updateMarketChain, rowData }) => {
    // const [foundPairs, setFoundPairs] = useState([])
    const [pairs, setPairs] = useState([])
    const [categorySelected, setCategorySelected] = useState(0)
    const [pairsByCategory, setPairsByCategory] = useState([])
    const [favourites, setFavourites] = useState(fetchFavourites())
    const [volumeSorted, setVolumeSorted] = useState(false)
    const [volumeDirection, setVolumeDirection] = useState(false)
    const [pairSorted, setPairSorted] = useState(false)
    const [pairDirection, setPairDirection] = useState(false)
    const [changeSorted, setChangeSorted] = useState(false)
    const [changeDirection, setChangeDirection] = useState(false)
    const [priceSorted, setPriceSorted] = useState(false)
    const [priceDirection, setPriceDirection] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [isOpened, setIsOpened] = useState(false)
    const isMobile = window.innerWidth < 500
    const wrapperRef = useRef(null)
    const [_marketInfo, setMarketInfo] = useState(null);

    HideMenuOnOutsideClicked(wrapperRef, setIsOpened)

    const toggle = () => setIsOpened(!isOpened)

    const updateSearchValue = (e) => {
        setSearchValue(e.target.value)
        searchPair(e.target.value);
    }

    const searchPair = (value) => {
        value = value.toUpperCase().replace("/", "-").replace(" ", "-");
        let foundPairs = [];

        const [base, quote] = value.split("-");
        const reverseValue = quote + "-" + base;
        //
        //search all, if you'd prefer to search the current category just set this to use `state.pairs` instead
        //

        foundPairs = pairsByCategory.filter((item) => {
            if (!value) return true;
            if (
                item.toLowerCase().includes(value.toLowerCase()) ||
                item.toLowerCase().includes(reverseValue.toLowerCase())
            ) {
                return true;
            }
            return false;
        });
        //update found pairs
        setPairs(foundPairs)
        setPairSorted(false)
        setPairDirection(false)
        setPriceSorted(false)
        setPriceDirection(false)
        setVolumeSorted(false)
        setVolumeDirection(false)
        setChangeSorted(false)
        setChangeDirection(false)
    }

    useEffect(() => {
        if (
            categorySelected !== 4 &&
            pairsByCategory.length === 0 &&
            rowData.length !== 0
        ) {
            setPairs(rowData.map((r) => r.td1));
            setPairsByCategory(rowData.map((r) => r.td1));
        }
    }, [rowData])

    useEffect(() => {
        if(
            marketInfo &&
            marketInfo !== _marketInfo
        ) {      
            setMarketInfo(marketInfo);
        }
    }, [marketInfo])


    const categorizePairs = (category_index) => {
        let foundPairs = [];

        setCategorySelected(category_index)
        setPairSorted(false)
        setPairDirection(false)
        setPriceSorted(false)
        setPriceDirection(false)
        setVolumeSorted(false)
        setVolumeDirection(false)
        setChangeSorted(false)
        setChangeDirection(false)
        setSearchValue('')

        switch (category_index) {
            case 0:
                setPairsByCategory(rowData.map((row) => row.td1))
                setPairs(rowData.map((row) => row.td1))
                break;
            case 1:
                const eth = rowData
                    .filter((item) => {
                        if (
                            item.td1.toLowerCase().includes("ETH".toLowerCase())
                        ) {
                            return true;
                        }
                        return false;
                    })
                    .map((p) => p.td1);
                setPairsByCategory(eth)
                setPairs(eth)
                break;
            case 2:
                const wbtc = rowData
                    .filter((item) => {
                        if (
                            item.td1.toLowerCase().includes("WBTC".toLowerCase())
                        ) {
                            return true;
                        }
                        return false;
                    })
                    .map((p) => p.td1);
                setPairsByCategory(wbtc)
                setPairs(wbtc)
                break;
            case 3:
                //look for pairs against stables.
                foundPairs = getStables(rowData);
                setPairsByCategory(foundPairs)
                setPairs(foundPairs)
                break;
            case 4:
                //set favourites from localstorage
                const favourites = fetchFavourites();
                foundPairs = [];

                favourites.forEach((value) => {
                    rowData.forEach((row) => {
                        const pair_name = row.td1;

                        //if found query, push it to found pairs
                        if (pair_name.includes(value.toUpperCase())) {
                            foundPairs.push(pair_name);
                        }
                    });
                });
                setPairsByCategory(foundPairs)
                setPairs(foundPairs)
                break;
            default:
                return pairs;
        }
    }

    const favouritePair = (pair) => {
        const isFavourited = fetchFavourites().includes(pair.td1);

        let favourites = [];
        if (!isFavourited) {
            favourites = addFavourite(pair.td1);
        } else {
            favourites = removeFavourite(pair.td1);
        }

        setFavourites(favourites)
    }

    const togglePairSorting = () => {
        const toggled = !pairDirection

        const sorted_pairs = pairs;

        sorted_pairs.sort(function compareFn(firstEl, secondEl) {
            if (toggled) {
                return firstEl.td1 < secondEl.td1 ? -1 : 1;
            } else {
                return firstEl.td1 < secondEl.td1 ? 1 : -1;
            }
        });

        setPairs(sorted_pairs)
        setPairSorted(true)
        setPairDirection(toggled)
        setPriceSorted(false)
        setPriceDirection(false)
        setVolumeSorted(false)
        setVolumeDirection(false)
        setChangeSorted(false)
        setChangeDirection(false)
    }

    const toggleChangeSorting = () => {
        const toggled = !changeDirection;
        const sorted_pairs = [...pairs];

        sorted_pairs.sort(function compareFn(firstEl, secondEl) {
            if (toggled) {
                return parseInt(firstEl.td3) - parseInt(secondEl.td3);
            } else {
                return parseInt(secondEl.td3) - parseInt(firstEl.td3);
            }
        });

        setPairs(sorted_pairs)
        setPairSorted(false)
        setPairDirection(false)
        setPriceSorted(false)
        setPriceDirection(false)
        setVolumeSorted(false)
        setVolumeDirection(false)
        setChangeSorted(true)
        setChangeDirection(!changeDirection)
    }

    const togglePriceSorting = () => {
        const toggled = !priceDirection;

        const sorted_pairs = pairs;

        sorted_pairs.sort(function compareFn(firstEl, secondEl) {
            if (toggled) {
                return parseInt(firstEl.td2) - parseInt(secondEl.td2);
            } else {
                return parseInt(secondEl.td2) - parseInt(firstEl.td2);
            }
        });

        setPairs(sorted_pairs)
        setPairSorted(false)
        setPairDirection(false)
        setPriceSorted(true)
        setPriceDirection(toggled)
        setVolumeSorted(false)
        setVolumeDirection(false)
        setChangeSorted(false)
        setChangeDirection(false)
    }

    const toggleVolumeSorting = () => {
        const toggled = !volumeDirection;

        const sorted_pairs = pairs;

        sorted_pairs.sort(function compareFn(firstEl, secondEl) {
            if (toggled) {
                return parseFloat(firstEl.usdVolume) - parseFloat(secondEl.usdVolume);
            } else {
                return parseFloat(secondEl.usdVolume) - parseFloat(firstEl.usdVolume);
            }
        });

        setPairs(sorted_pairs)
        setPairSorted(false)
        setPairDirection(false)
        setPriceSorted(false)
        setPriceDirection(false)
        setVolumeSorted(true)
        setVolumeDirection(toggled)
        setChangeSorted(false)
        setChangeDirection(false)
    }

    const renderPairs = (pairs) => {
        const shown_pairs = pairs
            .map((pair) => [pair, rowData.find((row) => row.td1 === pair)])
            .sort(([_, d], [__, d2]) => {
                if (changeSorted) {
                    return changeDirection ? d.td3 - d2.td3 : d2.td3 - d.td3;
                } else if (volumeSorted) {
                    return volumeDirection ? d.usdVolume - d2.usdVolume : d2.usdVolume - d.usdVolume
                } else if (priceSorted) {
                    return priceDirection ? d.td2 - d2.td2 : d2.td2 - d.td2;
                } else if (pairSorted) {
                    return pairDirection ? (d.td1 < d2.td1 ? -1 : 1) : (d.td1 < d2.td1 ? 1 : -1);
                } else {
                    return d && d2 ? d.usdVolumn - d2.usdVolumn : 0;
                }
            })
            .map(([pair, d], i) => {
                if (!d) return "";
                const selected = currentMarket === pair; //if current market selected
                const isFavourited = favourites.includes(pair); //if contains, isFavourited

                return (
                    <tr
                        key={i}
                        onClick={(e) => {
                            if (selected) return;
                            updateMarketChain(pair);
                        }}
                        className={selected ? "selected" : ""}
                    >
                        <td>
                            <PairWrapper>
                                <span onClick={(e) => { favouritePair(d); }}>
                                    {isFavourited ? <ActivatedStarIcon /> : <StarIcon />}
                                </span>
                                <Text font="primaryExtraSmall" color="foregroundHighEmphasis">{pair.replace("-", "/")}</Text>
                                <span>{d.span}</span>
                            </PairWrapper>
                        </td>
                        <td style={{paddingLeft: '30px'}}>
                            <Text font="tableContent" color={d.td3 < 0 ? 'dangerHighEmphasis' : 'successHighEmphasis'} align="right">{d.td2}</Text>
                        </td>
                        <td>
                            <Text font="tableContent" color='foregroundHighEmphasis' align="right">{d.usdVolume.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>
                        </td>
                        <td>
                            <Text font="tableContent" color={d.td3 < 0 ? 'dangerHighEmphasis' : 'successHighEmphasis'} align="right">{d.td3}%</Text>
                        </td>
                    </tr>
                );
            });

        return (
            <table>
                <thead>
                    <tr>
                        <th onClick={() => togglePairSorting()}>
                            <HeaderWrapper>
                                <Text style={{marginLeft: '22px', marginRight: '10px'}} font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">Pair</Text>
                                {pairSorted ? (
                                    <SortIconWrapper>
                                        {pairDirection ? <SortUpIcon /> : <SortUpFilledIcon />}
                                        {pairDirection ? <SortDownFilledIcon /> : <SortDownIcon />}
                                    </SortIconWrapper>
                                ) : (
                                    <SortIconWrapper>
                                        <SortUpIcon />
                                        <SortDownIcon />
                                    </SortIconWrapper>
                                )}
                            </HeaderWrapper>
                        </th>
                        <th onClick={() => togglePriceSorting()}>
                            <HeaderWrapper>
                                <Text style={{marginRight: isMobile? '3px':'10px'}} font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis" align="right">Last Price</Text>
                                {priceSorted ? (
                                    <SortIconWrapper>
                                        {priceDirection ? <SortUpIcon /> : <SortUpFilledIcon />}
                                        {priceDirection ? <SortDownFilledIcon /> : <SortDownIcon />}
                                    </SortIconWrapper>
                                ) : (
                                    <SortIconWrapper>
                                        <SortUpIcon />
                                        <SortDownIcon />
                                    </SortIconWrapper>
                                )}
                            </HeaderWrapper>
                        </th>
                        <th onClick={() => toggleVolumeSorting()}>
                            <HeaderWrapper>
                                <Text  style={{marginRight: isMobile? '3px':'10px'}} font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis" align="right">Volume(24h)</Text>
                                {volumeSorted ? (
                                    <SortIconWrapper>
                                        {volumeDirection ? <SortUpIcon /> : <SortUpFilledIcon />}
                                        {volumeDirection ? <SortDownFilledIcon /> : <SortDownIcon />}
                                    </SortIconWrapper>
                                ) : (
                                    <SortIconWrapper>
                                        <SortUpIcon />
                                        <SortDownIcon />
                                    </SortIconWrapper>
                                )}
                            </HeaderWrapper>
                        </th>
                        <th onClick={() => toggleChangeSorting()}>
                            <HeaderWrapper>
                                <Text  style={{marginRight: isMobile? '3px':'10px'}} font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis" align="right">Change</Text>
                                {changeSorted ? (
                                    <SortIconWrapper>
                                        {changeDirection ? <SortUpIcon /> : <SortUpFilledIcon />}
                                        {changeDirection ? <SortDownFilledIcon /> : <SortDownIcon />}
                                    </SortIconWrapper>
                                ) : (
                                    <SortIconWrapper>
                                        <SortUpIcon />
                                        <SortDownIcon />
                                    </SortIconWrapper>
                                )}
                            </HeaderWrapper>
                        </th>
                    </tr>
                </thead>
                <tbody>{shown_pairs}</tbody>
            </table>
        );
    }

    let marketDisplay = "--/--";
    if (_marketInfo) {
        marketDisplay = `${_marketInfo.baseAsset.symbol}/${_marketInfo.quoteAsset.symbol}`;
    }

    return (
        <DropdownWrapper ref={wrapperRef}>
            <ButtonWrapper>
                <img src={api.getCurrencyLogo(_marketInfo?.baseAsset.symbol)} alt={_marketInfo?.baseAsset.symbol} />
                <ExpandableButton width={width} transparent={transparent} expanded={isOpened} onClick={toggle}>{marketDisplay}</ExpandableButton>
            </ButtonWrapper>
            {isOpened &&
                <DropdownDisplay isMobile={isMobile}>
                    <DropdownHeader>
                        <InputField
                            type="text"
                            placeholder="Search for a token pair"
                            icon="search"
                            value={searchValue}
                            onChange={updateSearchValue}
                        />
                    </DropdownHeader>
                    <Divider />
                    <DropdownContent>
                        <StyledTabMenu left activeIndex={categorySelected} onItemClick={categorizePairs}>
                            <Tab>All</Tab>
                            <Tab>ETH</Tab>
                            <Tab>WBTC</Tab>
                            <Tab>Stables</Tab>
                            <Tab>Favorites</Tab>
                        </StyledTabMenu>
                        <TableContent className="trade_price_btc_table">
                            {renderPairs(pairs)}
                        </TableContent>
                    </DropdownContent>
                </DropdownDisplay>
            }
        </DropdownWrapper>
    )
}

export default TokenPairDropdown