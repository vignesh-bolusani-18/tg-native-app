import { createTheme } from "@mui/material/styles";
import { getDesignTokens } from "./getDesignTokens";

export const getAppTheme = (mode) => {
  return createTheme(getDesignTokens(mode));
};
