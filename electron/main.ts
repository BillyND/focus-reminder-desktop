import { app, Notification } from "electron";
import {
  createMainWindow,
  showMainWindow,
  setIsQuitting,
} from "./windows/mainWindow";
import { createTray, destroyTray } from "./tray/systemTray";
import { clearAllSchedulers } from "./services/reminderScheduler";
import { registerIpcHandlers } from "./ipc/handlers";

app.whenReady().then(() => {
  if (Notification.isSupported()) {
    console.log("===> Notifications supported");
  }

  createTray();
  createMainWindow();
  registerIpcHandlers();

  app.on("activate", () => {
    showMainWindow();
  });
});

app.on("window-all-closed", () => {
  console.log("===> All windows closed, keeping app running in background");
});

app.on("before-quit", () => {
  setIsQuitting(true);
  clearAllSchedulers();
  destroyTray();
});
