import React from "react";
import { useTheme } from "styled-components"
// css
import "./RangeSlider.css";
// library
import { Slider, makeStyles } from "@material-ui/core";

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
export const RangeSlider = (props) => {
  const theme = useTheme()
  const useStyles = makeStyles(() => ({
    thumb: {
      backgroundColor: "#47485C",
      borderRadius: "50%",
      width: "12px",
      height: "12px",
      display: "flex",
      outline: 0,
      marginLeft: "-10px",
      position: "absolute",
      boxSizing: "border-box",
      border: "1px solid #47485C",
      transition: "box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
      "&::after": {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%,-50%)",
        background: `linear-gradient(93.46deg, ${theme.colors.primaryHighEmphasis} 16.94%, ${theme.colors.secondaryHighEmphasis} 97.24%)`,
        content: "",
        width: "9px",
        height: "9px",
      },
    },
    root: {
      height: "4px",
      backgroundColor: theme.colors.foreground400,
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

  const classes = useStyles()
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
