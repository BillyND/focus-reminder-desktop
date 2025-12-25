import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppSettings } from "../types/reminder";
import { STORAGE_KEYS, DEFAULTS } from "../constants";
import i18n from "../i18n/config";

interface SettingsStore {
  settings: AppSettings;
  showSettings: boolean;

  // Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleSound: () => void;
  setSoundVolume: (volume: number) => void;
  setShowSettings: (show: boolean) => void;
  setLanguage: (language: string) => void;
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
          enabled: true,
          soundEnabled: true,
          soundVolume: DEFAULTS.SOUND_VOLUME,
          language: "en",
        },
        showSettings: false,

        updateSettings: (newSettings) =>
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
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

        setLanguage: (language) => {
          i18n.changeLanguage(language);
          set((state) => ({
            settings: { ...state.settings, language },
          }));
        },
      };
    },
    {
      name: STORAGE_KEYS.SETTINGS_STORE,
      partialize: (state) => ({
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.settings.language) {
          i18n.changeLanguage(state.settings.language);
        }
      },
    }
  )
);
