/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { MilitaryThemeType, ThemeColors, THEMES } from "../utils/themeTokens";

interface MilitaryThemeContextType {
  activeTheme: MilitaryThemeType;
  setActiveTheme: (theme: MilitaryThemeType) => void;
  colors: ThemeColors;
}

const MilitaryThemeContext = createContext<MilitaryThemeContextType | undefined>(undefined);

export const MilitaryThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveThemeState] = useState<MilitaryThemeType>(() => {
    try {
      const saved = localStorage.getItem("military_active_theme") as MilitaryThemeType;
      if (saved && THEMES[saved]) {
        return saved;
      }
    } catch (e) {
      console.warn("localStorage read blocked in MilitaryThemeProvider:", e);
    }
    return "forest"; // default is military green / forest command!
  });

  const setActiveTheme = (theme: MilitaryThemeType) => {
    if (THEMES[theme]) {
      setActiveThemeState(theme);
      try {
        localStorage.setItem("military_active_theme", theme);
      } catch (e) {
        console.warn("localStorage write blocked in MilitaryThemeProvider:", e);
      }
    }
  };

  // Sync with main html tag classes
  useEffect(() => {
    try {
      const root = window.document.documentElement;
      root.classList.remove("theme-forest", "theme-night", "theme-desert", "theme-arctic");
      root.classList.add(`theme-${activeTheme}`);
    } catch (e) {
      console.warn("Error syncing theme class on document element:", e);
    }
  }, [activeTheme]);

  const colors = THEMES[activeTheme];

  return (
    <MilitaryThemeContext.Provider value={{ activeTheme, setActiveTheme, colors }}>
      {children}
    </MilitaryThemeContext.Provider>
  );
};

export const useMilitaryTheme = () => {
  const context = useContext(MilitaryThemeContext);
  if (!context) {
    throw new Error("useMilitaryTheme must be used within a MilitaryThemeProvider");
  }
  return context;
};
