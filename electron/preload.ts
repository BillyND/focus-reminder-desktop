import { contextBridge, ipcRenderer } from "electron";

export interface Reminder {
  id: string;
  message: string;
  icon: string;
  color: string;
  type: "interval" | "scheduled";
  interval?: number;
  times?: string[];
  displayMinutes: number;
  enabled: boolean;
}

contextBridge.exposeInMainWorld("electronAPI", {
  // Window controls
  minimizeWindow: () => ipcRenderer.send("window-minimize"),
  maximizeWindow: () => ipcRenderer.send("window-maximize"),
  closeWindow: () => ipcRenderer.send("window-close"),

  // Reminder scheduling
  scheduleReminder: (reminder: Reminder) =>
    ipcRenderer.invoke("schedule-reminder", reminder),
  clearReminder: (id: string) => ipcRenderer.invoke("clear-reminder", id),
  clearAllReminders: () => ipcRenderer.invoke("clear-all-reminders"),

  // Notifications
  showNotification: (data: {
    icon: string;
    message: string;
    color: string;
    displayMinutes: number;
  }) => ipcRenderer.invoke("show-notification", data),
  testReminder: (data: {
    icon: string;
    message: string;
    color: string;
    displayMinutes: number;
  }) => ipcRenderer.invoke("test-reminder", data),

  // Overlay
  closeOverlay: () => ipcRenderer.send("close-overlay"),

  // Sound
  playNotificationSound: (volume: number) =>
    ipcRenderer.send("play-notification-sound", volume),
});

// Type declarations for window.electronAPI
declare global {
  interface Window {
    electronAPI: {
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
    };
  }
}
