import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { Reminder, ReminderFormData } from "../types/reminder";

// Helper to convert Reminder to Electron-compatible format
function toElectronReminder(reminder: Reminder): any {
  return {
    id: reminder.id,
    message: reminder.message,
    icon: reminder.icon,
    emoji: reminder.icon, // For backward compatibility
    color: reminder.color,
    type: reminder.type === "scheduled" ? "fixed" : reminder.type, // Map scheduled to fixed for electron
    interval: reminder.interval,
    intervalMinutes: reminder.interval, // For backward compatibility
    times: reminder.times,
    fixedTime: reminder.times?.[0], // For backward compatibility
    displayMinutes: reminder.displayMinutes,
    durationMinutes: reminder.displayMinutes, // For backward compatibility
    enabled: reminder.enabled,
  };
}

// Helper to convert legacy reminder to new format
function convertLegacyReminder(legacy: any): Reminder {
  // Check if already new format
  if (
    legacy.icon !== undefined &&
    (legacy.type === "interval" || legacy.type === "scheduled")
  ) {
    return legacy as Reminder;
  }

  // Convert legacy format
  let newReminder: Reminder;

  if (legacy.type === "interval" || (!legacy.type && legacy.intervalMinutes)) {
    newReminder = {
      id: legacy.id,
      message: legacy.message,
      icon: legacy.icon || legacy.emoji || "💧",
      color: legacy.color,
      type: "interval",
      interval: legacy.interval || legacy.intervalMinutes || 30,
      displayMinutes: legacy.displayMinutes || legacy.durationMinutes || 1,
      enabled: legacy.enabled !== undefined ? legacy.enabled : true,
    };
  } else if (
    legacy.type === "scheduled" ||
    (legacy.type === "fixed" && legacy.fixedTime)
  ) {
    newReminder = {
      id: legacy.id,
      message: legacy.message,
      icon: legacy.icon || legacy.emoji || "💧",
      color: legacy.color,
      type: "scheduled",
      times:
        legacy.times || (legacy.fixedTime ? [legacy.fixedTime] : ["09:00"]),
      displayMinutes: legacy.displayMinutes || legacy.durationMinutes || 1,
      enabled: legacy.enabled !== undefined ? legacy.enabled : true,
    };
  } else {
    // Default to interval
    newReminder = {
      id: legacy.id,
      message: legacy.message,
      icon: legacy.icon || legacy.emoji || "💧",
      color: legacy.color,
      type: "interval",
      interval: 30,
      displayMinutes: legacy.displayMinutes || legacy.durationMinutes || 1,
      enabled: legacy.enabled !== undefined ? legacy.enabled : true,
    };
  }

  return newReminder;
}

interface ReminderStore {
  reminders: Reminder[];
  globalEnabled: boolean;
  activeTab: "reminders" | "add";
  editingReminder: Reminder | null;

  // Actions
  addReminder: (data: ReminderFormData) => void;
  updateReminder: (id: string, data: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
  toggleGlobalEnabled: () => void;
  setActiveTab: (tab: "reminders" | "add") => void;
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
      activeTab: "reminders",
      editingReminder: null,

      addReminder: (data) => {
        // Convert form data to reminder format
        let newReminder: Reminder;

        if (
          "icon" in data &&
          (data.type === "interval" || data.type === "scheduled")
        ) {
          // New format
          newReminder = {
            ...data,
            id: uuidv4(),
          } as Reminder;
        } else {
          // Legacy format - convert
          const legacy = data as any;
          newReminder = {
            id: uuidv4(),
            message: legacy.message,
            icon: legacy.emoji || legacy.icon || "💧",
            color: legacy.color,
            displayMinutes:
              legacy.durationMinutes || legacy.displayMinutes || 1,
            enabled: legacy.enabled ?? true,
            type: legacy.type === "fixed" ? "scheduled" : "interval",
            interval:
              legacy.type === "interval"
                ? legacy.intervalMinutes || legacy.interval || 30
                : undefined,
            times:
              legacy.type === "fixed"
                ? legacy.fixedTime
                  ? [legacy.fixedTime]
                  : ["09:00"]
                : undefined,
          };
        }

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
        const settingsStore = (window as any).__settingsStore;
        const settings = settingsStore?.getState()?.settings || {
          darkMode: false,
          soundEnabled: true,
          soundVolume: 30,
        };

        const data = {
          reminders: reminders.map((r) => convertLegacyReminder(r)),
          settings: {
            darkMode: settings.darkMode,
            enabled: globalEnabled,
            soundEnabled: settings.soundEnabled,
            soundVolume: settings.soundVolume || 30,
          },
          version: "1.1.0",
        };
        return JSON.stringify(data, null, 2);
      },

      importData: (dataString) => {
        try {
          const data = JSON.parse(dataString);
          if (!data.reminders || !data.settings) return false;

          // Convert and import reminders
          const convertedReminders = data.reminders.map(convertLegacyReminder);
          set({ reminders: convertedReminders });
          set({ globalEnabled: data.settings.enabled !== false });

          // Import settings
          const settingsStore = (window as any).__settingsStore;
          if (settingsStore) {
            settingsStore.getState().updateSettings({
              darkMode: data.settings.darkMode ?? false,
              soundEnabled: data.settings.soundEnabled ?? true,
              soundVolume: data.settings.soundVolume ?? 30,
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
        const settingsStore = (window as any).__settingsStore;
        if (settingsStore) {
          settingsStore.getState().updateSettings({
            darkMode: false,
            soundEnabled: true,
            soundVolume: 30,
          });
        }
      },
    }),
    {
      name: "focus-reminder-desktop-storage",
      partialize: (state) => ({
        reminders: state.reminders,
        globalEnabled: state.globalEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        // Migrate legacy reminders on load
        if (state?.reminders) {
          state.reminders = state.reminders.map(convertLegacyReminder);
        }
      },
    }
  )
);
