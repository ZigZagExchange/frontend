import { scales, variants } from "./types";

export const scaleVariants = {
  [scales.LG]: {
    height: "41px",
    fontFamily: "WorkSans-Bold",
    fontSize: "16px",
    lineHeight: "17px",
    padding: "12px 24px",
  },
  [scales.IMD]: {
    height: "32px",
    fontFamily: "WorkSans-Bold",
    fontSize: "12px",
    lineHeight: "13px",
    padding: "9.5px 16px",
  },
  [scales.MD]: {
    height: "29px",
    fontFamily: "WorkSans-Bold",
    fontSize: "12px",
    lineHeight: "13px",
    padding: "8px 15px",
  },
  [scales.SM]: {
    height: "21px",
    fontFamily: "WorkSans-Bold",
    fontSize: "12px",
    lineHeight: "13px",
    padding: "4px 16px",
  },
};

export const styleVariants = (theme) => {
  return {
    [variants.PRIMARY]: {
      background: `linear-gradient(93.46deg, ${theme.colors.primaryHighEmphasis} 16.94%, ${theme.colors.secondaryHighEmphasis} 97.24%)`,
      boxShadow: theme.colors.gradientBtnBoxShadow,
      color: theme.colors.foregroundHighEmphasis,
      ":hover:not(:active):not(:disabled)": {
        background:
          "linear-gradient(93.46deg, rgba(42, 171, 238, 0.19) 16.94%, rgba(12, 207, 207, 0.19) 97.24%)",
      },
      // ":focus:not(:active):not(:disabled)": {
      // 	border: "4px solid",
      // 	borderImageSource: theme.colors.strokeGradNorm,
      // 	boxShadow: theme.colors.gradientBtnFocusBoxShadow,
      // },
      ":disabled": {
        background: `${theme.colors.backgroundMediumEmphasis}`,
        opacity: "0.5",
        color: theme.colors.foregroundMediumEmphasis,
        boxShadow: theme.colors.gradientBtnBoxShadow,
      },
    },
    [variants.OUTLINED]: {
      background: "transparent",
      border: `1px solid ${theme.colors.foreground400}`,
      color: theme.colors.foregroundHighEmphasis,
      boxSizing: "border-box",
      ":hover:not(:active):not(:disabled)": {
        color: theme.colors.foregroundMediumEmphasis,
      },
      ":disabled": {
        background: "transparent",
        opacity: "0.5",
        border: `1px solid ${theme.colors.foreground400}`,
        color: theme.colors.foreground900,
      },
    },
    [variants.BUY]: {
      background: theme.colors.successHighEmphasis,
      boxShadow: theme.colors.gradientBtnBoxShadow,
      color: theme.colors.backgroundMediumEmphasis,
      textShadow: theme.colors.buyBtnBoxShadow,
      ":hover:not(:active):not(:disabled)": {
        boxShadow: theme.colors.gradientBtnBoxShadow,
        background: theme.colors.successMediumEmphasis,
      },
      ":disabled": {
        boxShadow: theme.colors.gradientBtnBoxShadow,
        background: theme.colors.successDisabled,
      },
    },
    [variants.SELL]: {
      background: theme.colors.dangerHighEmphasis,
      boxShadow: theme.colors.gradientBtnBoxShadow,
      color: theme.colors.foregroundHighEmphasis,
      textShadow: theme.colors.buyBtnBoxShadow,
      ":hover:not(:active):not(:disabled)": {
        boxShadow: theme.colors.gradientBtnBoxShadow,
        background: theme.colors.dangerMediumEmphasis,
      },
      ":disabled": {
        boxShadow: theme.colors.gradientBtnBoxShadow,
        color: theme.colors.foregroundDisabled,
        background: theme.colors.dangerDisabled,
      },
    },
  };
};
