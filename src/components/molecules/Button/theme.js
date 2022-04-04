import { scales, variants } from "./types";
import { darkColors } from "../../../lib/theme/colors"

export const scaleVariants = {
  [scales.LG]: {
    height: "41px",
	fontFamily: "Work Sans",
	fontWeight: "700",
	fontSize: "16px",
	lineHeight: "17px",
	padding: "12px 24px"
  },
  [scales.IMD]: {
    height: "32px",
	fontFamily: "Work Sans",
	fontWeight: "700",
	fontSize: "12px",
	lineHeight: "13px",
	padding: "9.5px 16px"
  },
  [scales.MD]: {
    height: "29px",
	fontFamily: "Work Sans",
	fontWeight: "700",
	fontSize: "12px",
	lineHeight: "13px",
	padding: "8px 16px"
  },
  [scales.SM]: {
    height: "21px",
	fontFamily: "Work Sans",
	fontWeight: "700",
	fontSize: "12px",
	lineHeight: "13px",
	padding: "4px 16px"
  },
};

export const styleVariants = (theme) => {
	return {
		[variants.PRIMARY]: {
			background: `linear-gradient(93.46deg, ${theme.colors.primaryHighEmphasis} 16.94%, ${theme.colors.secondaryHighEmphasis} 97.24%)`,
			boxShadow: theme.colors.gradientBtnBoxShadow,
			color:  theme.colors.foregroundHighEmphasis,
			":active": {
				background: `${theme.colors.gradBtnInvert} padding-box, ${theme.colors.strokeGradNorm} border-box`,
				boxShadow: theme.colors.gradientBtnPressedBoxShadow,
				color: darkColors.textSecondary
			},
			":hover:not(:active):not(:disabled)": {
				background: 'linear-gradient(93.46deg, rgba(42, 171, 238, 0.19) 16.94%, rgba(12, 207, 207, 0.19) 97.24%)'
			},
			// ":focus:not(:active):not(:disabled)": {
			// 	border: "4px solid",
			// 	borderImageSource: theme.colors.strokeGradNorm,
			// 	boxShadow: theme.colors.gradientBtnFocusBoxShadow,
			// },
			":disabled": {
				background: `${theme.colors.backgroundMediumEmphasis}`,
				color:  theme.colors.foregroundMediumEmphasis,
			},
		},
		[variants.SECONDARY]: {
			background: `linear-gradient(${theme.colors.flatGlobal}, ${theme.colors.flatGlobal}) padding-box, ${theme.colors.strokeGradNorm} border-box`,
			boxShadow: theme.colors.gradientBtnBoxShadow,
			border: "1px solid",
			borderImageSource: theme.colors.strokeGradNorm,
			color: theme.colors.textPrimary,
			borderImageSlice: 0,
			":active": {
				background: `linear-gradient(${theme.colors.flatGlobal}, ${theme.colors.flatGlobal}) padding-box, ${theme.colors.strokeGradNorm} border-box`,
				boxShadow: theme.colors.gradientBtnPressedBoxShadow,
			},
			":hover:not(:active):not(:disabled)": {
				border: "1px solid",
				borderImageSource: theme.colors.strokeGradNorm,
				boxShadow: theme.colors.gradientBtnHoverBoxShadow,
				borderImageSlice: 0,
			},
			// ":focus:not(:active):not(:disabled)": {
			// 	border: theme.name === "Dark" ? `4px solid ${theme.colors.strokeFlatNorm}` : "4px solid",
			// 	borderImageSource: theme.name === "Dark" ? "" : theme.colors.strokeGradNorm,
			// 	boxShadow: theme.colors.gradientBtnFocusBoxShadow,
			// },
			":disabled": {
				boxShadow: "",
				border: theme.name === "Dark" ? `2px solid ${theme.colors.strokeFlatNorm}` : "2px solid",
				borderImageSource: theme.name === "Dark" ? "" : theme.colors.strokeGradNorm,
				color:  theme.colors.textOnDisabled
			},
		},
		[variants.TERTIARY]: {
			background: theme.colors.btnFlatBg,
			border: "0px",
			boxShadow: "none",
			color: theme.colors.textPrimary,
			":active": {
				background: theme.colors.btnBGSecondary,
				color: theme.colors.textOnHover,
			},
			":hover:not(:active):not(:disabled)": {
				color: theme.colors.textPrimary,
				background: theme.colors.btnFlatBg,
				boxShadow: theme.colors.flatBtnHoverBoxShadow,
			},
			":disabled": {
				background: theme.colors.btnBGSecondary,
				border: `1px solid ${theme.colors.strokeFlatNorm}`,
				color: theme.colors.textOnDisabled
			},
		},
	}
};
