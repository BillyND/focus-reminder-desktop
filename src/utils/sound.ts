// ============================================
// SOUND UTILITIES
// ============================================

// Get sound file path - works in both dev and production
function getSoundFilePath(): string {
  // Check if we're in production (file:// protocol) or dev (http:// protocol)
  const isProduction = window.location.protocol === "file:";
  
  if (isProduction) {
    // In production Electron app, use relative path
    // File is in the same directory as index.html in dist folder
    return "./alarm.mp3";
  } else {
    // In dev mode with Vite dev server, use absolute path
    try {
      return new URL("/alarm.mp3", window.location.origin).href;
    } catch {
      return "/alarm.mp3";
    }
  }
}

let audioElement: HTMLAudioElement | null = null;
let soundInterval: NodeJS.Timeout | null = null;
let audioLoadPromise: Promise<void> | null = null;
let currentPlayPromise: Promise<void> | null = null;

// Initialize audio element (lazy initialization)
function getAudioElement(): HTMLAudioElement {
  if (!audioElement) {
    try {
      const soundPath = getSoundFilePath();
      console.log("===> Initializing audio with path:", soundPath);
      audioElement = new Audio(soundPath);
      audioElement.preload = "auto";
    } catch (error) {
      console.error("===> Failed to create audio element:", error);
      throw new Error("Audio initialization failed");
    }

    if (!audioElement) {
      console.error("===> Audio element is null after creation");
      throw new Error("Audio initialization failed");
    }

    // Store reference for event handlers
    const currentAudio = audioElement;

    // Set up error handlers
    currentAudio.addEventListener("error", () => {
      console.error("===> Audio element error");
      const error = currentAudio.error;
      if (error) {
        console.error("===> Audio error code:", error.code);
        console.error("===> Audio error message:", error.message);
      }
    });

    currentAudio.addEventListener("loadstart", () => {
      console.log("===> Audio loading started");
    });

    currentAudio.addEventListener("canplay", () => {
      console.log("===> Audio can play");
    });

    currentAudio.addEventListener("canplaythrough", () => {
      console.log("===> Audio fully loaded and ready");
    });

    // Preload audio
    audioLoadPromise = new Promise<void>((resolve, reject) => {
      const handleCanPlay = () => {
        currentAudio.removeEventListener("canplay", handleCanPlay);
        currentAudio.removeEventListener("error", handleError);
        resolve();
      };

      const handleError = () => {
        currentAudio.removeEventListener("canplay", handleCanPlay);
        currentAudio.removeEventListener("error", handleError);
        reject(new Error("Audio failed to load"));
      };

      currentAudio.addEventListener("canplay", handleCanPlay, { once: true });
      currentAudio.addEventListener("error", handleError, { once: true });

      // If already loaded, resolve immediately
      if (currentAudio.readyState >= 2) {
        resolve();
      }
    });
  }

  if (!audioElement) {
    throw new Error("Audio element not initialized");
  }

  return audioElement;
}

// Play sound with volume control (single play)
export async function playNotificationSound(volume: number): Promise<void> {
  try {
    const audio = getAudioElement();

    // Wait for audio to be ready if not already loaded
    if (audioLoadPromise && audio.readyState < 2) {
      try {
        await audioLoadPromise;
      } catch (error) {
        console.error("===> Audio failed to load:", error);
        // Try to continue anyway - might work in some cases
      }
    }

    // Set volume (0-100 to 0-1)
    audio.volume = Math.max(0, Math.min(1, volume / 100));

    // Reset to start
    audio.currentTime = 0;

    // Ensure audio is not paused before playing
    if (audio.paused) {
      // Audio was paused, need to ensure it can play
      console.log("===> Audio was paused, resuming playback");
    }

    const playPromise = audio.play();
    currentPlayPromise = playPromise;

    if (playPromise !== undefined) {
      await playPromise
        .catch((error) => {
          console.error("===> Error playing notification sound:", error);
          // Common error: user interaction required
          if (error.name === "NotAllowedError") {
            console.error(
              "===> Audio play blocked - user interaction required"
            );
          }
          throw error;
        })
        .finally(() => {
          if (currentPlayPromise === playPromise) {
            currentPlayPromise = null;
          }
        });
    }
  } catch (error) {
    console.error("===> Error in playNotificationSound:", error);
    throw error;
  }
}

// Play sound and return promise that resolves when sound ends
export async function playNotificationSoundUntilEnd(
  volume: number
): Promise<void> {
  try {
    const audio = getAudioElement();

    // Wait for audio to be ready if not already loaded
    if (audioLoadPromise && audio.readyState < 2) {
      try {
        await audioLoadPromise;
      } catch (error) {
        console.error("===> Audio failed to load:", error);
        // Try to continue anyway - might work in some cases
      }
    }

    // Set volume (0-100 to 0-1)
    audio.volume = Math.max(0, Math.min(1, volume / 100));

    // Reset to start
    audio.currentTime = 0;

    // Play and wait for it to end
    const playPromise = audio.play();
    currentPlayPromise = playPromise;

    if (playPromise !== undefined) {
      await playPromise.catch((error) => {
        console.error("===> Error playing notification sound:", error);
        if (error.name === "NotAllowedError") {
          console.error("===> Audio play blocked - user interaction required");
        }
        throw error;
      });
    }

    // Wait for sound to end
    return new Promise<void>((resolve, reject) => {
      let isResolved = false;
      let checkInterval: NodeJS.Timeout | null = null;

      const cleanup = () => {
        if (isResolved) return;
        isResolved = true;
        if (checkInterval) {
          clearInterval(checkInterval);
        }
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);
        if (currentPlayPromise === playPromise) {
          currentPlayPromise = null;
        }
      };

      const handleEnded = () => {
        cleanup();
        resolve();
      };

      const handleError = () => {
        cleanup();
        reject(new Error("Audio playback error"));
      };

      checkInterval = setInterval(() => {
        // Check if audio was stopped manually (paused and reset to start)
        // This happens when stopAllSounds() is called
        if (audio.paused && audio.currentTime === 0 && audio.readyState > 0) {
          cleanup();
          resolve();
        }
      }, 10);

      audio.addEventListener("ended", handleEnded, { once: true });
      audio.addEventListener("error", handleError, { once: true });
    });
  } catch (error) {
    console.error("===> Error in playNotificationSoundUntilEnd:", error);
    throw error;
  }
}

// Play sound repeatedly with interval (for notifications)
export function playNotificationSoundRepeatedly(
  volume: number,
  intervalMs: number = 5000
): () => void {
  // Stop any existing repeated sound
  stopRepeatedSound();

  // Play immediately (don't await to avoid blocking)
  playNotificationSound(volume).catch((error) => {
    console.error("===> Error in initial repeated sound play:", error);
  });

  // Set up interval to play every intervalMs
  soundInterval = setInterval(() => {
    playNotificationSound(volume).catch((error) => {
      console.error("===> Error in repeated sound play:", error);
    });
  }, intervalMs);

  // Return stop function
  return stopRepeatedSound;
}

// Stop repeated sound
export function stopRepeatedSound(): void {
  if (soundInterval) {
    clearInterval(soundInterval);
    soundInterval = null;
  }
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
}

// Stop all sounds (both single and repeated)
export function stopAllSounds(): void {
  console.log("===> Stopping all sounds");

  // Stop interval first
  if (soundInterval) {
    clearInterval(soundInterval);
    soundInterval = null;
  }

  // Stop audio element immediately
  if (audioElement) {
    try {
      // Pause immediately to stop sound
      audioElement.pause();

      // Reset to beginning
      audioElement.currentTime = 0;

      // Set volume to 0 temporarily to ensure no sound plays
      // But don't keep it at 0, just pause is enough

      console.log("===> Audio stopped");
    } catch (error) {
      console.error("===> Error stopping all sounds:", error);
      // Try to pause anyway even if other operations fail
      try {
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
        }
      } catch (e) {
        console.error("===> Error in fallback stop:", e);
      }
    }
  }

  // Clear play promise reference
  currentPlayPromise = null;
}
