import { ipcMain } from "electron";
import { Reminder } from "../types";
import {
  scheduleReminder,
  clearReminderScheduler,
  clearAllSchedulers,
} from "../services/reminderScheduler";
import { showNotification } from "../services/notificationService";
import { playSoundFromMainWindow } from "../services/soundService";
import {
  minimizeMainWindow,
  maximizeMainWindow,
  hideMainWindow,
} from "../windows/mainWindow";
import {
  closeAllOverlays,
  closeOverlaysByReminderId,
} from "../windows/overlayWindow";

export function registerIpcHandlers(): void {
  ipcMain.handle("schedule-reminder", (_, reminder: Reminder) => {
    scheduleReminder(reminder);
    return true;
  });

  ipcMain.handle("clear-reminder", (_, id: string) => {
    clearReminderScheduler(id);
    return true;
  });

  ipcMain.handle("clear-all-reminders", () => {
    clearAllSchedulers();
    return true;
  });

  ipcMain.handle(
    "show-notification",
    (_, { icon, message, color, displayMinutes }) => {
      showNotification(icon, message, color, displayMinutes);
      return true;
    }
  );

  ipcMain.handle(
    "test-reminder",
    (_, { icon, message, color, displayMinutes }) => {
      showNotification(icon, message, color, displayMinutes);
      return true;
    }
  );

  ipcMain.on("close-overlay", () => {
    closeAllOverlays();
  });

  ipcMain.on("close-overlay-by-reminder-id", (_, reminderId: string) => {
    closeOverlaysByReminderId(reminderId);
  });

  ipcMain.on("play-notification-sound", (_, volume: number) => {
    playSoundFromMainWindow(volume).catch((error) => {
      console.error("===> Error playing sound via IPC:", error);
    });
  });

  ipcMain.on("window-minimize", () => {
    minimizeMainWindow();
  });

  ipcMain.on("window-maximize", () => {
    maximizeMainWindow();
  });

  ipcMain.on("window-close", () => {
    hideMainWindow();
  });
}

