import { BrowserWindow } from "electron";
import path from "path";
import { getIconPath } from "../config/paths";

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function setIsQuitting(value: boolean): void {
  isQuitting = value;
}

export function createMainWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 650,
    minWidth: 380,
    minHeight: 500,
    frame: false,
    transparent: false,
    backgroundColor: "#1a1a2e",
    resizable: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    icon: getIconPath(),
  });

  mainWindow.once("ready-to-show", () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
      console.log("===> Window hidden to tray");
    }
  });

  return mainWindow;
}

export function showMainWindow(): void {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  } else {
    createMainWindow();
  }
}

export function hideMainWindow(): void {
  mainWindow?.hide();
}

export function minimizeMainWindow(): void {
  mainWindow?.minimize();
}

export function maximizeMainWindow(): void {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
}

