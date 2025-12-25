import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { Reminder, ReminderFormData } from "../types/reminder";
import { TabType } from "../types/common";
import {
  STORAGE_KEYS,
  TAB,
  DEFAULTS,
  APP_VERSION,
  REMINDER_TYPE,
} from "../constants";
import { toElectronReminder, validateReminderForm } from "../utils/reminder";

interface ReminderStore {
  reminders: Reminder[];
  globalEnabled: boolean;
  activeTab: TabType;
  editingReminder: Reminder | null;

  // Actions
  addReminder: (data: ReminderFormData) => void;
  updateReminder: (id: string, data: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
  toggleGlobalEnabled: () => void;
  setActiveTab: (tab: TabType) => void;
  setEditingReminder: (reminder: Reminder | null) => void;

  // Scheduler sync
  syncAllReminders: () => void;

  // Data management
  exportData: () => string;
  importData: (data: string) => boolean;
  resetAll: () => void;
}

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set, get) => ({
      reminders: [],
      globalEnabled: true,
      activeTab: TAB.REMINDERS,
      editingReminder: null,

      addReminder: (data) => {
        // Validate form data
        const validation = validateReminderForm(data);
        if (!validation.valid) {
          console.error("===> Validation error", validation.error);
          return;
        }

        // Convert form data to reminder format
        const newReminder: Reminder = {
          ...data,
          id: uuidv4(),
        };

        set((state) => ({
          reminders: [...state.reminders, newReminder],
        }));

        // Schedule the new reminder if globally enabled
        if (get().globalEnabled && newReminder.enabled) {
          window.electronAPI?.scheduleReminder(toElectronReminder(newReminder));
        }
      },

      updateReminder: (id, data) => {
        let updatedReminder: Reminder | undefined;

        set((state) => {
          const updated = state.reminders.map((r) => {
            if (r.id === id) {
              updatedReminder = { ...r, ...data };
              return updatedReminder;
            }
            return r;
          });
          return { reminders: updated };
        });

        if (updatedReminder) {
          // Clear and reschedule
          window.electronAPI?.clearReminder(id);
          if (get().globalEnabled && updatedReminder.enabled) {
            window.electronAPI?.scheduleReminder(
              toElectronReminder(updatedReminder)
            );
          }
        }
      },

      deleteReminder: (id) => {
        window.electronAPI?.clearReminder(id);
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
        }));
      },

      toggleReminder: (id) => {
        const reminder = get().reminders.find((r) => r.id === id);
        if (reminder) {
          const newEnabled = !reminder.enabled;
          set((state) => ({
            reminders: state.reminders.map((r) =>
              r.id === id ? { ...r, enabled: newEnabled } : r
            ),
          }));

          if (newEnabled && get().globalEnabled) {
            window.electronAPI?.scheduleReminder(
              toElectronReminder({ ...reminder, enabled: true })
            );
          } else {
            window.electronAPI?.clearReminder(id);
          }
        }
      },

      toggleGlobalEnabled: () => {
        const newGlobalEnabled = !get().globalEnabled;
        set({ globalEnabled: newGlobalEnabled });

        if (newGlobalEnabled) {
          // Re-schedule all enabled reminders
          get().reminders.forEach((reminder) => {
            if (reminder.enabled) {
              window.electronAPI?.scheduleReminder(
                toElectronReminder(reminder)
              );
            }
          });
        } else {
          // Clear all schedulers
          window.electronAPI?.clearAllReminders();
        }
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      setEditingReminder: (reminder) => set({ editingReminder: reminder }),

      syncAllReminders: () => {
        const { reminders, globalEnabled } = get();
        window.electronAPI?.clearAllReminders();

        if (globalEnabled) {
          reminders.forEach((reminder) => {
            if (reminder.enabled) {
              window.electronAPI?.scheduleReminder(
                toElectronReminder(reminder)
              );
            }
          });
        }
      },

      exportData: () => {
        const { reminders, globalEnabled } = get();
        // Dynamic import to avoid circular dependency
        const settingsStore = window.__settingsStore;
        const settings = settingsStore?.getState()?.settings || {
          darkMode: false,
          soundEnabled: true,
          soundVolume: DEFAULTS.SOUND_VOLUME,
        };

        const data = {
          reminders,
          settings: {
            darkMode: settings.darkMode,
            enabled: globalEnabled,
            soundEnabled: settings.soundEnabled,
            soundVolume: settings.soundVolume || DEFAULTS.SOUND_VOLUME,
          },
          version: APP_VERSION,
        };
        return JSON.stringify(data, null, 2);
      },

      importData: (dataString) => {
        try {
          const data = JSON.parse(dataString);
          if (!data.reminders || !data.settings) return false;

          // Import reminders (validate they are in correct format)
          const validReminders = (data.reminders as unknown[]).filter(
            (r): r is Reminder =>
              typeof r === "object" &&
              r !== null &&
              "id" in r &&
              typeof r.id === "string" &&
              "message" in r &&
              typeof r.message === "string" &&
              "icon" in r &&
              typeof r.icon === "string" &&
              "color" in r &&
              typeof r.color === "string" &&
              "type" in r &&
              typeof r.type === "string" &&
              (r.type === REMINDER_TYPE.INTERVAL ||
                r.type === REMINDER_TYPE.SCHEDULED) &&
              "displayMinutes" in r &&
              typeof r.displayMinutes === "number" &&
              "enabled" in r &&
              typeof r.enabled === "boolean"
          );

          set({ reminders: validReminders });
          set({ globalEnabled: data.settings.enabled !== false });

          // Import settings
          const settingsStore = window.__settingsStore;
          if (settingsStore) {
            settingsStore.getState().updateSettings({
              darkMode: data.settings.darkMode ?? false,
              soundEnabled: data.settings.soundEnabled ?? true,
              soundVolume: data.settings.soundVolume ?? DEFAULTS.SOUND_VOLUME,
            });
          }

          // Resync reminders
          get().syncAllReminders();
          return true;
        } catch {
          return false;
        }
      },

      resetAll: () => {
        window.electronAPI?.clearAllReminders();
        set({ reminders: [], globalEnabled: true });
        const settingsStore = window.__settingsStore;
        if (settingsStore) {
          settingsStore.getState().updateSettings({
            darkMode: false,
            soundEnabled: true,
            soundVolume: DEFAULTS.SOUND_VOLUME,
          });
        }
      },
    }),
    {
      name: STORAGE_KEYS.REMINDER_STORE,
      partialize: (state) => ({
        reminders: state.reminders,
        globalEnabled: state.globalEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        // Validate reminders on load
        if (state?.reminders) {
          state.reminders = state.reminders.filter(
            (r) =>
              r.id &&
              r.message &&
              r.icon &&
              r.color &&
              r.type &&
              (r.type === REMINDER_TYPE.INTERVAL ||
                r.type === REMINDER_TYPE.SCHEDULED) &&
              r.displayMinutes !== undefined &&
              r.enabled !== undefined
          );
        }
      },
    }
  )
);
