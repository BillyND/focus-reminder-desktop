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

export async function stopSoundFromMainWindow(): Promise<void> {
  const mainWindow = getMainWindow();

  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      await mainWindow.webContents.executeJavaScript(`
        (async () => {
          try {
            const soundModule = await import('/src/utils/sound.ts');
            if (soundModule && soundModule.stopAllSounds) {
              soundModule.stopAllSounds();
            } else if (soundModule && soundModule.stopRepeatedSound) {
              soundModule.stopRepeatedSound();
            } else {
              console.error('===> Sound stop function not found');
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