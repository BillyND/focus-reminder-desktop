// Type definitions for Electron API exposed via preload
import { Reminder } from "./reminder";
import { AppSettings } from "./reminder";

export interface ElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  scheduleReminder: (reminder: Reminder) => Promise<boolean>;
  clearReminder: (id: string) => Promise<boolean>;
  clearAllReminders: () => Promise<boolean>;
  showNotification: (data: {
    icon: string;
    message: string;
    color: string;
    displayMinutes: number;
  }) => Promise<boolean>;
  testReminder: (data: {
    icon: string;
    message: string;
    color: string;
    displayMinutes: number;
  }) => Promise<boolean>;
  closeOverlay: () => void;
  playNotificationSound: (volume: number) => void;
  stopNotificationSound: () => void;
}

interface SettingsStoreAPI {
  getState: () => {
    settings: AppSettings;
    updateSettings: (settings: Partial<AppSettings>) => void;
  };
}

interface SoundFunctionsAPI {
  playNotificationSound: (volume: number) => Promise<void>;
  playNotificationSoundRepeatedly: (
    volume: number,
    intervalMs?: number
  ) => () => void;
  stopAllSounds: () => void;
  stopRepeatedSound: () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    __settingsStore?: SettingsStoreAPI;
    __soundFunctions?: SoundFunctionsAPI;
  }
}
