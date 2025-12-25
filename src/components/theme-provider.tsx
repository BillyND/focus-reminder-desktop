import { createContext, useContext, useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { THEME, type ThemeType } from "@/constants";
import { useShallow } from "zustand/react/shallow";

type Theme = ThemeType;

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const initialState: ThemeProviderState = {
  theme: THEME.LIGHT,
  setTheme: () => null,
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { darkMode, toggleDarkMode } = useSettingsStore(
    useShallow((state) => ({
      darkMode: state.settings.darkMode,
      toggleDarkMode: state.toggleDarkMode,
    }))
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(THEME.LIGHT, THEME.DARK);
    root.classList.add(darkMode ? THEME.DARK : THEME.LIGHT);
  }, [darkMode]);

  const value = {
    theme: darkMode ? (THEME.DARK as Theme) : (THEME.LIGHT as Theme),
    setTheme: (theme: Theme) => {
      if ((theme === THEME.DARK) !== darkMode) {
        toggleDarkMode();
      }
    },
    toggleTheme: () => {
      toggleDarkMode();
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
