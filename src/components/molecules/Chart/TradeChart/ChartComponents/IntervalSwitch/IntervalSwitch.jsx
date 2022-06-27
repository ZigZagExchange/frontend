import { useRef, useState } from "react";
import styled from "styled-components";
import { useHandleClickOutside } from "../../ChartUtils/helpers";
import { ChartHeaderItem } from "../ChartHeader";
import { ChartDropdown, ChartDropdownContent } from "../ChartDropdown";
import { HiChevronDown, HiOutlineStar, HiStar } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { addFavouriteInterval, favouriteIntervalsSelector } from "lib/store/features/chart/chartSlice";

const Interval = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    vertical-align: center;

    margin: 2px 6px;
    padding: 2px 6px;
    color: '#ffff';
    /*${({selected}) => selected ? 'border: 1px solid rgba(250, 250, 250, .4);' : 'border: 1px solid rgba(0, 0, 0, 0);'}*/
    ${({selected}) => selected ? 'color: white; font-weight: bold;' : ''}

    .value {
        
    }

    span {
        margin-top: 4px;
        padding: 6px 2px;
        font-size: 14px;
        font-weight: bold;
    }
`;

export const IntervalSwitch = ({interval, intervals, setInterval}) => {
    const dispatch = useDispatch();
    const ref = useRef();

    const [show, setShow] = useState(false);
    const favourites = useSelector(favouriteIntervalsSelector);

    useHandleClickOutside(ref, () => {
        setShow(false);
    });

    //filter out current selected
    const favouriteIntervals = favourites
    .filter((fav) => fav.value !== interval)
    .map((fav, key) => {
        return (
            <Interval key={key}>
                <div onClick={() => {
                    //remove fav
                }}>
                    <HiStar/>
                </div>
                
                <div className="value"
                    onClick={() => {
                    setInterval(fav.value);
                }}>
                    {fav.string}
                </div>
            </Interval>
        )
    });

    const isFavourited = (item) => {
        let items = favourites.filter((i) => i.value === item.value);
        if(items.length) return true;
        return false;
    }

    return (
        <ChartHeaderItem ref={ref}>
            <div  onClick={() => setShow(!show)}>
                {/* current interval */}
                <span>{interval}</span>
                <HiChevronDown/>
            </div>
            {/* dropdown */}
            <ChartDropdown>
                <ChartDropdownContent display={show}>

                    {intervals.map((i, key) => {
                        //seperator
                        if(i.value === undefined){
                            return (
                                <Interval key={key}>
                                    <span>{i.string}</span>
                                    <HiChevronDown/>
                                </Interval>
                            )
                        }
                        const favourited = isFavourited(i);
                        return (
                            <Interval key={key} 
                                selected={i.value === interval}
                            >
                                <div className="value"
                                    onClick={() => {
                                    setInterval(i.value);
                                    setShow(false);
                                }}>
                                    {i.string}
                                </div>
                                <div onClick={() => {
                                    console.log("adding new fav: ", i);
                                    dispatch(addFavouriteInterval(i))
                                }}>
                                    {favourited ? <HiStar/> : <HiOutlineStar/> }
                                </div>
                            </Interval>
                        )
                    })}
                </ChartDropdownContent>
            </ChartDropdown>

            {/* favourite intervals */}
            {favouriteIntervals}
        </ChartHeaderItem>
    );
}