import React, { useState, createContext } from "react";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "./theme";

const CACHE_KEY = "IS_DARK";

export const ThemeContext = createContext({
  isDark: null,
  toggleTheme: () => {},
});

const ThemeProviders = ({ children }) => {
  const _isDark = localStorage.getItem(CACHE_KEY);

  const [isDark, setIsDark] = useState(() => {
    return _isDark ? JSON.parse(_isDark) : true;
  });

  const toggleTheme = () => {
    setIsDark((prevState) => {
      localStorage.setItem(CACHE_KEY, JSON.stringify(!prevState));
      return !prevState;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProviders;
