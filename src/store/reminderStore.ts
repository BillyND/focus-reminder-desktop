import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { Reminder, ReminderFormData } from "../types/reminder";

interface ReminderStore {
  reminders: Reminder[];
  globalEnabled: boolean;
  activeTab: "reminders" | "add" | "notes" | "messages";
  editingReminder: Reminder | null;

  // Actions
  addReminder: (data: ReminderFormData) => void;
  updateReminder: (id: string, data: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
  toggleGlobalEnabled: () => void;
  setActiveTab: (tab: "reminders" | "add" | "notes" | "messages") => void;
  setEditingReminder: (reminder: Reminder | null) => void;

  // Scheduler sync
  syncAllReminders: () => void;
}

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set, get) => ({
      reminders: [],
      globalEnabled: true,
      activeTab: "reminders",
      editingReminder: null,

      addReminder: (data) => {
        const newReminder: Reminder = {
          ...data,
          id: uuidv4(),
        };
        set((state) => ({
          reminders: [...state.reminders, newReminder],
        }));

        // Schedule the new reminder if globally enabled
        if (get().globalEnabled && newReminder.enabled) {
          window.electronAPI?.scheduleReminder(newReminder);
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
            window.electronAPI?.scheduleReminder(updatedReminder);
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
            window.electronAPI?.scheduleReminder({
              ...reminder,
              enabled: true,
            });
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
              window.electronAPI?.scheduleReminder(reminder);
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
              window.electronAPI?.scheduleReminder(reminder);
            }
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
    }
  )
);
