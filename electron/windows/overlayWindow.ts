import { BrowserWindow, screen } from "electron";
import path from "path";
import { getSoundFilePath } from "../config/paths";

interface OverlayWindowData {
  window: BrowserWindow;
  autoCloseTimeout: NodeJS.Timeout | null;
  reminderId: string | null;
}

// Track multiple overlay windows per reminder ID
const overlayWindowsByReminderId: Map<
  string,
  Set<OverlayWindowData>
> = new Map();
let overlayWindow: BrowserWindow | null = null;
let overlayAutoCloseTimeout: NodeJS.Timeout | null = null;

export function getOverlayWindow(): BrowserWindow | null {
  return overlayWindow;
}

function clearAutoCloseTimeout(): void {
  if (overlayAutoCloseTimeout) {
    clearTimeout(overlayAutoCloseTimeout);
    overlayAutoCloseTimeout = null;
  }
}

function stopOverlaySound(): void {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    try {
      overlayWindow.webContents
        .executeJavaScript(
          `
        (function() {
          if (typeof stopRepeatedSound === 'function') {
            stopRepeatedSound();
          }
        })();
      `
        )
        .catch(() => {
          // Ignore errors if overlay is already closing
        });
    } catch (error) {
      console.log("===> Error stopping sound in overlay:", error);
    }
  }
}

function stopOverlaySoundForWindow(window: BrowserWindow): void {
  if (window && !window.isDestroyed()) {
    try {
      window.webContents
        .executeJavaScript(
          `
        (function() {
          if (typeof stopRepeatedSound === 'function') {
            stopRepeatedSound();
          }
        })();
      `
        )
        .catch(() => {
          // Ignore errors if overlay is already closing
        });
    } catch (error) {
      console.log("===> Error stopping sound in overlay:", error);
    }
  }
}

function closeOverlayWindow(
  window: BrowserWindow,
  reminderId: string | null
): void {
  if (window && !window.isDestroyed()) {
    stopOverlaySoundForWindow(window);
    window.close();
  }
}

export function closeAllOverlays(): void {
  console.log("===> Closing all existing overlays");

  overlayWindowsByReminderId.forEach((windowsSet, reminderId) => {
    windowsSet.forEach((data) => {
      if (data.autoCloseTimeout) {
        clearTimeout(data.autoCloseTimeout);
      }
      closeOverlayWindow(data.window, reminderId);
    });
  });

  overlayWindowsByReminderId.clear();

  // Legacy support
  clearAutoCloseTimeout();
  stopOverlaySound();

  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
    overlayWindow = null;
  }
}

export function closeOverlaysByReminderId(reminderId: string): void {
  console.log(`===> Closing all overlays for reminder ID: ${reminderId}`);

  const windowsSet = overlayWindowsByReminderId.get(reminderId);
  if (windowsSet) {
    windowsSet.forEach((data) => {
      if (data.autoCloseTimeout) {
        clearTimeout(data.autoCloseTimeout);
      }
      closeOverlayWindow(data.window, reminderId);
    });
    overlayWindowsByReminderId.delete(reminderId);
  }
}

function generateOverlayHTML(
  icon: string,
  message: string,
  color: string,
  displayMinutes: number,
  soundEnabled: boolean,
  soundVolume: number,
  soundFileUrl: string,
  reminderId: string | null
): string {
  return `
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
        
        function playNotificationSound(volume, soundUrl) {
          try {
            if (!audioElement) {
              console.log('===> Creating new audio element with URL:', soundUrl);
              audioElement = new Audio(soundUrl);
              audioElement.preload = "auto";
              
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
        
        function startRepeatedSound(volume, soundUrl) {
          playNotificationSound(volume, soundUrl);
          soundInterval = setInterval(() => {
            playNotificationSound(volume, soundUrl);
          }, 5000);
        }
        
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
        
        function initSound() {
          if (${soundEnabled}) {
            console.log('===> Starting repeated sound, volume:', ${soundVolume}, 'url:', '${soundFileUrl}');
            startRepeatedSound(${soundVolume}, '${soundFileUrl}');
          }
        }
        
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initSound);
        } else {
          initSound();
        }
        
        window.addEventListener('load', () => {
          if (${soundEnabled} && !soundInterval) {
            console.log('===> Window loaded, starting sound');
            initSound();
          }
        });
        
        function closeOverlay() {
          stopRepeatedSound();
          if (window.electronAPI) {
            ${
              reminderId
                ? `window.electronAPI.closeOverlayByReminderId('${reminderId}');`
                : "window.electronAPI.closeOverlay();"
            }
          }
        }
        document.body.addEventListener('click', closeOverlay);
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' || e.key === 'Enter') {
            closeOverlay();
          }
        });
        
        const displayDurationMs = ${displayMinutes * 60 * 1000};
        const autoCloseTimeout = setTimeout(() => {
          console.log('===> Auto-closing overlay after ${displayMinutes} minutes');
          closeOverlay();
        }, displayDurationMs);
        
        window.addEventListener('beforeunload', () => {
          clearTimeout(autoCloseTimeout);
          stopRepeatedSound();
        });
      </script>
    </body>
    </html>
  `;
}

function setupAutoClose(
  displayMinutes: number,
  window: BrowserWindow,
  reminderId: string | null,
  overlayData: OverlayWindowData
): void {
  const timeout = setTimeout(() => {
    console.log(`===> Auto-closing overlay after ${displayMinutes} minutes`);
    closeOverlayWindow(window, reminderId);
    if (reminderId) {
      const windowsSet = overlayWindowsByReminderId.get(reminderId);
      if (windowsSet) {
        windowsSet.delete(overlayData);
        if (windowsSet.size === 0) {
          overlayWindowsByReminderId.delete(reminderId);
        }
      }
    }
  }, displayMinutes * 60 * 1000);

  overlayData.autoCloseTimeout = timeout;

  if (!reminderId) {
    // Legacy support
    if (overlayAutoCloseTimeout) {
      clearTimeout(overlayAutoCloseTimeout);
    }
    overlayAutoCloseTimeout = timeout;
  }
}

function injectCloseHandler(
  window: BrowserWindow,
  reminderId: string | null
): void {
  window.webContents
    .executeJavaScript(
      `
      (function() {
        function closeOverlay() {
          if (window.electronAPI) {
            ${
              reminderId
                ? `window.electronAPI.closeOverlayByReminderId('${reminderId}');`
                : "window.electronAPI.closeOverlay();"
            }
          }
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
}

export function createOverlayWindow(
  icon: string,
  message: string,
  color: string,
  displayMinutes: number,
  soundEnabled: boolean = true,
  soundVolume: number = 30,
  reminderId: string | null = null
): void {
  // Close existing overlays for the same reminder ID before creating new one
  if (reminderId) {
    closeOverlaysByReminderId(reminderId);
  } else {
    // If no reminder ID, close all overlays (legacy behavior for test notifications)
    closeAllOverlays();
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const soundFilePath = getSoundFilePath();
  const soundFileUrl = `file://${soundFilePath.replace(/\\/g, "/")}`;

  const newOverlayWindow = new BrowserWindow({
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

  newOverlayWindow.setVisibleOnAllWorkspaces(true);
  newOverlayWindow.setAlwaysOnTop(true, "screen-saver");

  const overlayHTML = generateOverlayHTML(
    icon,
    message,
    color,
    displayMinutes,
    soundEnabled,
    soundVolume,
    soundFileUrl,
    reminderId
  );

  newOverlayWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(overlayHTML)}`
  );

  // Track window by reminder ID
  const overlayData: OverlayWindowData = {
    window: newOverlayWindow,
    autoCloseTimeout: null,
    reminderId: reminderId,
  };

  if (reminderId) {
    if (!overlayWindowsByReminderId.has(reminderId)) {
      overlayWindowsByReminderId.set(reminderId, new Set());
    }
    overlayWindowsByReminderId.get(reminderId)!.add(overlayData);
  } else {
    // Legacy support
    overlayWindow = newOverlayWindow;
  }

  newOverlayWindow.on("closed", () => {
    if (reminderId) {
      const windowsSet = overlayWindowsByReminderId.get(reminderId);
      if (windowsSet) {
        if (overlayData.autoCloseTimeout) {
          clearTimeout(overlayData.autoCloseTimeout);
        }
        windowsSet.delete(overlayData);
        if (windowsSet.size === 0) {
          overlayWindowsByReminderId.delete(reminderId);
        }
      }
    } else {
      clearAutoCloseTimeout();
      overlayWindow = null;
    }
  });

  newOverlayWindow.once("ready-to-show", () => {
    setupAutoClose(displayMinutes, newOverlayWindow, reminderId, overlayData);
  });

  newOverlayWindow.webContents.on("did-finish-load", () => {
    injectCloseHandler(newOverlayWindow, reminderId);
  });
}
