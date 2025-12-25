import { createContext, useContext, useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { settings, toggleDarkMode } = useSettingsStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(settings.darkMode ? "dark" : "light");
  }, [settings.darkMode]);

  const value = {
    theme: settings.darkMode ? ("dark" as Theme) : ("light" as Theme),
    setTheme: (theme: Theme) => {
      if ((theme === "dark") !== settings.darkMode) {
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
