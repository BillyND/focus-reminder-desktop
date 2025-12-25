import { Tray, Menu, nativeImage } from "electron";
import { getIconPath } from "../config/paths";
import { clearAllSchedulers } from "../services/reminderScheduler";
import {
  getMainWindow,
  showMainWindow,
  hideMainWindow,
  createMainWindow,
  setIsQuitting,
} from "../windows/mainWindow";
import { app } from "electron";

let tray: Tray | null = null;

export function createTray(): void {
  const icon = nativeImage.createFromPath(getIconPath());
  const trayIcon = icon.resize({ width: 16, height: 16 });
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show Window",
      click: () => {
        showMainWindow();
      },
    },
    {
      label: "Hide Window",
      click: () => {
        hideMainWindow();
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        setIsQuitting(true);
        clearAllSchedulers();
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Focus Reminder Desktop");
  tray.setContextMenu(contextMenu);

  tray.on("double-click", () => {
    const mainWindow = getMainWindow();
    if (mainWindow?.isVisible()) {
      hideMainWindow();
    } else {
      showMainWindow();
    }
  });

  console.log("===> System tray created");
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
