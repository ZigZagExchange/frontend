import { defaultTheme } from "@xstyled/styled-components";

export const baseColors = {
  ...defaultTheme.colors,
  // brandPrimary: "#6A5ACD",
  // brandSecondary: "#8376D2",
  // activeSecondary: "#FFFFFF",
  zzDarkest: "#171c28",
  zzLightBorder: "rgba(235, 235, 255, 0.08)",

  "teal-100": "#62D2AD",
  "teal-200": "#6699ff",

  // primary text blue
  "blue-100": "#09AAF5",
  "blue-200": "#08CFE8",
  "blue-300": "#51638c",
  "blue-400": "#1c2231",
  "blue-500": "#161B27",
  "blue-600": "#121620",
}

export const lightColors = {
  ...baseColors,
  textPrimary: "#000000",
  textSecondary: "#41474D",
  textTertiary: "#75808A",
  background: '#F5F6FA',
  card: "#FFFFFF",
  icon: "#191C1F", 
  stroke: "#E1E3E9", 
  overlay: "#FBFBFB", 
  red: "rgba(250, 90, 114, 0.7)",
  redSecondary: "#FA5A72",
  green: "rgba(46, 209, 145, 0.7)",
  greenSecondary: "#099552",
  blue: "#1F8AFF",
  yellow: "#FFDC5E",
  scrollThumb: "#FFFFFF",
	textDisabled: "#D0D0D0",
}

export const darkColors = {
  ...baseColors,
  textPrimary: "#FFFFFF",
  textSecondary: "#9B9B9B",
  textTertiary: "#4C4C4D",
  background: '#171c28',
  card: "#08080A", 
  icon: "#E7E7E7", 
  stroke: "#1C1C1E", 
  overlay: "#101011", 
  red: "rgba(255, 95, 119, 0.5)", 
  redSecondary: "#FF5F77",
  green: "rgba(9, 149, 82, 0.5)",
  greenSecondary: "#099552",
  blue: "#007AFF", 
  yellow: "#FFE176",
  scrollThumb: "#4C4C4D",
	textDisabled: "#323232",
}