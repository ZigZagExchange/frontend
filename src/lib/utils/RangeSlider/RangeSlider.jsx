import React from "react";
// css
import "./RangeSlider.css";
// library
import { Slider, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
    thumb: {
        backgroundColor: "#e1e1e1",
        borderRadius: "50%",
        width: "20px",
        height: "20px",
        display: "flex",
        outline: 0,
        marginLeft: "-11px",
        position: "absolute",
        boxSizing: "border-box",
        border: "1px solid #000",
        transition: "box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        "&::after": {
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            backgroundColor: "#171c28",
            content: "",
            width: "10px",
            height: "10px",
        },
    },
    root: {
        height: "6px",
        backgroundColor: "#6c768c",
        width: "100%",
        cursor: "pointer",
        display: "inline-block",
        padding: "0",
        position: "relative",
        boxSizing: "content-box",
        touchAction: "none",
    },
    active: {
        boxShadow: "none !important",
    },
}));

const marks = [
    {
        value: 0,
    },
    {
        value: 25,
    },
    {
        value: 50,
    },
    {
        value: 75,
    },
    {
        value: 100,
    },
];
const RangeSlider = (props) => {
    const classes = useStyles();
    return (
        <>
            <Slider
                defaultValue={0}
                aria-labelledby="discrete-slider-always"
                step={1}
                marks={marks}
                classes={{
                    mark: "custom_range",
                    thumb: classes.thumb,
                    root: classes.root,
                    active: classes.active,
                }}
                value={props.value}
                onChange={props.onChange}
            />
        </>
    );
};

export default RangeSlider;
