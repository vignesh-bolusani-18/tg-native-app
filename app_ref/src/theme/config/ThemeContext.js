import React, { createContext, useMemo, useState, useEffect } from "react";
import {
  createTheme,
  ThemeProvider as MUIThemeProvider,
  StyledEngineProvider,
} from "@mui/material/styles";
import { getDesignTokens } from "./getDesignTokens";
import { CssBaseline } from "@mui/material";




const ThemeContext = createContext({
  toggleTheme: () => {},
  theme: {},
});

const ThemeProvider = ({ children }) => {
  // Load the initial mode from localStorage or default to light
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem("themeMode");
    return savedMode ? savedMode : "light";
  });

  // Save the mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  // Memoize the color mode functions to prevent unnecessary re-renders
  const newTheme = useMemo(
    () => ({
      toggleTheme: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  // Create the theme based on the current mode
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  // theme.components = ComponentsOverrides(theme);

  return (
    <ThemeContext.Provider value={{ ...newTheme, theme }}>
      <StyledEngineProvider injectFirst>
        <MUIThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MUIThemeProvider>
      </StyledEngineProvider>
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
