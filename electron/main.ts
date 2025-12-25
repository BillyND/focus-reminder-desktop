import {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  screen,
  Tray,
  Menu,
  nativeImage,
} from "electron";
import path from "path";

// Constants
const REMINDER_TYPE = {
  INTERVAL: "interval",
  SCHEDULED: "scheduled",
} as const;

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
let reminderIntervals: Map<string, NodeJS.Timeout> = new Map();
let fixedTimeCheckers: Map<string, NodeJS.Timeout> = new Map();
let lastFixedTimeTriggers: Map<string, string> = new Map(); // Track last trigger time to prevent duplicates

function getIconPath() {
  return path.join(__dirname, "../public/icon.png");
}

function getSoundFilePath() {
  return path.join(__dirname, "../public/alarm.mp3");
}

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 650,
    minWidth: 380,
    minHeight: 500,
    frame: false,
    transparent: false,
    backgroundColor: "#1a1a2e",
    resizable: true,
    show: false, // Don't show until ready
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    icon: getIconPath(),
  });

  // Show window when ready to prevent visual flash
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

  // Prevent window from closing, hide to tray instead
  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
      console.log("===> Window hidden to tray");
    }
  });
}

function createOverlayWindow(
  icon: string,
  message: string,
  color: string,
  displayMinutes: number,
  soundEnabled: boolean = true,
  soundVolume: number = 30
) {
  if (overlayWindow) {
    overlayWindow.close();
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // Get sound file path (same approach as getIconPath)
  const soundFilePath = getSoundFilePath();
  const soundFileUrl = `file://${soundFilePath.replace(/\\/g, "/")}`;

  overlayWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: true,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  overlayWindow.setVisibleOnAllWorkspaces(true);
  overlayWindow.setAlwaysOnTop(true, "screen-saver");

  const overlayHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.85);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: fadeIn 0.3s ease-out;
          cursor: pointer;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .container {
          text-align: center;
          animation: slideUp 0.4s ease-out;
        }
        .emoji {
          font-size: 120px;
          margin-bottom: 30px;
          animation: pulse 2s infinite;
        }
        .message {
          font-size: 36px;
          color: white;
          font-weight: 600;
          max-width: 80%;
          margin: 0 auto 30px;
          line-height: 1.4;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .color-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${color};
          margin: 0 auto 20px;
          box-shadow: 0 0 20px ${color};
        }
        .close-hint {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          margin-top: 40px;
        }
        .progress-bar {
          width: 200px;
          height: 4px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
          margin: 20px auto 0;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: ${color};
          animation: shrink ${displayMinutes * 60}s linear forwards;
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="color-indicator"></div>
        <div class="emoji">${icon}</div>
        <div class="message">${message}</div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <div class="close-hint">Click anywhere or ESC to close</div>
      </div>
      <script>
        let soundInterval = null;
        let audioElement = null;
        
        // Sound playing function using HTMLAudioElement
        function playNotificationSound(volume, soundUrl) {
          try {
            if (!audioElement) {
              console.log('===> Creating new audio element with URL:', soundUrl);
              audioElement = new Audio(soundUrl);
              audioElement.preload = "auto";
              
              // Add error handler
              audioElement.addEventListener('error', (e) => {
                console.error('===> Audio element error:', e);
                console.error('===> Audio error details:', audioElement.error);
              });
              
              audioElement.addEventListener('canplay', () => {
                console.log('===> Audio can play');
              });
              
              audioElement.addEventListener('canplaythrough', () => {
                console.log('===> Audio fully loaded');
              });
            }
            audioElement.volume = Math.max(0, Math.min(1, volume / 100));
            audioElement.currentTime = 0;
            const playPromise = audioElement.play();
            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                console.error('===> Error playing sound:', error);
                if (error.name === 'NotAllowedError') {
                  console.error('===> Audio play blocked - autoplay policy');
                }
              });
            }
          } catch (error) {
            console.error('===> Error in playNotificationSound:', error);
          }
        }
        
        // Start repeated sound playing
        function startRepeatedSound(volume, soundUrl) {
          // Play immediately
          playNotificationSound(volume, soundUrl);
          
          // Play every 5 seconds
          soundInterval = setInterval(() => {
            playNotificationSound(volume, soundUrl);
          }, 5000);
        }
        
        // Stop repeated sound
        function stopRepeatedSound() {
          if (soundInterval) {
            clearInterval(soundInterval);
            soundInterval = null;
          }
          if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
          }
        }
        
        // Close handler and sound playing
        function initSound() {
          // Play sound repeatedly if enabled
          if (${soundEnabled}) {
            console.log('===> Starting repeated sound, volume:', ${soundVolume}, 'url:', '${soundFileUrl}');
            startRepeatedSound(${soundVolume}, '${soundFileUrl}');
          }
        }
        
        // Try to play sound immediately when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initSound);
        } else {
          initSound();
        }
        
        // Also try on window load as backup
        window.addEventListener('load', () => {
          if (${soundEnabled} && !soundInterval) {
            console.log('===> Window loaded, starting sound');
            initSound();
          }
        });
        
        function closeOverlay() {
          // Stop sound when closing
          stopRepeatedSound();
          if (window.electronAPI) {
            window.electronAPI.closeOverlay();
          }
        }
        document.body.addEventListener('click', closeOverlay);
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' || e.key === 'Enter') {
            closeOverlay();
          }
        });
        
        // Stop sound when window is about to close
        window.addEventListener('beforeunload', () => {
          stopRepeatedSound();
        });
      </script>
    </body>
    </html>
  `;

  overlayWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(overlayHTML)}`
  );

  // Auto-close after duration
  const autoCloseTimeout = setTimeout(() => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.close();
      overlayWindow = null;
    }
  }, displayMinutes * 60 * 1000);

  overlayWindow.on("closed", () => {
    clearTimeout(autoCloseTimeout);
    overlayWindow = null;
  });

  // Handle close via IPC
  overlayWindow.webContents.on("did-finish-load", () => {
    // Inject close handler that uses IPC
    overlayWindow?.webContents
      .executeJavaScript(
        `
      (function() {
        function closeOverlay() {
          window.electronAPI?.closeOverlay();
        }
        document.body.addEventListener('click', closeOverlay);
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' || e.key === 'Enter') {
            closeOverlay();
          }
        });
      })();
    `
      )
      .catch(() => {
        console.log("===> Failed to inject overlay close handler");
      });
  });
}

async function getSoundSettings(): Promise<{
  soundEnabled: boolean;
  soundVolume: number;
}> {
  // Try to get settings from main window's localStorage
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      const settings = await mainWindow.webContents.executeJavaScript(`
        (() => {
          try {
            const stored = localStorage.getItem('focus-reminder-settings');
            if (stored) {
              const parsed = JSON.parse(stored);
              return {
                soundEnabled: parsed.state?.settings?.soundEnabled ?? true,
                soundVolume: parsed.state?.settings?.soundVolume ?? 30
              };
            }
          } catch (e) {}
          return { soundEnabled: true, soundVolume: 30 };
        })()
      `);
      return settings;
    } catch (error) {
      console.log("===> Error getting sound settings:", error);
      return { soundEnabled: true, soundVolume: 30 };
    }
  }
  return { soundEnabled: true, soundVolume: 30 };
}

async function playSoundFromMainWindow(volume: number): Promise<void> {
  // Play sound from main window using the sound utility
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      // Use dynamic import to get the sound utility and play sound
      await mainWindow.webContents.executeJavaScript(`
        (async () => {
          try {
            // Try to import and use the sound utility
            const soundModule = await import('/src/utils/sound.ts');
            if (soundModule && soundModule.playNotificationSound) {
              await soundModule.playNotificationSound(${volume});
            } else {
              console.error('===> Sound utility function not found');
            }
          } catch (error) {
            console.error('===> Error playing sound from main window:', error);
          }
        })()
      `);
    } catch (error) {
      console.log("===> Error executing sound play in main window:", error);
    }
  }
}

async function showNotification(
  icon: string,
  message: string,
  color: string,
  displayMinutes: number
) {
  // Get sound settings
  const soundSettings = await getSoundSettings();

  // Play sound immediately if enabled
  if (soundSettings.soundEnabled) {
    playSoundFromMainWindow(soundSettings.soundVolume).catch((error) => {
      console.error("===> Error playing sound on notification:", error);
    });
  }

  // Try native notification first
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: "Focus Reminder Desktop",
      body: `${icon} ${message}`,
      silent: !soundSettings.soundEnabled,
      urgency: "critical",
    });

    notification.show();

    notification.on("click", () => {
      // Show overlay on click for stronger reminder
      createOverlayWindow(
        icon,
        message,
        color,
        displayMinutes,
        soundSettings.soundEnabled,
        soundSettings.soundVolume
      );
    });
  }

  // Also show overlay for stronger reminder
  createOverlayWindow(
    icon,
    message,
    color,
    displayMinutes,
    soundSettings.soundEnabled,
    soundSettings.soundVolume
  );
}

function scheduleReminder(reminder: {
  id: string;
  message: string;
  icon: string;
  color: string;
  type: (typeof REMINDER_TYPE)[keyof typeof REMINDER_TYPE];
  interval?: number;
  times?: string[];
  displayMinutes: number;
  enabled: boolean;
}) {
  // Clear existing scheduler for this reminder
  clearReminderScheduler(reminder.id);

  if (!reminder.enabled) return;

  const icon = reminder.icon || "💧";
  const displayMinutes = reminder.displayMinutes || 1;

  if (reminder.type === REMINDER_TYPE.INTERVAL && reminder.interval) {
    // Interval-based reminder
    const intervalMs = reminder.interval * 60 * 1000;

    const intervalId = setInterval(() => {
      showNotification(
        icon,
        reminder.message,
        reminder.color,
        displayMinutes
      ).catch((err) => {
        console.error("===> Error showing notification:", err);
      });
    }, intervalMs);

    reminderIntervals.set(reminder.id, intervalId);
  } else if (
    reminder.type === REMINDER_TYPE.SCHEDULED &&
    reminder.times &&
    reminder.times.length > 0
  ) {
    // Scheduled reminder with multiple times
    // Check every minute
    const checkInterval = setInterval(() => {
      const now = new Date();
      const currentTimeKey = `${now.getHours()}:${now.getMinutes()}`;
      const lastTrigger = lastFixedTimeTriggers.get(reminder.id);

      // Check if current time matches any scheduled time
      const shouldTrigger = reminder.times!.some((time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return now.getHours() === hours && now.getMinutes() === minutes;
      });

      // Only trigger if it's the right time and we haven't triggered in this minute
      if (shouldTrigger && lastTrigger !== currentTimeKey) {
        lastFixedTimeTriggers.set(reminder.id, currentTimeKey);
        showNotification(
          icon,
          reminder.message,
          reminder.color,
          displayMinutes
        ).catch((err) => {
          console.error("===> Error showing notification:", err);
        });
      }
    }, 60000); // Check every minute

    fixedTimeCheckers.set(reminder.id, checkInterval);
  }
}

function clearReminderScheduler(id: string) {
  if (reminderIntervals.has(id)) {
    clearInterval(reminderIntervals.get(id));
    reminderIntervals.delete(id);
  }
  if (fixedTimeCheckers.has(id)) {
    clearInterval(fixedTimeCheckers.get(id));
    fixedTimeCheckers.delete(id);
  }
  lastFixedTimeTriggers.delete(id);
}

function clearAllSchedulers() {
  reminderIntervals.forEach((interval) => clearInterval(interval));
  fixedTimeCheckers.forEach((interval) => clearInterval(interval));
  reminderIntervals.clear();
  fixedTimeCheckers.clear();
  lastFixedTimeTriggers.clear();
}

function createTray() {
  const icon = nativeImage.createFromPath(getIconPath());

  // Resize icon for tray (16x16 for better visibility)
  const trayIcon = icon.resize({ width: 16, height: 16 });
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show Window",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createMainWindow();
        }
      },
    },
    {
      label: "Hide Window",
      click: () => {
        mainWindow?.hide();
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        isQuitting = true;
        clearAllSchedulers();
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Focus Reminder Desktop");
  tray.setContextMenu(contextMenu);

  // Double click to show/hide window
  tray.on("double-click", () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      } else {
        createMainWindow();
      }
    }
  });

  console.log("===> System tray created");
}

// IPC Handlers
ipcMain.handle("schedule-reminder", (_, reminder) => {
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
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
    overlayWindow = null;
  }
});

ipcMain.on("play-notification-sound", (_, volume: number) => {
  playSoundFromMainWindow(volume).catch((error) => {
    console.error("===> Error playing sound via IPC:", error);
  });
});

ipcMain.on("window-minimize", () => {
  mainWindow?.minimize();
});

ipcMain.on("window-maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on("window-close", () => {
  // Hide to tray instead of closing
  mainWindow?.hide();
});

// App lifecycle
app.whenReady().then(() => {
  // Request notification permission
  if (Notification.isSupported()) {
    console.log("===> Notifications supported");
  }

  createTray();
  createMainWindow();

  app.on("activate", () => {
    if (mainWindow === null) {
      createMainWindow();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

// Keep app running in background - don't quit when window is closed
app.on("window-all-closed", () => {
  // Don't quit - keep running in background for notifications
  // Only quit explicitly via tray menu or before-quit
  console.log("===> All windows closed, keeping app running in background");
});

app.on("before-quit", () => {
  isQuitting = true;
  clearAllSchedulers();
  if (tray) {
    tray.destroy();
    tray = null;
  }
});
