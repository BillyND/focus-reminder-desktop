import { getMainWindow } from "../windows/mainWindow";
import type { SoundSettings } from "../types";

export async function getSoundSettings(): Promise<SoundSettings> {
  const mainWindow = getMainWindow();

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
                soundVolume: parsed.state?.settings?.soundVolume ?? 50
              };
            }
          } catch (e) {}
          return { soundEnabled: true, soundVolume: 50 };
        })()
      `);
      return settings;
    } catch (error) {
      console.log("===> Error getting sound settings:", error);
      return { soundEnabled: true, soundVolume: 50 };
    }
  }
  return { soundEnabled: true, soundVolume: 50 };
}

export async function playSoundFromMainWindow(volume: number): Promise<void> {
  const mainWindow = getMainWindow();

  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      await mainWindow.webContents.executeJavaScript(`
        (async () => {
          try {
            // Use exposed sound functions from window object
            if (window.__soundFunctions && window.__soundFunctions.playNotificationSound) {
              await window.__soundFunctions.playNotificationSound(${volume});
            } else {
              console.error('===> Sound functions not found on window object');
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

export async function stopSoundFromMainWindow(): Promise<void> {
  const mainWindow = getMainWindow();

  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      await mainWindow.webContents.executeJavaScript(`
        (() => {
          try {
            // Use exposed sound functions from window object
            if (window.__soundFunctions) {
              if (window.__soundFunctions.stopAllSounds) {
                window.__soundFunctions.stopAllSounds();
              } else if (window.__soundFunctions.stopRepeatedSound) {
                window.__soundFunctions.stopRepeatedSound();
              } else {
                console.error('===> Sound stop function not found');
              }
            } else {
              console.error('===> Sound functions not found on window object');
            }
          } catch (error) {
            console.error('===> Error stopping sound from main window:', error);
          }
        })()
      `);
    } catch (error) {
      console.log("===> Error executing sound stop in main window:", error);
    }
  }
}
