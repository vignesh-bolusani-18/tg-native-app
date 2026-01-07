import { darkComponents, darkPalette } from "../custmizations/darkMode";
import { lightComponents, lightPalette } from "../custmizations/lightMode";
import { typographyVariants } from "../custmizations/typographyVariants";

export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === "light" ? lightPalette : darkPalette),
  },
  components: {
    ...(mode === "light" ? lightComponents : darkComponents),
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  typography: typographyVariants,
});
