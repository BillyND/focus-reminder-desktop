import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppSettings } from "../types/reminder";
import { STORAGE_KEYS, DEFAULTS } from "../constants";

interface SettingsStore {
  settings: AppSettings;
  showSettings: boolean;

  // Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleDarkMode: () => void;
  toggleSound: () => void;
  setSoundVolume: (volume: number) => void;
  setShowSettings: (show: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => {
      // Expose store to window for cross-store access
      if (typeof window !== "undefined") {
        window.__settingsStore = { getState: get };
      }

      return {
        settings: {
          darkMode: false, // Default to light mode
          enabled: true,
          soundEnabled: true,
          soundVolume: DEFAULTS.SOUND_VOLUME,
        },
        showSettings: false,

        updateSettings: (newSettings) =>
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
          })),

        toggleDarkMode: () =>
          set((state) => ({
            settings: { ...state.settings, darkMode: !state.settings.darkMode },
          })),

        toggleSound: () =>
          set((state) => ({
            settings: {
              ...state.settings,
              soundEnabled: !state.settings.soundEnabled,
            },
          })),

        setSoundVolume: (volume) =>
          set((state) => ({
            settings: { ...state.settings, soundVolume: volume },
          })),

        setShowSettings: (show) => set({ showSettings: show }),
      };
    },
    {
      name: STORAGE_KEYS.SETTINGS_STORE,
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);
