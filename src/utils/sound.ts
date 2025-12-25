// ============================================
// SOUND UTILITIES
// ============================================

// Get sound file path - works in both dev and production
function getSoundFilePath(): string {
  // In Vite, public folder files are served from root
  // Try to use URL constructor for better path resolution
  try {
    // For Vite dev server and production build
    return new URL("/alarm.mp3", window.location.origin).href;
  } catch {
    // Fallback to relative path
    return "/alarm.mp3";
  }
}

let audioElement: HTMLAudioElement | null = null;
let soundInterval: NodeJS.Timeout | null = null;
let audioLoadPromise: Promise<void> | null = null;

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
export async function playNotificationSound(
  volume: number = 30
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

    // Reset to start and play
    audio.currentTime = 0;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      await playPromise.catch((error) => {
        console.error("===> Error playing notification sound:", error);
        // Common error: user interaction required
        if (error.name === "NotAllowedError") {
          console.error("===> Audio play blocked - user interaction required");
        }
        throw error;
      });
    }
  } catch (error) {
    console.error("===> Error in playNotificationSound:", error);
    throw error;
  }
}

// Play sound repeatedly with interval (for notifications)
export function playNotificationSoundRepeatedly(
  volume: number = 30,
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
}
