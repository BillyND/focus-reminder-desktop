import { createOverlayWindow } from "../windows/overlayWindow";
import {
  getSoundSettings,
  playSoundFromMainWindow,
} from "./soundService";

export async function showNotification(
  icon: string,
  message: string,
  color: string,
  displayMinutes: number,
  reminderId: string | null = null
): Promise<void> {
  const soundSettings = await getSoundSettings();

  if (soundSettings.soundEnabled) {
    playSoundFromMainWindow(soundSettings.soundVolume).catch((error) => {
      console.error("===> Error playing sound on notification:", error);
    });
  }

  createOverlayWindow(
    icon,
    message,
    color,
    displayMinutes,
    soundSettings.soundEnabled,
    soundSettings.soundVolume,
    reminderId
  );
}

